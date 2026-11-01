import { app } from '@azure/functions';
import { ContainerClient } from "@azure/storage-blob";
import { ClientSecretCredential } from "@azure/identity";
import { containerClient } from '../functions/httpTrigger.js';

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

export async function runQuery(query: string, token: string): Promise<[string, number][]> {
    try {
        const res = await fetch(
            `https://api.loganalytics.io/v1/workspaces/${workspaceId}/query`, 
            {
                method: "POST",
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
        });

        // check if good response
        if (res.ok) {
            const rows = (await res.json())?.tables[0]?.rows
            // check if rows are in a proper array
            if (!Array.isArray(rows)) {
                throw new Error("Response shape of tables.rows[0] isn't correct")
            }

            return rows
        }
        throw new Error(` Log Analytics returned ${res.status}: ${await res.text()}`)
    } catch(error) {
        throw new Error (`Leaving runQuery: error occurred: ${error}`)
    }
}

export async function queryCount(query: string, token: string): Promise<number> {
    const rows = await runQuery(query, token)
    const val = rows[0]?.[0]
    if (typeof val !== "number"){
        throw new Error (`Leaving queryCount: Expected number got ${JSON.stringify(rows)}`)
    }
    return val;
}

export function findDeviceIdFromName(blobName: string): string {
    // blobNames look like: 'gosqas/63f4b781c0688d83d40908ff368fefa6a2fa4cd470216fd83b3d7d4c642578c0/prov/1a771caa4b15a45ae97b13d7a336e1e9c9ec1c91c70f1dc8f7749440c0af8114'
    // where the id is that last part (before the last slash)
    return blobName.split("/", 4)[1];
}

class StatsCache {
    // Cache storage variables
    private totals = null;
    private queryStats = null;
    private browserStats = null;
    private failureStats = null;

    // The running update for each cache
    private totalsUpdate = null 
    private queryStatsUpdate = null
    private browserUpdate = null
    private failureUpdate = null

    // Getters
    async getTotals()  {
        // if browser stats isnt filled
        if (this.totals === null) {
            // wait for update, and if its null call the updater function as backup
            await (this.totalsUpdate ??= this.updateTotals(containerClient));
        }

        return this.totals
    }

    async getQueryStats() {
        if (this.queryStats === null) {
            await (this.queryStatsUpdate ??= this.updateStats());
        }
        return this.queryStats;
    }

    async getBrowserStats() {
        if (this.browserStats === null) {
            await (this.browserUpdate ??= this.updateBrowser());
        }
        return this.browserStats;
    }

    async getFailureStats() {
        if (this.failureStats === null) {
            await (this.failureUpdate ??= this.updateFailureStats());
        }
        return this.failureStats;
    }

    // Updater Functions that get called by the timer trigger below to update the cache storage variables
    async updateTotals(containerClient: ContainerClient) : Promise<void> {
        try {
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
        } catch (error) {
            this.totalsUpdate = null
            throw new Error (`Error occured while updating total stats: ${error}`)
        }
    }

    async updateStats() : Promise<void> {
        try {
            let token = await getToken();
            let successful = "AppRequests | where Name == 'postProvenance' |  where ResultCode == 200"

            const timesToCheck = ['ago(1h)', 'ago(24h)', 'ago(7d)']
            let valsAtTimes = [0, 0, 0]

            // Get time-based record entry counts
            for (let v in timesToCheck) {
                valsAtTimes[v] = await queryCount(`${successful} | where TimeGenerated > ${timesToCheck[v]} | count`, token);
            }

            let records1h = valsAtTimes[0]
            let records24h = valsAtTimes[1]
            let records7d = valsAtTimes[2]

            // Get time-based unique record counts
            for (let v in timesToCheck) {
                valsAtTimes[v] = await queryCount(`${successful} | where TimeGenerated > ${timesToCheck[v]} | distinct Url | count`, token);
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
                let recent = await queryCount(`${successful} | where TimeGenerated > ago(${hours}h) | count`, token);
                
                // Add the records we found to the current day, subtracting records we already counted
                recordsPerDayY[today - i] = recent - counted
                counted = recent
                hours += 24
            }

            // Get record entries per hour (last 7 days, time in UTC) for the graph
            let recordsPerHourY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            for (let hour = 0; hour < 24; hour++) {
                let hourly = await queryCount(`${successful} | where TimeGenerated > ago(7d) | where datetime_part('hour', TimeGenerated) == ${hour} | count`, token);
                recordsPerHourY[hour] = hourly
            }

            // Get number of calls to postProvenance that failed in the last 3 months
            let totalFailures = await queryCount(`AppRequests | where Name == 'postProvenance' | where ResultCode != 200 | count`, token);

            // Get number of calls to postProvenance that succeeded in the last 3 months
            let totalSuccesses = await queryCount(`${successful} | count`, token);

            this.queryStats = {records1h, records24h, records7d, devices1h, devices24h, devices7d, recordsPerDayY, recordsPerHourY, totalFailures, totalSuccesses}
        } catch (error) {
            this.queryStatsUpdate = null
            throw new Error (`Error occured while updating stats: ${error}`)
        }
    }

    async updateBrowser(): Promise<void> {
        try {
            let token = await getToken();
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
            `, token);
            

            this.browserStats = rows
        } catch (error) {
            this.browserUpdate = null
            throw new Error (`Error occured while updating browser stats: ${error}`)
        }
    }

    async updateFailureStats(): Promise<void> {
        try {
            let token = await getToken();
            let query = `
            AppExceptions
            | where TimeGenerated > ago(365d)
            | where ExceptionType contains "RpcException"
            | summarize FailureCount = count() by bin(TimeGenerated, 1d)
                `
            const rows = await runQuery(query, token)
            this.failureStats = rows
        } catch (error) {
            this.failureUpdate = null
            throw new Error (`Error occured while updating failure stats: ${error}`)
        }
    }

    async usageRefresh(): Promise<void> {
        // holds the promise for the updater function 
        // so getters await their completion
        // is null if the promise fails

        // waiting for updates so failures can be logged
        await Promise.allSettled([
            this.totalsUpdate = this.updateTotals(containerClient),
            this.queryStatsUpdate = this.updateStats(),
            this.browserUpdate = this.updateBrowser(),
            this.failureUpdate = this.updateFailureStats(),
        ])

    }

}

export const usageStatsCache = new StatsCache();

// fill the cache when the app starts
app.hook.appStart(() => {
    usageStatsCache.usageRefresh()
});

// Timer trigger to refresh usage stats every hour
app.timer('refreshUsageStats', {
    schedule: '0 0 * * * *',
    handler: async (_myTimer, context) => {
        try {
            context.log('Refreshing usage stats cache');
            await usageStatsCache.usageRefresh()
        } catch (error) {
            context.error('Error occured while refreshing usage stats cache: ', error)
        }
    },
});