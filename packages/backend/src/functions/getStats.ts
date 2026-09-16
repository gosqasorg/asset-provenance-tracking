import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { usageStatsCache } from '../utils/statsCache.js';

const directoryId = process.env["AZURE_TENANT_ID"];
const appRegistrationId = process.env["AZURE_CLIENT_ID"];
const secretValue = process.env["AZURE_CLIENT_SECRET"];
const workspaceId = process.env["AZURE_WORKSPACE_ID"];

if(![directoryId, appRegistrationId, secretValue, workspaceId].every(Boolean)) {
    console.error('getStats Error: credentials not set'); 
    //throw new Error('Error: getStats credentials not set not set.') 
}

const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${directoryId}/oauth2/v2.0/token`,
    {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: appRegistrationId!,
            client_secret: secretValue!,
            grant_type: "client_credentials",
            scope: "https://api.loganalytics.io/.default"
        })
    }
);

const { access_token: token } = await tokenResponse.json();


export async function runQuery(query: string, context): Promise<[string, number][]> {
    context.log('Entering runQuery')

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

        context.log(`Query result: ${JSON.stringify(result)}`)
        const data = await result.json();
        context.log('Returning from runQuery: Success')
        return data.tables[0].rows
    } catch(error) {
        context.log(`Leaving runQuery: error occurred: ${error}`)
    }
}

// TODO: update getBrowserStats to call StatsCache for retrieving statistics 
async function getBrowserStats(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Entering getBrowserStats')
    try {
        const rows = usageStatsCache.getBrowserStats();
        return { body: JSON.stringify(rows), status: 200, headers: { 'Content-Type': 'application/json' } };
    } catch (error) {
        context.log("getBrowserStats error:", error);
        return { body: "Error fetching browser stats", status: 500 }
    }
}

app.get("getBrowserStats", {
    authLevel: 'anonymous',
    route: 'stats/browsers',
    handler: getBrowserStats
})