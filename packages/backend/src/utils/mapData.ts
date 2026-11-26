// To be folded into statsCache.ts

import { app, InvocationContext } from '@azure/functions';
import { ClientSecretCredential } from "@azure/identity";
import countries from "i18n-iso-countries";
import * as z from "zod";

// 
const QueryResponse = z.object({
    tables: z.array(z.object({ rows: z.array(z.unknown()) })).min(1)
})

const directoryId = process.env["AZURE_TENANT_ID"];
const appRegistrationId = process.env["AZURE_CLIENT_ID"];
const secretValue = process.env["AZURE_CLIENT_SECRET"];
const workspaceId = process.env["AZURE_WORKSPACE_ID"];

// Helper Function 

async function getToken(): Promise<string> {
    const credential = new ClientSecretCredential(directoryId, appRegistrationId, secretValue);
    const tokenResponse = await credential.getToken("https://api.loganalytics.io/.default");
    return tokenResponse.token;
}

export async function runQuery<T extends z.ZodTypeAny>(query: string, rowSchema: T, context?: InvocationContext): Promise<z.infer<T>[]> {
    const token = await getToken();
    const log = context ?? console;

    try {
        const result = await fetch(
            `https://api.loganalytics.io/v1/workspaces/${workspaceId}/query`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ query })
            }
        );

        if (!result.ok) {
            log.error(`Query failed: ${result.status} ${await result.text()}`);   // shows KQL errors
            return [];
        }

        const parsedResponse = QueryResponse.safeParse(await result.json())
        if (!parsedResponse.success) {
            log.error(`Unexpected Log Analytics repsonse: ${parsedResponse.error.message}`)
            return []
        }

        const rows = z.array(rowSchema).safeParse(parsedResponse.data.tables[0].rows);
        if (!rows.success) {
            log.error(`Rows dont match schema: ${rows.error.message}`)
            return []
        }
        return rows.data
    } catch(error) {
        log.error(`Leaving runQuery: error occurred: ${error}`)
        return []
    }
}

// Return Types
interface LocationStat {
    requests: number;
    failed: number;
    responseTime: number;
    weeks: {};
}

// Zod Schema
// day, country, state, city, req, failed, rresponseTime

class MapData {

    // Variables
    private requestStats = null;
    private countryStats = {};
    private stateStats = {};
    private cityStats = {};

    // The running update for each cache
    private rquestsUpdate = null 



    // Getter
    async getRequestStats(context?: InvocationContext) {
        if (this.requestStats === null) {
            // wait for update, and if its null call the updater function as backup
            await (this.rquestsUpdate ??= this.updateRequests(context));
        }

        return this.requestStats;
    }

    getCountryStats(): Record<string, LocationStat> {
        return this.countryStats;
        
    }

    getStateStats(): Record<string, LocationStat & {iso: string}> {
        return this.stateStats;
    }

    getCityStats(): Record<string, LocationStat & {iso: string, stateKey: string}> {
        return this.cityStats;
    }

    // Updater Function
    async updateRequests(context?: InvocationContext): Promise <void> {
        const RequestRow = z.tuple([
            z.string(), 
            z.string(),
            z.string(),
            z.string(),
            z.number(),
            z.number(),
            z.number(),
        ]);

        const rows = await runQuery(`
            AppRequests
            | where TimeGenerated > ago(365d)
            | extend 
                day = bin(TimeGenerated, 7d), 
                country = ClientCountryOrRegion, 
                state = ClientStateOrProvince, 
                city = ClientCity
            | summarize 
                requests = count(),
                failed = countif(Success == false),
                responseTime = sum(DurationMs)
                by day, country, state, city
            | order by country asc, state asc, city asc, day asc
        `, RequestRow, context);
        
        this.requestStats = rows
    }


    // Group requests by country 
    async sumByCountry(context?: InvocationContext) {
        this.countryStats = await this.sumBy("country", context);
    }

    // Group requests by state 
    async sumByState(context?: InvocationContext) {
        this.stateStats = await this.sumBy("state", context);
    }

    async sumByCity(context?: InvocationContext) {
        this.cityStats = await this.sumBy("city", context)
    }

    async sumBy(level: "country" | "state" | "city", context?: InvocationContext){
        const stats = {};
        const log = context ?? console;
        
        for (const [day, country, state, city, requests, failed, responseTime] of await this.getRequestStats(context)) {
            if (!country) continue;
            
            // covert country name to iso, so mapbox can query it
            const iso = countries.getAlpha2Code(country, "en");
            
            // if not there must add manually
            if (!iso) { 
                log.log(`No ISO code for "${country}"`); 
                continue; 
            }

            const weekKey = String(day).slice(0, 10)

            let key = ''
            if (level === "state") {
                if (!state) continue;
                key = `${iso}|${state.toLowerCase()}`
                if (stats[key] === null || stats[key] === undefined) {
                    stats[key] = { name: state, iso, requests: 0, failed: 0, responseTime: 0, weeks: {} }
                }
            } else if (level === "city") {
                if (!state) continue;
                const stateKey = `${iso}|${state.toLowerCase()}`;
                key = `${stateKey}|${city.toLowerCase()}`
                if (stats[key] === null || stats[key] === undefined) {
                    stats[key] = { name: city, iso, stateKey, requests: 0, failed: 0, responseTime: 0, weeks: {} }
                }
            } else {
                key = iso
                if (stats[key] === null || stats[iso] === undefined) {
                    stats[key] = {name: country, requests: 0, failed: 0, responseTime:0, weeks: {}}
                }
            }
            

            const locationTotal = stats[key]
            locationTotal.requests += requests
            locationTotal.failed += failed
            locationTotal.responseTime += responseTime

            // group data by week
            if (locationTotal.weeks[weekKey] === null || locationTotal.weeks[weekKey] === undefined) {
                locationTotal.weeks[weekKey] = {requests: 0, failed: 0, responseTime: 0}
            }

            locationTotal.weeks[weekKey].requests += requests
            locationTotal.weeks[weekKey].failed += failed
            locationTotal.weeks[weekKey].responseTime += responseTime
        }
        return stats;  
    }


    // Refresh Function
    async mapRefresh(context?: InvocationContext) {
        const log = context ?? console;
        log.log('Refreshing map data...');
        await this.updateRequests(context); // update the requests FIRST
         await Promise.allSettled([
            this.sumByCountry(context),
            this.sumByState(context),
            this.sumByCity(context),
         ])

        log.log('Map data refreshed :D');
    }

}

export const mapData = new MapData();

// Timer trigger
app.hook.appStart(() => {
    mapData.mapRefresh()
});

// Timer trigger to refresh usage stats every hour
app.timer('refreshMapStats', {
    schedule: '0 0 * * * *',
    handler: async (_myTimer, context) => {
        try {
            context.log('Refreshing usage stats cache');
            await mapData.mapRefresh(context);
        } catch (error) {
            context.error('Error occured while refreshing usage stats cache: ', error)
        }
    },
}); 