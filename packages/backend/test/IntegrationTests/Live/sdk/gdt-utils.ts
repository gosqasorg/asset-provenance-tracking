#!/usr/bin/env -S npx --yes tsx

//const baseUrl = "https://gosqasbe.azurewebsites.net/api/";
const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'

export async function getNewDeviceKey() {
    const baseUrl = "https://gosqasbe.azurewebsites.net/api";

    const deviceKeyResponse = await fetch(`${baseUrl}/getNewDeviceKey`);
    const deviceKey = await deviceKeyResponse.text();

    return deviceKey;
}

async function readRecord(recordId) {
    try { 
        var response = await fetch(`https://gdtprodbackend.azurewebsites.net/api/provenance/${recordId}`)
        return await response.json();
    } catch(error) {
        console.error(`Error: Record read attempt failed with status: {response.status}`)
    }
}

export async function createSimpleRecord(theName: string, theDescription: string): string {
    const deviceKey = await getNewDeviceKey()
    let fullUrl = `${baseUrl}${deviceKey}`

    // Attepmt to post a new record
    try {
        const data = {
            deviceName: theName,
            description: theDescription,
        }

        const formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(data));

        const postResponse = await fetch(fullUrl, {
            method: "POST",
            body: formData,
        });

        if(! postResponse.ok) {
            console.error('URL: ' + fullUrl)
            console.error('Key: ' + deviceKey)
            console.error(postResponse)
            throw new Error(`Error: Record creation attempt failed with status ${postResponse.status}`)
        }
    } catch (error) {
        console.error("(Create POST Test) Error creating a record: " + error); 
        throw error;
    }

    // Double check: attributes seem ok?
    const theRecord = await readRecord(deviceKey)
    if(! theRecord.deviceName == theName) {
        throw new Error(`Error: Record creation attempt failed verification step with args ${theName}, ${theDescription}`)
    }

    return deviceKey;
}

