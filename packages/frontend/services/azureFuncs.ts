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

// Feature flag to turn ON/OFF Offline Mode features while in development (false == features disabled)
// If we're not on prod turn offline features on
export var offlineModeFeatureFlag = false;
if (!(useRuntimeConfig().public.baseUrl).includes("gdtprodbackend")) {
    offlineModeFeatureFlag = true;
}

// Global variable used to control the display of offline banner on create pages
export var displayOfflineBanner = false;

// Global variable used to control the display of online banner 
export var displayOnlineBanner = false;

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

export async function notifySubscribers(deviceKey: string, record: any) {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const formData = new FormData();
    formData.append("provenanceRecord", JSON.stringify(record));

    const response = await fetch(`${baseUrl}/notifySubscribers/${deviceKey}`, {
        method: 'POST',
        body: formData
    });

    if (response.status != 200 && response.status != 204) {
        throw new Error('notifySubscribers: Failed to notify all subscribers')
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

//TODO: update function call parameters in createDevice.vue, createContainer.vue, and test/postNotificationEmail.spec.ts
//TODO: find file with field for already created record

export async function removeNotificationEmail(deviceKey: string, emailID: string) {
    if (!validateKey(deviceKey)) {
        throw new Error("Bad key provided.");
    }
    if (!emailID || typeof emailID !== 'string') {
        throw new Error("Bad emailID provided.");
    }

    const baseUrl = useRuntimeConfig().public.baseUrl;
    
    const payload = {
        id: emailID,
        recordKey: deviceKey,
    };

    // match backend json format 
    const response = await fetch(`${baseUrl}/notificationUnsubscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (response.status !== 200) {
        let errorMessage = 'removeNotificationEmail: Failed to remove email';
        // Identify specific error message so we can know what went wrong.
        try {
            const responseData = await response.json();
            if (responseData.error) {
                errorMessage = `removeNotificationEmail: ${responseData.error}`;
            } else if (responseData.message) {
                errorMessage = `removeNotificationEmail: ${responseData.message}`;
            }
        } catch (e) {
            errorMessage = `removeNotificationEmail: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
}

export async function getStatistics() {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const response = await fetch(`${baseUrl}/statistics`, {
        method: "GET",
    });
    
    return await response.json() as { 
        records: { record: string, timestamp: number }[];
        totalRecords: number;
        totalDevices: number;
    };
}

async function fetchUrl(url: string, formData?: FormData) {
    let response = undefined;
    const MAX_RETRIES = 3;

    for (let i = 1; i <= MAX_RETRIES; i++) {
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

    if (response !== undefined && response.status !== 200 && response.status !== 429) {
        console.log(`Failed to post provenance: ${response.status} ${response.statusText}`)
        throw new Error(response.status + " " + response.statusText)
    } else if(response && response.status == 429) {
        throw new Error("We are experiencing a high volume of requests. Please try again later.")
    } else {
        throw new Error(`Could not connect to the server, check your internet connection and try again`);
    }
}

/**
 * @param options Optional. If omitted, fetch makes a GET request. Callers can set the method, headers, and body.
 * @param statusMessages Optional. Map of HTTP status codes to custom error messages.
 */
export async function fetchUrlWithErrorHandling(
    url: string,
    options?: RequestInit,
    statusMessages?: Readonly<Record<number, string>>
): Promise<Response> {
    let response: Response;

    try {
        // Supports any HTTP method accepted by fetch. Without options, fetch defaults to GET.
        response = await fetch(url, options);
    } catch {
        throw new Error("Could not connect to the server, check your internet connection and try again");
    }

    if (response.ok) {
        return response;
    }

    let errorMessage = `Request failed with status ${response.status}`;
    if (response.statusText) {
        errorMessage = `${response.status} ${response.statusText}`;
    }

    // Example of statusMessages: { 429: "We are experiencing a high volume of requests." }
    const statusErrorMessage = statusMessages?.[response.status];
    if (statusErrorMessage !== undefined) {
        errorMessage = statusErrorMessage;
    }

    throw new Error(errorMessage);
}

export function stashOfflineRequest(currentKey: string, stashName: string, request?: string) {
    // Function to stash an offline request (works for fulfilled and failed stashes)
    try {
        let requests = [];
        let stash = localStorage.getItem(stashName) || "{}";
        let existingRequests;

        // Get the previous requests from the stash
        if (stashName.includes("failed")) {
            existingRequests = JSON.parse(stash);
        } else {
            existingRequests = stash.split(",");
        }

        // Get the existing stashed requests, skip the loop if there are none
        if (JSON.stringify(existingRequests) !== "{}" && JSON.stringify(existingRequests) !== '["{}"]') {
            for (const storedRequest of existingRequests) {
                // If new request == existing request, exit without updating the stash
                if ((request && storedRequest[0][1] == request[0][1]) || storedRequest == currentKey) {
                    return;
                }

                requests.push(storedRequest);
            }
        }

        // Add the new request and set the new stash value
        if (stashName.includes("failed")) {
            requests.push(request);
            localStorage.setItem(stashName, JSON.stringify(requests));
        } else {
            requests.push(currentKey);
            localStorage.setItem(stashName, requests.toString());
        }

    } catch (error) {
        console.log("Failed to Stash: " + error);
        throw error;
    }
}

export function removeOfflineRequest(currentKey: string, stashName: string) {
    // Function to remove an offline request from the stash (works for fulfilled and failed stashes)
    try {
        let requests = [];
        let stash = localStorage.getItem(stashName) || "{}";
        let existingRequests;

        // Get the previous requests from the stash
        if (stashName.includes("failed")) {
            existingRequests = JSON.parse(stash);
        } else {
            existingRequests = stash.split(",");
        }

        // If there are no previous requests exit the function (nothing to remove)
        if (JSON.stringify(existingRequests) == "{}" || JSON.stringify(existingRequests) == '["{}"]') {
            return;
        }

        if (stashName.includes("failed")) {
            // Remove request from failed stash
            for (let i = 0; i < existingRequests.length; i++) {
                let fullUrl = existingRequests[i][0][1];
                let requestKey = fullUrl.split("/")[fullUrl.split("/").length - 1];

                // Add back all requests except the one we're removing 
                if (requestKey != currentKey) {
                    requests.push(existingRequests[i]);
                }
            }
            localStorage.setItem(stashName, JSON.stringify(requests))
        } else {
            // Remove key from fulfilled stash
            const index = existingRequests.indexOf(currentKey);
            if (typeof existingRequests != "string" && index > -1) {
                existingRequests.splice(index, 1);
            }
            localStorage.setItem(stashName, existingRequests.toString())
        }

    } catch (error) {
        console.log("Failed to Remove from Stash: " + error);
        throw error;
    }
}

export async function confirmRequestFulfilled(recordKey: string, record?: any): Promise<boolean> {
    try {
        let response = await getProvenance(recordKey)

        // For history entry addition in existing record
        if (response && response[0].record.description === record?.description) {
            return true
        } 
        // For checking newly created record
        else if (response && record === undefined) {
            return true
        }

    } catch(error) {
        throw error
    }

    return false
}

export async function postNotificationEmail(email:string, recordKey: string) {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const response = await fetchUrlWithErrorHandling(
        `${baseUrl}/notificationSubscription`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, recordKey }),
        },
        {
            429: "We are experiencing a high volume of requests. Please try again later.",
            500: "We could not send the verification email. Please try again later.",
        }
    );

    console.log('postNotificationEmail status:', response.status);

    const data = await response.json();
    return data.token as string;
}

export async function postVerifyCode(token: string, code: string) {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const response = await fetch(`${baseUrl}/verifycode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code }),
    });
    if (response.status != 200) {
        throw new Error('postVerifyCode: Failed to verify code')
    }

    const data = await response.json();
    return data.recordKey as string;

}

export async function getPendingVerification(token: string) {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const response = await fetch(`${baseUrl}/pendingverification?token=${token}`, {
        method: 'GET',
    });
    // if (response.status != 200) {
    //     throw new Error('getPendingVerfication: invalid or expired token')
    // }
    if (response.status === 404) return null;
    const data = await response.json();
    return data.recordKey as string ?? null;
}

export async function postResendCode(token: string) {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const response = await fetch(`${baseUrl}/resendcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });
    if (response.status !== 200) {
        throw new Error('postResendCode: Failed to resend code')
    }
}
export async function getBrowserStats() {
    
        const baseUrl = useRuntimeConfig().public.baseUrl;
        const response = await fetch(baseUrl + "/stats/browsers", {
            method: 'GET',
        });

        const stats = await response.text()
        if (!stats) throw new Error(`Empty response (status ${response.status})`)
    
    try {     
        return JSON.parse(stats);
    } catch (error) {
        throw new Error(`Server error (status ${response.status}): ${stats.slice(0, 200)}`)
    }
}
