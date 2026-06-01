import "dotenv/config";
//import { process } from "zod/v4/core";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";


const directoryId = process.env["directory_id"];
const appRegistrationId = process.env["app_registration_id"];
const secretValue = process.env["secret_value"];

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
const workspaceId = process.env["workspace_id"];


async function runQuery(query: string): Promise<[string, number][]> {
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
    return data.tables[0].rows
}


async function getBrowserStats(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        `)
        return { body: rows, status: 200 }
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