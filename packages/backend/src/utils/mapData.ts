// To be folded into statsCache.ts
// TODO: Add zod-validation
// TODO: user consistency in requestStats (shuouldnt be requestsStats)

import { app, InvocationContext } from '@azure/functions';
import { ClientSecretCredential } from "@azure/identity";
import { countryToAlpha2 } from "country-to-iso";

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

export async function runQuery(query: string, context: InvocationContext): Promise<[string, number][]> {
    const token = await getToken();

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
            context.error(`Query failed: ${result.status} ${await result.text()}`);   // shows KQL errors
            return [];
        }

        const data = await result.json();
        context.log(data);
        return data.tables[0].rows
    } catch(error) {
        context.error(`Leaving runQuery: error occurred: ${error}`)
    }
}

class MapData {
    // Variables
    private requestStats = null;
    private countryStats = {};
    private stateStats = {};
    private cityStats = {};


    // Getter
    getRequestStats() {
        return this.requestStats;
    }

    getCountryStats() {
        return this.countryStats;
    }

    getStateStats() {
        return this.stateStats;
    }

    getCityStats() {
        return this.cityStats;
    }

    // Updater Function
    async updateRequests(context: InvocationContext): Promise <void> {
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
        `, context);
        
        this.requestStats = rows
    }


    // Group requests by country 
    sumByCountry(context: InvocationContext) {
        this.countryStats = this.stateStats = this.sumBy(context, "country");
    }

    // Group requests by state 
    sumByState(context: InvocationContext) {
        this.stateStats = this.sumBy(context, "state");
    }

    sumBy(context: InvocationContext, level: "country" | "state"){
        const stats = {};
        
        for (const [day, country, state, city, requests, failed, responseTime] of this.requestStats) {
            if (!country) continue;
            
            // covert country name to iso, so mapbox can query it
            const iso = countryToAlpha2(country);
            
            // if not there must add manually
            if (!iso) { 
                context.log(`No ISO code for "${country}"`); 
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

            // group data by week, azure uses monday as the start of the week
            if (locationTotal.weeks[weekKey] === null || locationTotal.weeks[weekKey] === undefined) {
                locationTotal.weeks[weekKey] = {requests: 0, failed: 0, responseTime: 0}
            }

            locationTotal.weeks[weekKey].requests += requests
            locationTotal.weeks[weekKey].failed += failed
            locationTotal.weeks[weekKey].responseTime += responseTime
        }
        return stats;  
    }

    // Group requests by city 
    sumByCity(context: InvocationContext) {
        const stats = {};
        
        for (const [day, country, state, city, requests, failed,] of this.requestStats) {
            if (!country || !state) continue;
            
            const iso = countryToAlpha2(country);
            
            // incase not there
            if (!iso) { 
                context.log(`No ISO code for "${country}"`); 
                continue; 
            }
            
            // using iso|state as key because duplicates
            const stateKey = `${iso}|${state.toLowerCase()}`;
            const key = `${stateKey}|${city.toLowerCase()}`;

            if (stats[key] === null || stats[key] === undefined) {
                stats[key] = { name: city, iso, stateKey, requests: 0 }
            }

            stats[key].requests += requests;
        }
        this.cityStats = stats;
    }

    // Refresh Function
    async mapRefresh(context: InvocationContext) {
        context.log('Refreshing map data...');
        await this.updateRequests(context);
        this.sumByCountry(context);
        this.sumByState(context);
        this.sumByCity(context);

        context.log('Map data refreshed :D');
    }

}

export const mapData = new MapData();

// Timer trigger
app.timer('refreshMapData', {
    schedule: '0 0 * * * *',
    runOnStartup: true,
    handler: (_myTimer, context) => mapData.mapRefresh(context),
})