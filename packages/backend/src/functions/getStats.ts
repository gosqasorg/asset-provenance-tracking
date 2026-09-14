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

async function boop(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Entering boop')
    let query = `
AppExceptions
| where TimeGenerated > ago(365d)
| where ExceptionType contains "RpcException"
| summarize FailureCount = count() by bin(TimeGenerated, 1d)
    `
    const rows = await runQuery(query, context)

    let response = { body: JSON.stringify(rows), status: 200, headers: { 'Content-Type': 'application/json' } }
    context.log(rows)
    context.log(response)
    context.log('Returning from boop')
    return response   
}



app.get("boop", {
    authLevel: 'anonymous',
    route: 'stats/boop',
    handler: boop
})

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