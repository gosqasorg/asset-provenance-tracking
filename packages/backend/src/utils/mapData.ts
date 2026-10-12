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

    // Updater Function
    async updateRequests(context: InvocationContext): Promise <void> {
        const rows = await runQuery(`
            AppRequests
            | where TimeGenerated > ago(90d)
            | summarize
                requests = count(),
                failed  = countif(Success == false)
            by day     = bin(TimeGenerated, 1d),
                country = ClientCountryOrRegion,
                state   = ClientStateOrProvince,
                city    = ClientCity
        `, context);
        
        // TODO: add response time 

        this.requestStats = rows
    }


    // Group requests by country 
    // azure uses the country name, but the map uses the iso code - convert key to iso code
    sumByCountry(context: InvocationContext) {
        const stats = {};
        
        for (const [, country, , , requests, failed] of this.requestStats) {
            if (!country) continue;
            
            const iso = countryToAlpha2(country);
            
            // if not there must add manually
            if (!iso) { 
                context.log(`No ISO code for "${country}"`); 
                continue; 
            }
            
            // dont override existing entry,only add if not there
            if (stats[iso] === null || stats[iso] === undefined) {
                stats[iso] = { name: country, requests: 0, failed: 0 }
            }

            stats[iso].requests += requests;
            stats[iso].failed += failed;
        }
        this.countryStats = stats;
    }

    // Group requests by state 
    sumByState(context: InvocationContext) {
        const stats = {};
        
        for (const [, country, state, , requests, failed] of this.requestStats) {
            if (!country || !state) continue;
            
            const iso = countryToAlpha2(country);
            
            // incase not there
            if (!iso) { 
                context.log(`No ISO code for "${country}"`); 
                continue; 
            }
            
            // using iso|state as key because duplicates
            const key = `${iso}|${state.toLowerCase()}`;
            if (stats[key] === null || stats[key] === undefined) {
                stats[key] = { name: state, requests: 0, failed: 0 }
            }

            stats[key].requests += requests;
            stats[key].failed += failed;
        }
        this.stateStats = stats;
    }

    // Refresh Function
    async mapRefresh(context: InvocationContext) {
        context.log('Refreshing map data...');
        await this.updateRequests(context);
        this.sumByCountry(context);
        this.sumByState(context);

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