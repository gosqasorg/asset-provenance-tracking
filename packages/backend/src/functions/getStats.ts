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


let server_response = {
    oneDay: [],
    oneWeek: [],
    oneMonth: [],
    oneQuarter: [],
    oneYear: []
}

// *TODO: this should be called on a timertrigger (and also on page load like how mish did in their issue) to update count every hour
    // FOR TESTING MAKE THIS AN ENDPOINT AND PRINT THE RETURNS!! (want to see how it is returned and how we can move it into the object)
async function setServerResponseStats(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const timesToCheck = ['ago(1d)', 'ago(7d)', 'ago(30d)', 'ago(90d)', 'ago(365d)']
        const indexes = ['oneDay', 'oneWeek', 'oneMonth', 'oneQuarter', 'oneYear'];

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

            server_response[indexes[v]] = filteredCounts;
        }

        let response = { body: JSON.stringify(server_response), status: 200, headers: { 'Content-Type': 'application/json' } }
        // context.error(`Response ROWS:\n`, rows) // list of lists, todo not error for final
        // context.error(`Response Object:\n`, server_response)
        // context.error(response)
        context.error(`Test Filtering Array:\n`, server_response)

        // TODO: instead of returning we need to update counts object (timetrigger I don't think needs a return)
        return response
    } catch (error) {
        context.log("getServerResponseStats error:", error);
        return { body: "Error fetching server response stats", status: 500 }
    }
}

app.get("tempSetServerResponse", { // todo delete and make timer trigger
    authLevel: 'anonymous',
    route: 'stats/test',
    handler: setServerResponseStats
})


// TODO: this should be an endpoint that the frontend can call to get the object stored (NOT run the query!!)
async function getServerResponseStats(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    return {  body: JSON.stringify(server_response), status: 200 };
}

app.get("getServerResponse", {
    authLevel: 'anonymous',
    route: 'stats/serverResponse',
    handler: getServerResponseStats
})