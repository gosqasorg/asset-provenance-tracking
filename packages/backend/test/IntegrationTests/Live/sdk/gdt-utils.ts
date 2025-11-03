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

        if(! response.ok) {
            throw new Error(`Error: Record read attempt failed with status ${response.status}`)
        }

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

        const response = await fetch(fullUrl, {
            method: "POST",
            body: formData,
        });

        if(! response.ok) {
            console.error('URL: ' + fullUrl)
            console.error('Key: ' + deviceKey)
            console.error(response)
            throw new Error(`Error: Record creation attempt failed with status ${response.status}`)
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

export async function updateRecordTags(theRecordKey: string, theTags: string[], theDescription: string): string {
    const updateFormData = new FormData();
    const updateData = {
      blobType: 'deviceRecord',
      description: theDescription,
      tags: theTags,
    };
    updateFormData.append("provenanceRecord", JSON.stringify(updateData));

    try { 
        var response = await fetch(`${baseUrl}${theRecordKey}`, {
            method: "POST",
            body: updateFormData
        })

        if(! response.ok) {
            throw new Error(`Error: Record update attempt failed with status ${response.status}`)
        }

        response = await response.json();
        //console.log('\n\noriginal response' + response)

    } catch(error) {
        console.error(error.message);
    }

    // Double check
    const theRecord = await readRecord(theRecordKey)

    if(! theRecord[theRecord.length - 1].tags == theTags) {
        throw new Error(`Error: Record update attempt failed verification step with key ${theRecordKey} and data ${theName}, ${theDescription}`)
    }

    return theRecord;
}

/*

    
    const buffer = await readFile('./test/attachments/c200.jpg');
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    updateFormData.append('updated-image.jpg', blob);
    
    const updateResponse = await fetch(fullUrl, {
      method: "POST",
      body: updateFormData,
    });
    
    expect(updateResponse.ok).toBe(true);

    // check if it works
    const getResponse = await fetch(fullUrl);
    const data = await getResponse.json();
    const record = JSON.parse(JSON.stringify(data[0]));
    
    expect(record.record.description).toBe("Updated with attachment");
    expect(record.record.tags.length).toBe(1);
    expect(record.attachments.length).toBeGreaterThan(0); 

*/


