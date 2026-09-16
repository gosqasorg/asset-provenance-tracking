import { ContainerClient } from "@azure/storage-blob";
import { ClientSecretCredential } from "@azure/identity";

// Helper Function
export function findDeviceIdFromName(blobName: string): string {
    // blobNames look like: 'gosqas/63f4b781c0688d83d40908ff368fefa6a2fa4cd470216fd83b3d7d4c642578c0/prov/1a771caa4b15a45ae97b13d7a336e1e9c9ec1c91c70f1dc8f7749440c0af8114'
    // where the id is that last part (before the last slash)
    return blobName.split("/", 4)[1];
}

// Query Helper Funtions
const directoryId = process.env["AZURE_TENANT_ID"];
const appRegistrationId = process.env["AZURE_CLIENT_ID"];
const secretValue = process.env["AZURE_CLIENT_SECRET"];
const workspaceId = process.env["AZURE_WORKSPACE_ID"];

if(![directoryId, appRegistrationId, secretValue, workspaceId].every(Boolean)) {
    console.error('getStats Error: credentials not set'); 
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

class StatsCache {
    // Cache storage variables
    private totals = { totalRecords: 0, totalDevices: 0, totalAttachments: 0 };;
    private queryStats = null;
    private browserStats = [];

    // Getters
    getTotals()  {
        return this.totals;
    }

    getQueryStats() {
        return this.queryStats;
    }

    getBrowserStats() {
        return this.browserStats;
    }

    // Updater Functions that get called by the time trigger in refreshStats.ts to update the cache storage variables
    async updateTotals(containerClient: ContainerClient) : Promise<void> {
        const containerExists = await containerClient.exists();
        let totalRecords = 0;
        let totalAttachments = 0;
        const uniqueRecords = new Set<string>();

        if (containerExists) {
            for await (const blob of containerClient.listBlobsFlat()) {
                // Only count blobs that are records or legacy records, skip attachments
                if (blob.name.includes('prov/')) {
                    totalRecords++
                    uniqueRecords.add(findDeviceIdFromName(blob.name))
                } else if (!(blob.name.includes('statistics/'))) {
                    totalAttachments++
                }
            }
        }   

        this.totals = { totalRecords, totalDevices: uniqueRecords.size, totalAttachments };    
    }

    async updateStats() : Promise<void> {
        const directory_id = process.env['AZURE_TENANT_ID'];
        const app_registration_id = process.env['AZURE_CLIENT_ID'];
        const secret_value = process.env['AZURE_CLIENT_SECRET'];
        const workspace_id = process.env['AZURE_WORKSPACE_ID'];
        let client_id = app_registration_id
        let client_secret = secret_value

        const credential = new ClientSecretCredential(directory_id, client_id, client_secret);
        const tokenResponse = await credential.getToken("https://api.loganalytics.io/.default");
        let token = tokenResponse.token;

        const timesToCheck = ['ago(1h)', 'ago(24h)', 'ago(7d)']
        let valsAtTimes = [0, 0, 0]

        // Get time-based record entry counts
        for (let v in timesToCheck) {
            let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: `{"query": "AppRequests | where Name == 'postProvenance' | where TimeGenerated > ${timesToCheck[v]} | where ResultCode == 200 | count"}`,
            });
            valsAtTimes[v] = (await logs.json()).tables[0].rows[0][0];
        }
        let records1h = valsAtTimes[0]
        let records24h = valsAtTimes[1]
        let records7d = valsAtTimes[2]

        // Get time-based unique record counts
        for (let v in timesToCheck) {
            let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: `{"query": "AppRequests | where Name == 'postProvenance' | where TimeGenerated > ${timesToCheck[v]} | where ResultCode == 200 | distinct Url | count"}`,
            });
            valsAtTimes[v] = (await logs.json()).tables[0].rows[0][0];
        }
        let devices1h = valsAtTimes[0]
        let devices24h = valsAtTimes[1]
        let devices7d = valsAtTimes[2]

        const d = new Date()
        let today = d.getDay()  // returns 0-6 (0 is Sunday, 6 is Saturday)
        let minutes = d.getMinutes() / 60
        let hours = d.getHours() + minutes
        let counted = 0
        let recordsPerDayY = [0, 0, 0, 0, 0, 0, 0]

        // Get record entries per day (last 7 days) for the graph
        for (let i = 0; i <= today; i++) {
            let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                // Gets number of records created 'hours' ago ('hours' == time today in hours + i * 24h)
                body: `{"query": "AppRequests | where Name == 'postProvenance' | where TimeGenerated > ago(${hours}h) | where ResultCode == 200 | count"}`,
            });
            let recent = (await logs.json()).tables[0].rows[0][0];
            
            // Add the records we found to the current day, subtracting records we already counted
            recordsPerDayY[today - i] = recent - counted
            counted = recent
            hours += 24
        }

        // Get record entries per hour (last 7 days, time in UTC) for the graph
        let recordsPerHourY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (let hour = 0; hour < 24; hour++) {
            let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                // Gets number of records created in the last 7 days at 'hour'
                body: `{"query": "AppRequests | where Name == 'postProvenance' | where TimeGenerated > ago(7d) | where datetime_part('hour', TimeGenerated) == ${hour} | where ResultCode == 200 | count"}`,
            });
            let hourly = (await logs.json()).tables[0].rows[0][0];
            recordsPerHourY[hour] = hourly
        }

        // Get number of calls to postProvenance that failed in the last 3 months
        let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: `{"query": "AppRequests | where Name == 'postProvenance' | where ResultCode != 200 | count"}`,
        });
        let totalFailures = (await logs.json()).tables[0].rows[0][0];

        // Get number of calls to postProvenance that succeeded in the last 3 months
        logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: `{"query": "AppRequests | where Name == 'postProvenance' | where ResultCode == 200 | count"}`,
        });
        let totalSuccesses = (await logs.json()).tables[0].rows[0][0];


        this.queryStats = {records1h, records24h, records7d, devices1h, devices24h, devices7d, recordsPerDayY, recordsPerHourY, totalFailures, totalSuccesses}
    }

    async updateBrowser(context): Promise<void> {
        const rows = await runQuery(`
            AppRequests
            | extend ua = tostring(parse_json(Properties)["user_agent.original"])
            | extend UserBrowsers = case(
                ua contains "ClaudeBot", "ClaudeBot",
                ua contains "Googlebot", "Googlebot",
                ua contains "bingbot", "Bingbot",
                ua contains "Baiduspider", "Baiduspider",
                ua contains "bot" or ua contains "crawler" or ua contains "spider", "Other bot",
                ua contains "curl", "curl",
                ua contains "node", "Node",
                ua contains "python" or ua contains "Python", "Python",
                ua contains "MSIE" or ua contains "Trident", "Internet Explorer",
                ua contains ".NET", ".NET",
                ua contains "Edg/", "Edge",
                ua contains "Chrome", "Chrome",
                ua contains "Firefox", "Firefox",
                ua contains "Safari", "Safari",
                ua contains "DuckDuckGo", "DuckDuckGo",
                ua == "", "Unknown",
                "Other"
            )
            | summarize count() by UserBrowsers
            | order by count_ desc
        `, context);
        

        this.browserStats = rows
        context.log(this.browserStats);
    }

}

export const usageStatsCache = new StatsCache();