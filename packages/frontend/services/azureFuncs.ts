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

// Feature flag to turn ON/OFF Offline Mode features while in development
export var offlineModeFeatureFlag = { flag: false };

// Global variable used to control the display of offline banner on create pages
export var displayOfflineBanner = false;

// Global variable used to control the display of online banner 
export var displayOnlineBanner = false;

// Global url for onlineTestFetch
export var testOnlineTestUrl = { url: useRuntimeConfig().public.frontendUrl };

// Global base url for emptyStash
export var emptyStashBaseUrl = { url: useRuntimeConfig().public.baseUrl };

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
        // offline mode feature flag toggle
        if (offlineModeFeatureFlag.flag) {
            // Checks to see if user is offline, stashes record if offline
            const checkOffline = await offlineDetectAndStash(deviceKey, formData);
            if (checkOffline === 202) {
                throw new Error('Status 202: User is offline but the record has been stashed')
            } else if (checkOffline === 507) {
                throw new Error('Storage limit has been reached, record not stashed')
            }
        }
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

export async function onlineTestFetch(url?: string): Promise<boolean> {
    let result = true;

    // This is added to make testing easier, if no parameter given -> defaults to pinging our frontend.
    // Given parameter can be bogus url to mock offlineness
    if (url === undefined) {
        url = testOnlineTestUrl.url;
    }

    try {
        let response = await fetch(url, { cache: 'no-store'});
        if (response.status !== 200) {
            result = false;

            if (offlineModeFeatureFlag.flag) { displayOfflineBanner = true; }
        } 


    } catch (error) {
        console.log("Fetch attempt failed: " + error);
        result = false;
        if (offlineModeFeatureFlag.flag) { displayOfflineBanner = true; }
    }

    return result

}

export async function connectivityChecker() {
    // While offlineTestFetch returns false, test for onlineness every 5 seconds. Return when back online (offlineTestFetch returns true)
    while (!(await onlineTestFetch())) {
        await new Promise((r) => setTimeout(r, 5000));
    }

    return;
}

export async function stashRequest(recordKey: string, formData: FormData) {
    try {
        // Convert values to string and store them
        let valuesToStore = [];
        valuesToStore.push(['recordKey', recordKey]);
        valuesToStore.push(['provenanceRecord', formData.get('provenanceRecord')]);

        // Get stash_counter and add 1 to it
        let current_request = localStorage.getItem('stash_counter');
        if (current_request == null) {
            current_request = '0';
        }
        let stash_counter = parseInt(current_request) + 1;
        localStorage.setItem('stash_counter', stash_counter.toString());

        // Store the request at a unique key (gosqas-offline-stash-#)
        let request_name = 'gosqas-offline-stash-' + stash_counter;
        localStorage.setItem(request_name, JSON.stringify(valuesToStore));
    } catch (error: any) {
        // This web API error is thrown when localStorage is full
        if (error.name === "QuotaExceededError" ) {
            console.log('localStorage is full: no more records can be stored')
            throw error
        }
    }
}

