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

    console.log(`\n===** ${label} **===`);
    console.log(await result.json());
}

await runQuery(
    "Tables",
    "search * | distinct $table | limit 50"
);

await runQuery(
    "FunctionAppLogs",
    "FunctionAppLogs | where TimeGenerated > ago(7d) | order by TimeGenerated desc"
);

await runQuery(
    "Exceptions",
    "AppExceptions | where TimeGenerated > ago(7d) | order by TimeGenerated desc | limit 20"
);

await runQuery(
    "Recent Requests",
    "AppRequests | where TimeGenerated > ago(7d) | order by TimeGenerated desc | limit 20"
);

await runQuery(
    "Traces",
    "AppTraces | where TimeGenerated > ago(1d) | order by TimeGenerated desc | limit 20"
);
