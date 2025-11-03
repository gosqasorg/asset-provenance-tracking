#!/usr/bin/env -S npx --yes tsx

//const baseUrl = "https://gosqasbe.azurewebsites.net/api/";
const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'

export async function getNewDeviceKey() {
    const baseUrl = "https://gosqasbe.azurewebsites.net/api";

    const deviceKeyResponse = await fetch(`${baseUrl}/getNewDeviceKey`);
    const deviceKey = await deviceKeyResponse.text();

    return deviceKey;
}

export async function createSimpleRecord(theName: string, theDescription: string): string {
    const deviceKey = await getNewDeviceKey()
    let fullUrl = `${baseUrl}${deviceKey}`

    // POST record key
    try {

        // Can we leave these out and still read it in the frontend?
        const data = {
            //blobType: 'deviceInitializer',
            deviceName: theName,
            description: theDescription,
            //tags: {},
            //children_key: '',
            //hasParent: false,
            //isReportingKey: false,
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


        /*
    // GET record key to make sure it exists
    let getResponse; 
    try {
        getResponse = await fetch(fullUrl);
        getResponse = await getResponse.json();
        let responseString = JSON.parse(JSON.stringify(getResponse[0]));
        console.log(responseString)

        expect(JSON.stringify(getResponse)).not.toBe('[]');
        expect(responseString.record.deviceName).toBe('Create Record Test');
        expect(responseString.record.description).toBe('An API smoketest for creating the most basic record');
        expect(responseString.record.children_key).toBe("");
        expect(responseString.record.hasParent).toBe(false);
        expect(responseString.record.isReportingKey).toBe(false);
    } catch(error) {
        console.error('(Create GET Test) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
        throw error;
    }
        */

    return deviceKey;
}
