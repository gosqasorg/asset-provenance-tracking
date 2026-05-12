import "dotenv/config";
import { writeFileSync, appendFileSync } from "fs";

// added file output for when file is run, instead of just console logging
const outputFile = "user_agent.txt";
writeFileSync(outputFile, "");

function log(line: string): void {
    appendFileSync(outputFile, line + "\n");
}

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

async function runQuery(label: string, query: string): Promise<void> {
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

    log(`\n===** ${label} **===`);
    log(JSON.stringify(await result.json(), null, 2));
}

// await runQuery(
//     "properties sample",
//     `AppRequests | project Properties | take 20`
// );

// await runQuery(
//     "user agent sample",
//     `AppRequests | where Properties contains "user_agent" | project Properties | take 5` 
// );

await runQuery(
    "Unique Agents",
    `AppRequests | extend ua = tostring(parse_json(Properties)["user_agent.original"]) | summarize count() by ua | order by count_ desc`
);

// await runQuery(
//     "User agents sample",
// `AppRequests | extend ua = tostring(parse_json(Properties)["user_agent.original"]) | extend UserBrowsers = case (ua contains "Edg/", "Edge", ua contains"Chrome", "Chrome", ua contains "Firefox", "Firefox",  ua contains "Safari", "Safari", ua == "", "Unknown", "Other") | project UserBrowsers | summarize count() by UserBrowsers | order by count_ desc`
// );
