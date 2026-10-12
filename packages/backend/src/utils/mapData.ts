// To be folded into statsCache.ts
// TODO: Add zod-validation
// TODO: user consistency in requestStats (shuouldnt be requestsStats)

import { app, InvocationContext } from '@azure/functions';
import { ClientSecretCredential } from "@azure/identity";
import cities from "../../scripts/geocoding/cities.json";
import countries from '../../scripts/geocoding/countries.json';


const directoryId = process.env["AZURE_TENANT_ID"];
const appRegistrationId = process.env["AZURE_CLIENT_ID"];
const secretValue = process.env["AZURE_CLIENT_SECRET"];
const workspaceId = process.env["AZURE_WORKSPACE_ID"];

// Helper Function 
function norm(s: string) {
    return (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const nameToCountry = countries as Record<string, { iso: string; numeric: string }>;

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


    // Getter
    getRequestStats() {
        return this.requestStats;
    }

    getCountryStats() {
        return this.countryStats;
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
    sumByCountry(context: InvocationContext) {
        const stats = {};
        
        for (const [, country, , , requests, failed] of this.requestStats) {
            if (!country) continue;
            
            const match = nameToCountry[norm(country)] ?? null;
            
            // if not there must add manually
            if (!match) { 
                context.log(`No ISO code for "${country}"`); 
                continue; 
            }
            
            if (stats[match.iso] === null || stats[match.iso] === undefined) {
                stats[match.iso] = { name: country, numeric: match.numeric, requests: 0, failed: 0 }
            }

            stats[match.iso].requests += requests;
            stats[match.iso].failed += failed;
        }
        this.countryStats = stats;
    }

    // Refresh Function
    async mapRefresh(context: InvocationContext) {
        context.log('Refreshing map data...');
        await this.updateRequests(context);
        this.sumByCountry(context);

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