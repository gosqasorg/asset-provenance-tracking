// To be folded into statsCache.ts
// TODO: Add zod-validation
// TODO: user consistency in requestStats (shuouldnt be requestsStats)

import { app, InvocationContext } from '@azure/functions';
import { ClientSecretCredential } from "@azure/identity";

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


    // Getter
    getRequestStats() {
        return this.requestStats;
    }

    // Updater Function
    async updateRequests(context: InvocationContext): Promise <void> {
        const rows = await runQuery(`
            AppRequests
            | where TimeGenerated > ago(90d)
            | summarize
                requests = count()
            by day     = bin(TimeGenerated, 1d),
                country = ClientCountryOrRegion,
                state   = ClientStateOrProvince,
                city    = ClientCity
        `, context);
        
        // Add later failed Count  = countif(Success == false),
        // ms for time   = sum(DurationMs)

        context.log(`${rows}`);

        this.requestStats = rows
    }
    

    // Refresh Function
    async mapRefresh(context: InvocationContext) {
        context.log('Refreshing map data...');
        await this.updateRequests(context)

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