export function stashOfflineRequest(currentKey: string, stashName: string, request?: string) {
    // Function to stash an offline request (works for syncing, fulfilled, and failed stashes)
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
    // Function to remove an offline request from the stash (works for syncing, fulfilled, and failed stashes)
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
            // Remove key from other stashes (syncing/fulfilled)
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

export async function emptyStash() {
    // See how many requests are stored, if any
    let stash_counter = parseInt(localStorage.getItem('stash_counter') || "0");

    for (stash_counter; stash_counter > 0; stash_counter--) {
        // Get the last request stored
        let request_name = 'gosqas-offline-stash-' + stash_counter;
        let request = JSON.parse(localStorage.getItem(request_name) || '{}');
        let fullUrl;
        let record;
        let currentKey;

        // TODO: below checks do about the same thing, modify to only keep one (if statement from main)
        // If the request can't be parsed then remove it, needs to be parsed to add to failed stash
        try {
            request = JSON.parse(request);
            fullUrl = request[0][1];
            record = request[1][1];
            currentKey = fullUrl.split("/")[fullUrl.split("/").length - 1];
        } catch (error) {
            console.log(`Could not parse stashed request: ${error}`)
            localStorage.removeItem(request_name)
            localStorage.setItem('stash_counter', (stash_counter - 1).toString())
            continue
        }
        if (JSON.stringify(request) === '{}') { 
            localStorage.removeItem(request_name)
            localStorage.setItem('stash_counter', (stash_counter - 1).toString())
            continue
        }

        let baseUrl = emptyStashBaseUrl.url;
        let currentKey = request[0][1];
        let record = request[1][1];

        // If the environment is local add /provenance/ to the url
        let fullUrl = `${baseUrl}${currentKey}`;
        if (baseUrl.includes('localhost')) {
            fullUrl = `${baseUrl}/provenance/${currentKey}`;
        }

        try {
            // Move key into the syncing stash
            localStorage.removeItem(request_name);
            stashOfflineRequest(currentKey, "gdt-stash-syncing", request);

            // Fulfill the request and confirm it was created (this will throw an error if it fails)
            const formData = new FormData();
            formData.append('provenanceRecord', record);

            await fetchUrl(fullUrl, formData);  // fetchUrl POST handles retries/errors
            let response = await fetchUrl(fullUrl);  // fetchUrl GET returns [] if no record is found
            if ((await response.json()).length == 0) { throw new Error('Record failed to POST') }

            // Add created key to a list of successfully created keys to display later
            stashOfflineRequest(currentKey, "gdt-stash-fulfilled", request);
            removeOfflineRequest(currentKey, "gdt-stash-syncing");

        } catch (error) {
            // Move the request to the failed stash
            console.log("Record from localStorage failed to create: " + error);
            stashOfflineRequest(currentKey, "gdt-stash-failed", request);
            removeOfflineRequest(currentKey, "gdt-stash-syncing");
        }

        // Update the stash counter
        localStorage.setItem('stash_counter', (stash_counter - 1).toString());

        if (!await(onlineTestFetch())) {
            return 202;
        }
    }

    // Make sure that stash counter is set to empty now that we're out of the loop
    localStorage.setItem('stash_counter', '0');

    // Disable the offline banner and enable the online banner
    displayOfflineBanner = false;
    // Online banner currently doesn't have a way to be disabled, so we'll avoid enabling it until that is implemented
    // displayOnlineBanner = true;
    return 200;
}

export async function periodicChecker() {
    // Return if a checker is already running
    if (localStorage.getItem('gdt-awaiting-conectivity') == "true") {
        console.log("Instance of periodicChecker is already running, returning")
        return;
    }
    localStorage.setItem('gdt-awaiting-conectivity', "true");

    let stash_empty = false;
    let response = 404

    // Wait for the user to come back online then empty the stash
    while (!stash_empty) {
        await connectivityChecker();
        response = await emptyStash();
        if (response == 200) {
            stash_empty = true;
        }
    }

    localStorage.setItem('gdt-awaiting-conectivity', "false");
}

export async function offlineDetectAndStash (recordKey: string, formData: FormData) {
    try {
        // Check if the user is online or offline. Stash the request if the user is offline
        if ((await(onlineTestFetch()))) {
            return 200;
        } else {
            await stashRequest(recordKey, formData);
            // Intentionally left unawaited
            periodicChecker();
            return 202;
        }
    } catch (error: any) {
        if (error.name === "QuotaExceededError") {
            console.log('Storage limit has been reached: your record has not been stored')
            return 507;
        }
        else {
          console.log('Error in offlineDetectAndStash: ' + error)
        }
    }
}

export async function postNotificationEmail(email:string, recordKey: string) {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const response = await fetch(`${baseUrl}/notificationsubscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, recordKey }),
    });

    console.log('postNotificationEmail status:', response.status);

    if(response.status == 429) {
        throw new Error("We are experiencing a high volume of requests. Please try again later.")
    } else if (response.status != 200) {
        throw new Error('postNotificationEmail: Failed to send verification code')
    }

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