import { describe, it, expect } from "vitest";
import clickableLink from "../../../utils/clickableLink";

const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/';

// Grab unique device key from the backend.
async function getDeviceKey(): Promise<string> {
    const response = await fetch('https://gdtprodbackend.azurewebsites.net/api/getNewDeviceKey');
    return response.text();
}

// func to create record 
// Create a record with a given description, and return the device key used in record 
async function createRecord(description: string): Promise<string> {
    const deviceKey = await getDeviceKey();
    let fullUrl = `${baseUrl}${deviceKey}`;

    const formData = new FormData();
    formData.append("provenanceRecord", JSON.stringify({
        blobType: 'deviceInitializer',
        deviceName: "Vandilism Test Record",
        description,
        tags: {},
        children_key: '',
        hasParent: false,
        isReportingKey: false,
    }));

    const postResponse = await fetch(fullUrl, {
        method: "POST",
        body: formData,
    });

    expect(postResponse.ok).toBe(true);

    return deviceKey;
}

async function fecthDescription (deviceKey: string): Promise<string> {
    let fullUrl = `${baseUrl}${deviceKey}`;
    let getResponse = await fetch(fullUrl); 
    let data = await getResponse.json();

    let responseString = JSON.parse(JSON.stringify(data[0]));
    return responseString.record.description;
}


describe('clickableLink: Vandalism Integration Tests', () => {


    // TODO: Legitamate usages

    // TODO: Script Injection <script> tag

    // TODO: HTML Tag Injections - img, svg, style

    // TODO: Alert Injection

})