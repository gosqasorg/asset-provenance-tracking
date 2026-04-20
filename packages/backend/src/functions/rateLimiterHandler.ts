import { InvocationContext, Timer } from '@azure/functions';
import { ClientSecretCredential } from '@azure/identity';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

let accountName; if (isEmpty(accountName = process.env["AZURE_STORAGE_ACCOUNT_NAME"])) {
    throw new Error('Env vars not set')
}
let accountKey; if (isEmpty(accountKey = process.env["AZURE_STORAGE_ACCOUNT_KEY"])) {
    throw new Error('Env vars not set')
}

// Define max function calls per timedelta (in minutes)
const TIMEDELTA = 5;
const GET_PROV_LIMIT = 2000;
const POST_PROV_LIMIT = 500;
const EMAIL_LIMIT = 100;
const EMAIL_NOTIF_LIMIT = 100;
const GET_STATS_LIMIT = 50;
const NEW_KEY_LIMIT = 1000;
const GET_VERSION_LIMIT = 50;
const UPGRADE_PROV_LIMIT = 50;
const EMAIL_TEST_LIMIT = 50;
const CREATE_GROUP_LIMIT = 50;

function isEmpty(str) {
    return (!str || str.length === 0 );
}

export async function rateLimiterHandler(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Rate Limiter function started.');

    const functions = ['getProvenance', 'postProvenance', 'postEmail', 'postNotificationEmail', 'getStatistics', 'getNewDeviceKey', 'getVersion', 'upgradeProvenance', 'emailSignupTestEndpoint', 'createGroup']
    const functionLimits = [GET_PROV_LIMIT, POST_PROV_LIMIT, EMAIL_LIMIT, EMAIL_NOTIF_LIMIT, GET_STATS_LIMIT, NEW_KEY_LIMIT, GET_VERSION_LIMIT, UPGRADE_PROV_LIMIT, EMAIL_TEST_LIMIT, CREATE_GROUP_LIMIT];
    const functionTables = ['getProvLimitReached', 'postProvLimitReached', 'postEmailLimitReached', 'postNotifEmailLimitReached', 'getStatsLimitReached', 'getKeyLimitReached', 'getVersionLimitReached', 'upgradeProvLimitReached', 'emailTestLimitReached', 'createGroupLimitReached']
    let functionCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    try {
        const directory_id = process.env['AZURE_TENANT_ID'];
        const client_id = process.env['AZURE_CLIENT_ID'];
        const client_secret = process.env['AZURE_CLIENT_SECRET'];
        const workspace_id = process.env['AZURE_WORKSPACE_ID'];

        const queryCredential = new ClientSecretCredential(directory_id, client_id, client_secret);
        const tokenResponse = await queryCredential.getToken("https://api.loganalytics.io/.default");
        let token = tokenResponse.token;

        // Get # of calls per function in our timedelta
        for (let func in functions) {
            let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: `{"query": "AppRequests | where Name == '${functions[func]}' | where TimeGenerated > ago(${TIMEDELTA}m) | count"}`
            });
            functionCounts[func] = (await logs.json()).tables[0].rows[0][0];
        }
    } catch (error) {
        context.error("Rate Limiter: Failed to get counts: " + error);
    }

    // Update flags based on # of calls in timedelta
    try {    
        const tableUrl = accountName === "devstoreaccount1"
            ? `http://127.0.0.1:10002/devstoreaccount1`
            : `https://${accountName}.table.core.windows.net`;

        let table = 'RateLimiterFlags'
        const credential = new AzureNamedKeyCredential(accountName, accountKey);
        const tableClient = new TableClient(tableUrl, table, credential, { allowInsecureConnection: true })
        await tableClient.createTable();  // Create if not exist, no error if it does

        for (let func in functionLimits) {
            let limitHit = false
            // Set flag to true if over our limit
            if (functionCounts[func] >= functionLimits[func]) {
                limitHit = true
            }

            // Update the flag
            try {
                const entity = {
                    partitionKey: `RateLimitHit`,
                    rowKey: `${functionTables[func]}`,
                    limitReached: limitHit
                }

                const response = await tableClient.upsertEntity(entity);
            } catch (error) {
                context.error(`Rate Limiter: Error updating ${functions[func]} flag: ${error}`)
            }
        }
    } catch (error) {
        context.error("Rate Limiter: Failed to update flags: " + error);
    }

    context.log('Rate Limiter function complete.');
}