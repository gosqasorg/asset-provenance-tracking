// TODO: statscache class todos:
// - make updater fucntions for totals, stats, browsers for the time trigger to call
// - make variables for cache storage for the getters
// - make getters for totals, stats, browsers for http requests to use

// Figure out how to populat variables for cache storage- since they get there vals from time trigger everyhour
// Maybe Call updater functions on launch? discuss with vincent
import { ContainerClient } from "@azure/storage-blob";
import { ClientSecretCredential } from "@azure/identity";


interface TotalsData {
    totalRecords: number;
    totalDevices: number;
    totalAttachments: number;
}

interface QueryStatsData {
    records1h: number; records24h: number; records7d: number;
    devices1h: number; devices24h: number; devices7d: number;
    recordsPerDayY: number[];
    recordsPerHourY: number[];
    totalFailures: number;
    totalSuccesses: number;
}

interface BrowserStats {
    UserBrowsers: string;
    count: number;
}

// Helper Functoin
export function findDeviceIdFromName(blobName: string): string {
    // blobNames look like: 'gosqas/63f4b781c0688d83d40908ff368fefa6a2fa4cd470216fd83b3d7d4c642578c0/prov/1a771caa4b15a45ae97b13d7a336e1e9c9ec1c91c70f1dc8f7749440c0af8114'
    // where the id is that last part (before the last slash)
    return blobName.split("/", 4)[1];
}

class StatsCache {
    private totals: TotalsData = { totalRecords: 0, totalDevices: 0, totalAttachments: 0 };;
    private queryStats: QueryStatsData | null = null;
    private browserStats: BrowserStats[] = [];

    // Getters
    getTotals() : TotalsData {
        return this.totals;
    }

    getQueryStats() : QueryStatsData {
        return this.queryStats;
    }

    getBrowserStats() : BrowserStats[] {
        return this.browserStats;
    }

    // Updaters
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

    async updateStats(containerClient: ContainerClient) : Promise<void> {
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


        this.queryStats = {records1h, records24h, records7d, devices1h, devices24h, devices7d, recordsPerDayY, recordsPerHourY, totalFailures, totalSuccesses} as QueryStatsData
    }

    async updateBrowser(runQuery: (query: string, context) => Promise<any>, context): Promise<void> {
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
        

        this.browserStats = rows;
        context.log(this.browserStats);
    }

}

export const usageStatsCache = new StatsCache();