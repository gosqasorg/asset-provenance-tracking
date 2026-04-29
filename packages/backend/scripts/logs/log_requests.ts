import "dotenv/config";
import { writeFileSync, appendFileSync } from "fs";

// added file output for when file is run, instead of just console logging
const outputFile = "log_requests.txt";
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
    "Recent Requests",
    "AppRequests | where TimeGenerated > ago(14d) | order by TimeGenerated desc | limit 20"
);

await runQuery(
    "Requests by IP",
    "AppRequests | where TimeGenerated > ago(14d) | summarize request_count = count() by ClientIP | order by request_count desc"
);

await runQuery(
    "Requests by Country",
    "AppRequests | where TimeGenerated > ago(30d) | summarize request_count = count() by ClientCountryOrRegion | order by request_count desc"
);

await runQuery(
    "Requests by Endpoint",
    "AppRequests | where TimeGenerated > ago(7d) | summarize request_count = count() by Name | order by request_count desc"
);

await runQuery(
    "Hourly Traffic Volume",
    "AppRequests | where TimeGenerated > ago(7d) | summarize request_count = count() by bin(TimeGenerated, 1h) | order by TimeGenerated asc"
);

await runQuery(
    "Requests by City",
    "AppRequests | where TimeGenerated > ago(30d) | summarize request_count = count() by ClientCity, ClientStateOrProvince, ClientCountryOrRegion | order by request_count desc"
);

await runQuery(
    "Requests by Region within Country",
    "AppRequests | where TimeGenerated > ago(30d) | summarize request_count = count() by ClientCountryOrRegion, ClientStateOrProvince | order by ClientCountryOrRegion asc, request_count desc"
);
