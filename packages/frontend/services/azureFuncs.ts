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

import { validateKey } from "~/utils/keyFuncs";

// method takes the base58 encoded device key
export async function getProvenance(deviceKey: string) {
    try {
        if (!validateKey(deviceKey)) {
            throw new Error("Bad key provided");
        }
        
        const baseUrl = useRuntimeConfig().public.baseUrl;
        const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
            method: "GET",
        });

        if (response.status !== 200) {
            throw new Error(`Failed to get provenance: ${response.status} ${response.statusText}`);
        }
        return await response.json() as { record: any, attachments?: string[], timestamp: number }[];
    } catch (error) {
        console.log(`Key not found: ${deviceKey}.`);
        console.log(error);
        throw error;
    }
}

export async function getAttachment(baseUrl: string, deviceKey: string, attachmentID: string) {
    try {
        if (!validateKey(deviceKey)) {
            throw new Error("Bad key provided.");
        }

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

export async function postProvenance(deviceKey: string, record: any, attachments: readonly File[]) {
    if (!validateKey(deviceKey)) {
        throw new Error("Bad key provided.");
    }

    const baseUrl = useRuntimeConfig().public.baseUrl;
    const formData = new FormData();
    formData.append("provenanceRecord", JSON.stringify(record));
    for (const blob of attachments) {
        formData.append(blob.name, blob);
    }
    
    const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
        method: "POST",
        body: formData,
    });
    if (response.status !== 200) {
        throw new Error(`Failed to post provenance: ${response.status} ${response.statusText}`);
    }
    return await response.json() as { record: string, attachments?: string[] };
}

export async function getStatistics() {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const response = await fetch(`${baseUrl}/statistics`, {
        method: "GET",
    });
    return await response.json() as { record: string, timestamp: number }[];
}


// Should call backend getTimestamps to return all stored timestamps
export async function getTimestamps(deviceKey: string) {
    console.log("FRONTEND get")
    try {
        if (!validateKey(deviceKey)) {
            throw new Error("Bad key provided");
        }
        
        const baseUrl = useRuntimeConfig().public.baseUrl;

        // TODO: make sure this is the URL we want to store at
        // ERROR: here is where it crashes (works for pages other than timestamps)
        console.log(baseUrl + '/timestamps')
        const response = await fetch(`${baseUrl}/timestamps`, {
            method: "GET",
        });

        if (response.status !== 200) {
            throw new Error(`Failed to get timestamp: ${response.status} ${response.statusText}`);
        }
        // return await response.json() as { deviceKey: string, timestamp: number }[];
        return await response.json() as { record: any };
    } catch (error) {
        console.log(`Key not found: ${deviceKey}.`);
        console.log(error);
        throw error;
    }
}

// Should also call backend to add a new timestamp
export async function postTimestamps(deviceKey: string, record: any) {
    console.log("FRONTEND post")
    if (!validateKey(deviceKey)) {
        throw new Error("Bad key provided.");
    }

    const baseUrl = useRuntimeConfig().public.baseUrl;
    const formData = new FormData();
    // TODO: not sure if form data is formatted correctly
    formData.append("timestampRecord", JSON.stringify(record));
    
    const response = await fetch(`${baseUrl}/timestamps`, {
        method: "POST",
        body: formData,
    });
    if (response.status !== 200) {
        throw new Error(`Failed to post timestamps: ${response.status} ${response.statusText}`);
    }
    // TODO: make sure backend is returning the same format
    // return await response.json() as { deviceKey: string, timestamp: number };
    return await response.json() as { record: any };
}