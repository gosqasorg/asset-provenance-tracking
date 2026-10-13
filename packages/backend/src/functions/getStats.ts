import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

const directoryId = process.env["AZURE_TENANT_ID"];
const appRegistrationId = process.env["AZURE_CLIENT_ID"];
const secretValue = process.env["AZURE_CLIENT_SECRET"];
const workspaceId = process.env["AZURE_WORKSPACE_ID"];

console.log(`directoryId: ${directoryId}`)
console.error(`appRegistrationId: ${appRegistrationId}`)
console.error(`secretValue: ${secretValue}`)
console.error(`workspaceId: ${workspaceId}`)

if(![directoryId, appRegistrationId, secretValue, workspaceId].every(Boolean)) {
    console.error('getStats Error: credentials not set: '
     + `directoryId: ${directoryId}`
     + `appRegistrationId: ${appRegistrationId}` 
     + `secretValue: ${secretValue}` 
     + `workspaceId: ${workspaceId}`)
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


async function runQuery(query: string, context): Promise<[string, number][]> {
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
        return data.tables?.[0]?.rows ?? []
    } catch(error) {
        context.log(`Leaving runQuery: error occurred: ${error}`)
    }
}


async function getBrowserStats(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Entering getBrowserStats')
    try {
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
        `, context)

        let response = { body: JSON.stringify(rows), status: 200, headers: { 'Content-Type': 'application/json' } }
        context.log(rows)
        context.log(response)
        context.log('Returning successfully from getBrowserStats')
        return response
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


let serverResponseTimes = {
    oneDay: [],
    oneWeek: [],
    oneMonth: [],
    threeMonths: [],
    sixMonths: [],
    oneYear: []
}

async function setServerResponseStats(context: InvocationContext): Promise<void> {
    try {
        const timesToCheck = ['ago(1d)', 'ago(7d)', 'ago(30d)', 'ago(90d)', 'ago(180d)','ago(365d)']
        const indexes = ['oneDay', 'oneWeek', 'oneMonth', 'threeMonths', 'sixMonths', 'oneYear'];

        for (let v in timesToCheck) {
            const rows = await runQuery(`
                AppRequests
                | where TimeGenerated > ${timesToCheck[v]}
                | summarize requestCount=sum(ItemCount), avgDuration=avg(DurationMs) by PerformanceBucket
                | order by avgDuration asc
                | project-away avgDuration
            `, context)

            // Filter the data to the correct format to graph
            let filteredCounts = [];
            for (let rowIndex in rows) {
                filteredCounts[rowIndex] = { time: rows[rowIndex][0], count: rows[rowIndex][1]};
            }

            serverResponseTimes[indexes[v]] = filteredCounts;
        }
    } catch (error) {
        context.error("setServerResponseStats error:", error);
    }
}

app.timer('setServerResponseStats', {
    schedule: '0 0 * * * *',
    runOnStartup: true,
    handler: (_myTimer, context) => setServerResponseStats(context)
});

async function getServerResponseStats(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    return { body: JSON.stringify(serverResponseTimes), status: 200 };
}

app.get("getServerResponse", {
    authLevel: 'anonymous',
    route: 'stats/serverResponse',
    handler: getServerResponseStats
})