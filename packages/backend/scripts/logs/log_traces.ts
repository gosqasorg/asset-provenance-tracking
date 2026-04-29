import "dotenv/config";
import { writeFileSync, appendFileSync } from "fs";

const outputFile = "log_traces.txt";
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

await runQuery(
    "Recent Traces",
    "AppTraces | where TimeGenerated > ago(7d) | order by TimeGenerated desc | limit 20"
);

await runQuery(
    "Traces by Severity",
    "AppTraces | where TimeGenerated > ago(7d) | summarize count() by SeverityLevel | order by count_ desc"
);

await runQuery(
    "Traces by Function",
    "AppTraces | where TimeGenerated > ago(7d) | summarize count() by OperationName | order by count_ desc"
);

await runQuery(
    "Unique Devices from Traces",
    `AppTraces
    | where TimeGenerated > ago(30d)
    | where Message contains 'deviceID'
    | extend deviceID = extract('deviceID.*?([a-f0-9]{64})', 1, Message)
    | where isnotempty(deviceID)
    | summarize dcount(deviceID) by bin(TimeGenerated, 1d)
    | order by TimeGenerated asc`
);
