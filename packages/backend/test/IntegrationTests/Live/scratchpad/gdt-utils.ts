#!/usr/bin/env -S npx --yes tsx

export async function getNewDeviceKey() {
    const baseUrl = "https://gosqasbe.azurewebsites.net/api";

    const deviceKeyResponse = await fetch(`${baseUrl}/getNewDeviceKey`);
    const deviceKey = await deviceKeyResponse.text();

    return deviceKey;
}

