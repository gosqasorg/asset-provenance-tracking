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
        const fullUrl = baseUrl + "/provenance/" + deviceKey;

        try {
            let response = await fetchUrl(fullUrl);
            return await response.json() as { record: any, attachments?: string[], timestamp: number }[];
        } catch (error) {
            throw error;
        }
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
    
    const fullUrl = baseUrl + "/provenance/" + deviceKey;
    try {
        let response = await fetchUrl(fullUrl, formData);
        return await response.json() as { record: string, attachments?: string[] };
    } catch (error) {
        throw error;
    }
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

//TODO: update function call parameters in createDevice.vue, createContainer.vue, and test/postNotificationEmail.spec.ts
//TODO: find file with field for already created record


export async function postNotificationEmail(deviceKey: string, email: string, tags: string[] = []) {
    if (!validateKey(deviceKey)) {
        throw new Error("Bad key provided.");
    }
    //TODO: 
    if (!email || typeof email !== 'string') {
        throw new Error("Bad email provided.");
    }

    const baseUrl = useRuntimeConfig().public.baseUrl;
    
    const payload = {
        email: email,
        recordKey: deviceKey,  // bckend expects 'recordKey'?
        tags: tags             // Optional ..?
    };

    //match backend json format 
    const response = await fetch(`${baseUrl}/notificationSubscription`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (response.status !== 200) {
        let errorMessage = 'postNotificationEmail: Failed to save email';
        //Identify specific error message so we can see more than just 'failed to save' and know what went wrong.
        try {
            const responseData = await response.json();
            if (responseData.error) {
                errorMessage = `postNotificationEmail: ${responseData.error}`;
            } else if (responseData.message) {
                errorMessage = `postNotificationEmail: ${responseData.message}`;
            }
        } catch (e) {
            errorMessage = `postNotificationEmail: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
}

export async function getStatistics() {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const response = await fetch(`${baseUrl}/statistics`, {
        method: "GET",
    });
    return await response.json() as { record: string, timestamp: number }[];
}

async function fetchUrl(url: string, formData?: FormData) {
    let response = undefined;

    for (let i = 1; i <= 3; i++) {
        try {
            if (typeof formData !== 'undefined') {
                response = await fetch(`${url}`, {
                    method: "POST",
                    body: formData,
                });
            } else {
                response = await fetch(`${url}`, {
                    method: "GET"
                });
            }

            if (response !== undefined && response.status == 200) {
                return response;
            }
        } catch (e) {
            console.log("Fetch attempt failed: " + e);
        }
    }

    if (response !== undefined && response.status !== 200) {
        console.log(`Failed to post provenance: ${response.status} ${response.statusText}`)
        throw new Error(response.status + " " + response.statusText)
    } else {
        throw new Error(`Could not connect to the server, check your internet connection and try again`);
    }
}