import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
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

export async function runQuery(name: string,query: string, token: string, context?: InvocationContext): Promise<[string, number][]> {
    const log = context ?? console;
    try {
        log.log(`Gathering Log Analytics for ${name} query`);
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

            log.log(`Query returned ${rows.length} rows`);
            return rows
        }
        throw new Error(` Log Analytics returned ${res.status}: ${await res.text()}`)
    } catch(error) {
        throw new Error (`Leaving runQuery: error occurred: ${error}`)
    }
}

export async function queryCount(name: string, query: string, token: string, context?: InvocationContext): Promise<number> {
    const rows = await runQuery(name, query, token, context)
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
    private serverResponseTimes = null;

    // The running update for each cache
    private totalsUpdate = null 
    private queryStatsUpdate = null
    private browserUpdate = null
    private failureUpdate = null
    private serverResponseUpdate = null

    // Getters
    async getTotals(context?: InvocationContext)  {
        // if browser stats isnt filled
        if (this.totals === null) {
            // wait for update, and if its null call the updater function as backup
            await (this.totalsUpdate ??= this.updateTotals(containerClient, context));
        }

        return this.totals
    }

    async getQueryStats(context?: InvocationContext) {
        if (this.queryStats === null) {
            await (this.queryStatsUpdate ??= this.updateStats(context));
        }
        return this.queryStats;
    }

    async getBrowserStats(context?: InvocationContext) {
        if (this.browserStats === null) {
            await (this.browserUpdate ??= this.updateBrowser(context));
        }
        return this.browserStats;
    }

    async getFailureStats(context?: InvocationContext) {
        if (this.failureStats === null) {
            await (this.failureUpdate ??= this.updateFailureStats(context));
        }
        return this.failureStats;
    }

    async getServerResponseStats(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
        if (this.serverResponseTimes === null) {
            await (this.serverResponseUpdate ??= this.updateServerResponseStats(context));
        }
        return { body: JSON.stringify(this.serverResponseTimes), status: 200 };
}

    // Updater Functions that get called by the timer trigger below to update the cache storage variables
    async updateTotals(containerClient: ContainerClient, context?: InvocationContext) : Promise<void> {
        const log = context ?? console; // use the context logger if available else use console 
        try {
            log.log("Updating total stats");

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
            log.log("Successfully updated total stats");
        } catch (error) {
            this.totalsUpdate = null
            throw new Error (`Error occured while updating total stats: ${error}`)
        }
    }

    async updateStats(context?: InvocationContext) : Promise<void> {
        const log = context ?? console;
        try {
            log.log("Updating query stats");

            let token = await getToken();
            let successful = "AppRequests | where Name == 'postProvenance' |  where ResultCode == 200"

            const timesToCheck = ['ago(1h)', 'ago(24h)', 'ago(7d)']
            let valsAtTimes = [0, 0, 0]

            // Get time-based record entry counts
            for (let v in timesToCheck) {
                valsAtTimes[v] = await queryCount( "updateStats: Time", `${successful} | where TimeGenerated > ${timesToCheck[v]} | count`, token, context);
            }

            let records1h = valsAtTimes[0]
            let records24h = valsAtTimes[1]
            let records7d = valsAtTimes[2]

            // Get time-based unique record counts
            for (let v in timesToCheck) {
                valsAtTimes[v] = await queryCount("updateStats: Unique Records", `${successful} | where TimeGenerated > ${timesToCheck[v]} | distinct Url | count`, token, context);
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
                let recent = await queryCount("updateStats: Daily Records", `${successful} | where TimeGenerated > ago(${hours}h) | count`, token, context);
                
                // Add the records we found to the current day, subtracting records we already counted
                recordsPerDayY[today - i] = recent - counted
                counted = recent
                hours += 24
            }

            // Get record entries per hour (last 7 days, time in UTC) for the graph
            let recordsPerHourY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            for (let hour = 0; hour < 24; hour++) {
                let hourly = await queryCount("updateStats: Hourly Records", `${successful} | where TimeGenerated > ago(7d) | where datetime_part('hour', TimeGenerated) == ${hour} | count`, token, context);
                recordsPerHourY[hour] = hourly
            }

            // Get number of calls to postProvenance that failed in the last 3 months
            let totalFailures = await queryCount("updateStats: Failure Stats", `AppRequests | where Name == 'postProvenance' | where ResultCode != 200 | count`, token, context);

            // Get number of calls to postProvenance that succeeded in the last 3 months
            let totalSuccesses = await queryCount("updateStats: Success Stats", `${successful} | count`, token, context);

            this.queryStats = {records1h, records24h, records7d, devices1h, devices24h, devices7d, recordsPerDayY, recordsPerHourY, totalFailures, totalSuccesses}
            log.log("Successfully updated query stats");
        } catch (error) {
            this.queryStatsUpdate = null
            throw new Error (`Error occured while updating stats: ${error}`)
        }
    }

    async updateBrowser(context?: InvocationContext): Promise<void> {
        const log = context ?? console;
        try {
            log.log("Updating browser stats");

            let token = await getToken();
            const rows = await runQuery("updateBrowser", `
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
            `, token, context);
            

            this.browserStats = rows
            log.log("Successfully updated browser stats");
        } catch (error) {
            this.browserUpdate = null
            throw new Error (`Error occured while updating browser stats: ${error}`)
        }
    }

    async updateFailureStats(context?: InvocationContext): Promise<void> {
        const log = context ?? console;
        try {
            log.log("Updating failure stats");

            let token = await getToken();
            let query = `
            AppExceptions
            | where TimeGenerated > ago(365d)
            | where ExceptionType contains "RpcException"
            | summarize FailureCount = count() by bin(TimeGenerated, 1d)
                `
            const rows = await runQuery("updateFailureStats", query, token, context)
            this.failureStats = rows
            log.log("Successfully updated failure statistics");
        } catch (error) {
            this.failureUpdate = null
            throw new Error (`Error occured while updating failure stats: ${error}`)
        }
    }

    async updateServerResponseStats(context?: InvocationContext): Promise<void> {
        const log = context ?? console;
        try {
            log.log("Updating server response stats");

            const timesToCheck = ['ago(1d)', 'ago(7d)', 'ago(30d)', 'ago(90d)', 'ago(180d)','ago(365d)']
            const indexes = ['oneDay', 'oneWeek', 'oneMonth', 'threeMonths', 'sixMonths', 'oneYear'];
            const serverResults = {
                oneDay: [],
                oneWeek: [],
                oneMonth: [],
                threeMonths: [],
                sixMonths: [],
                oneYear: []
            }
            let token = await getToken();

            for (let v in timesToCheck) {
                const rows = await runQuery("updateServerResponseStats", `
                    AppRequests
                    | where TimeGenerated > ${timesToCheck[v]}
                    | summarize requestCount=sum(ItemCount), avgDuration=avg(DurationMs) by PerformanceBucket
                    | order by avgDuration asc
                    | project-away avgDuration
                `, token, context)

                // Filter the data to the correct format to graph
                let filteredCounts = [];
                for (let rowIndex in rows) {
                    filteredCounts[rowIndex] = { time: rows[rowIndex][0], count: rows[rowIndex][1]};
                }

                serverResults[indexes[v]] = filteredCounts;
            }
            this.serverResponseTimes = serverResults;
            log.log("Successfully updated server response stats");
        } catch (error) {
            this.serverResponseUpdate = null
            throw new Error(`Error occured while updating server response stats: ${error}`)
        }
    }

    async usageRefresh(context?: InvocationContext): Promise<void> {
        // holds the promise for the updater function 
        // so getters await their completion
        // is null if the promise fails

        // waiting for updates
        await Promise.allSettled([
            this.totalsUpdate = this.updateTotals(containerClient, context),
            this.queryStatsUpdate = this.updateStats(context),
            this.browserUpdate = this.updateBrowser(context),
            this.failureUpdate = this.updateFailureStats(context),
            this.serverResponseUpdate = this.updateServerResponseStats(context)
        ])
    }
}

export const usageStatsCache = new StatsCache();

// fill the cache when the app starts
// app.hook doesnt have an InvocationContext, so we can't pass in context
app.hook.appStart(() => {
    usageStatsCache.usageRefresh()
});

// Timer trigger to refresh usage stats every hour
app.timer('refreshUsageStats', {
    schedule: '0 0 * * * *',
    handler: async (_myTimer, context) => {
        try {
            context.log('Refreshing usage stats cache');
            await usageStatsCache.usageRefresh(context);
        } catch (error) {
            context.error('Error occured while refreshing usage stats cache: ', error)
        }
    },
}); 

app.get("getServerResponse", {
    authLevel: 'anonymous',
    route: 'stats/serverResponse',
    handler: (request, context) => usageStatsCache.getServerResponseStats(request, context)
})
