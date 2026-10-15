#!/usr/bin/env npx tsx

import "dotenv/config"; // https://www.npmjs.com/package/dotenv
import { writeFileSync, appendFileSync } from "fs";

// grab values from env variables, should be in a .env file in same directory
const directoryId = process.env["directory_id"];
const appRegistrationId = process.env["app_registration_id"];
const secretValue = process.env["secret_value"];
const workspaceId = process.env["workspace_id"];

// get token from API
async function getToken() {
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

    return token;

}

export async function runQuery(query: string): Promise<void> {
    const token = await getToken()

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

    return await result.json()
}
