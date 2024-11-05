// azureFuncs.ts -- Azure Functions
// Copyright (C) 2024 GOSQAS Team
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// const globalBaseUrl = 'https://gosqasbe.azurewebsites.net/api';

// method takes the base58 encoded device key
export async function getProvenance(deviceKey: string) {
    try {
        const baseUrl = useRuntimeConfig().public.baseUrl;
        const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
            method: "GET",
        });
        return await response.json() as { record: any, attachments?: string[], timestamp: number }[];
    } catch (error) {
        // probably we didn't find the key...
        console.log(`It is likely that they key your requestd: ${deviceKey} does not exist.`);
        console.log(error);
        throw error;
    }
}

export async function getAttachment(baseUrl: string, deviceKey: string, attachmentID: string) {
//    const baseUrl = useRuntimeConfig().public.baseUrl;
    try {
    const response = await fetch(`${baseUrl}/attachment/${deviceKey}/${attachmentID}`, {
      method: "GET",
    });

    const blob = await response.blob();

    // Check for the attachment name
    let fileName = response.headers.get('Attachment-Name');
    // If the header is not present, fetch the attachment name
    if(!fileName) {
        // Fetch the attachment name
        const nameResponse = await fetch(`${baseUrl}/attachment/${deviceKey}/${attachmentID}/name`, {
        method: "GET",
    });
        fileName = await nameResponse.text();
    }
    return { blob, fileName };
} catch (error) {
    console.error('Error occurred during getAttachment request:', error);
    throw error; // re-throw the error if you want to handle it further up the call stack
  }
   
      
}


export async function postProvenance(deviceKey: string, record: any, attachments?: readonly File[]) {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const formData = new FormData();
    formData.append("provenanceRecord", JSON.stringify(record));
    if (attachments) {
        for (const blob of attachments) {
            formData.append(blob.name, blob);
        }
    }
    const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
        method: "POST",
        body: formData,
    });
    return await response.json() as { record: string, attachments?: string[] };
}

export async function getStatistics() {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const response = await fetch(`${baseUrl}/statistics`, {
        method: "GET",
    });
    return await response.json() as { record: string, timestamp: number }[];
}



export async function bulkCreateProvenances(provenance: Provenance[]) {
    try {
        let responses = [];
        for (const p of provenance) {
            const response = await postProvenance(p.deviceID, p.record, p.attachments);
            responses.push(response);
        }
        return responses;
    } catch (error) {
        console.error('Error occurred during bulkCreateProvenances request:', error);
    }
}
