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
    
    // TODO: APPLY fetchURL ON ALL OTHER FETCH CALLS IN THIS FILE?? (getProv/getAttachment???)
    let response = await fetchUrl(baseUrl, deviceKey, formData);

    if (Object.hasOwn(response, "errorMessage")) {
        // TODO: get property of object without the warning..? (does work though)
        throw new Error(`${response.errorMessage}`);
    }
    return response;
}

export async function postEmail(email: string) {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const formData = new FormData();
    formData.append("email", email);

                                            // backend urls are converted to all lowercase on deployment
    const response = await fetch(`${baseUrl}/feedbackvolunteer`, {
        method: 'POST',
        body: formData,
    });
    if (response.status != 200) {
        throw new Error('postEmail: Failed to save email address')
    }
}

export async function getStatistics() {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const response = await fetch(`${baseUrl}/statistics`, {
        method: "GET",
    });
    return await response.json() as { record: string, timestamp: number }[];
}

// TODO: modify to work with all fetch calls..? (or at least getprov??)
async function fetchUrl(baseUrl: string, deviceKey: string, formData: FormData) {
    for (let i = 1; i <= 3; i++) {
        try {
            const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
                method: "POST",
                // GET, send method as an argument? new func for get instead?
                body: formData,
            });

            if (response.status !== 200) {
                console.log(`Failed to post provenance: ${response.status} ${response.statusText}`)
                return { errorMessage: response.status + " " + response.statusText }
            }

            return await response.json() as { record: string, attachments?: string[] };
            // return await response.json() as { record: any, attachments?: string[], timestamp: number }[];
        } catch (e) {
            console.log("Fetch attempt failed: " + e);
        }
    }
    return { errorMessage: "Could not connect to the server, check your internet connection and try again" };
}