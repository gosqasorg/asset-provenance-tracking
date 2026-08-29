import { HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import { encode as base58encode } from '@urlpack/base58';

const NOTIFICATION_TYPE = 'notificationSignups';
const FROM_ADDRESS = process.env['SENDER_EMAIL'];
const SUBJECT = 'GDT Tracking update';
const BASE_URL = process.env['frontend_url']; // for unsubscribe page

export async function notifySubscribers(containerClient: ContainerClient, calculateDeviceID: (key: string | Uint8Array) => Promise<string>, deviceKey: string, formData: any, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Entered notifySubscribers')
    const record = JSON.parse(formData.get('provenanceRecord'));
    const description = record ? record.description : "";

    // Notify users who subscribed to this record.
    const retrieveNotifEmailResponse = await retrieveNotifEmails(containerClient, calculateDeviceID, deviceKey);
    const extractedEmails = extractEmailsFromResponse(retrieveNotifEmailResponse);
    const emailSet = extractedEmails[0] || new Set<string>();
    const emailIDArray = extractedEmails[1] || [];
    if (emailSet.size === 0) {
        context.log("No subscribers found for this record.");
        return { status: 204 };
    }

    if (!process.env['COMMUNICATION_SERVICES_CONNECTION_STRING']) {
        context.log("COMMUNICATION_SERVICES_CONNECTION_STRING not set. Skipping sendEmail.");
        return;
    }

    const displayName: string = FROM_ADDRESS;
    let index = 0;
    try {
        const { sendEmail } = await import('./sendEmail.js'); //  This prevents the top-level code in sendEmail.ts from running at startup.
        for (const to_email of emailSet) {
            const unsubscribe_page: string = `${BASE_URL}/history/unsubscribe/${deviceKey}?id=${emailIDArray[index]}`;
            let email_body: string;
            if(description) {
                // Non-blank description
                email_body = `<div>Hello GDT User,<br><br>You are receiving this message because you are signed up for updates to the following record:<br><a href="${BASE_URL}/history/${deviceKey}">${BASE_URL}/history/${deviceKey}</a><br><br>This record has received an update: ${description}.</div><br><div>Click <a href="${unsubscribe_page}">here</a> if you wish to unsubscribe.<br><br>Best regards,<br>Global Distributed Tracking</div>`;
            } else {
                // Blank description
                email_body = `<div>Hello GDT User,<br><br>You are receiving this message because you are signed up for updates to the following record:<br><a href="${BASE_URL}/history/${deviceKey}">${BASE_URL}/history/${deviceKey}</a><br><br>This record has received an update. To see it, visit the record by clicking the link above.</div><br><div>Click <a href="${unsubscribe_page}">here</a> if you wish to unsubscribe.<br><br>Best regards,<br>Global Distributed Tracking</div>`;
            }
            index++
            let result = await sendEmail(FROM_ADDRESS, to_email, SUBJECT + ` for record ${deviceKey}`, email_body, displayName, context);

            if (result.status !== "Succeeded") {
                throw result.message
            }
        }
        return { status: 200 };
    } catch (error) {
        context.error("Error sending email: ", error.statusCode, error);
        throw error
    }
}

export async function setupBlobClient(containerClient: ContainerClient, calculateDeviceID: (key: string | Uint8Array) => Promise<string>, deviceKey: string) {
    // 0: Setup id
    const deviceID = await calculateDeviceID(deviceKey);

    // 1: Setup blob name & client
    const blobName = `${NOTIFICATION_TYPE}/${deviceID}`
    const blobClient = containerClient.getBlockBlobClient(blobName);

    // 2: Return blob content (so we can read existing content, merge email list, write back)
    return [blobName, blobClient] as const;
}

export async function getExisitingEmails(exists: boolean, blobClient: BlockBlobClient) {
    // Get all the emails and ids currently stored in the blob
    let existingEmails: string[] = [];
    let existingEmailIDs: string[] = [];

    if (exists) {
        const buffer = await blobClient.downloadToBuffer();
        const text = buffer.toString("utf8");

        if (text) {
            const parsed = JSON.parse(text) as any;
            const emailsFromBlob = parsed?.email;
            if (Array.isArray(emailsFromBlob)) {
                existingEmails = emailsFromBlob.filter(email => {
                    return typeof email === "string";
                });
            }

            const emailIDsFromBlob = parsed?.email_id;
            if (Array.isArray(emailIDsFromBlob)) {
                existingEmailIDs = emailIDsFromBlob.filter(id => {
                    return typeof id === "string";
                });
            }
        }
    }

    const emailSet = new Set(
        existingEmails
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)
    );

    const emailIDSet = new Set(
        existingEmailIDs
        .map(s => s.trim())
        .filter(Boolean)
    );

    return [emailSet, emailIDSet] as const;
}

async function uploadBlob(containerClient: ContainerClient, blobName: string, emailSet: Set<string>, emailIDSet: Set<string>, tags: string[]) {
    // Setup data to upload
    const payloadObj = { email: Array.from(emailSet), email_id: Array.from(emailIDSet), tags};
    const data = JSON.stringify(payloadObj);

    const uploadOptions = {
        tier: "Cool",
        blobHTTPHeaders: {
            blobContentType: "application/json; charset=utf-8",
        },
    };

    // Note: do not reformat; leave as commented
    let status = (await containerClient.uploadBlockBlob(
                    blobName,        // 1. Blob name
                    data,           // 2. body (can be a string)
                    data.length,   // 3. length of body in bytes (or Buffer.byteLength(data))
                    uploadOptions // 4. optional options
    )).response._response.status

    if (status < 300 && status >= 200) {
        return {
            jsonBody: { message: "Success",
                        name: blobName },
            status: 200
        }
        // TODO: have frontend display in snackbar for status 4xx
        // This means nothing for now since we're not validating that what we're being handed is an email.
    } else {
        throw new Error()
    }
}

export async function subscribeToNotifications(containerClient: ContainerClient, calculateDeviceID: (key: string | Uint8Array) => Promise<string>, deviceKey: string, email: string, tags: string[] = []) {
    /*
       Note: this is not a general-purpose function. This proof-of-concept exclusively adds new key-value pairs where no key yet exists.
       We look up the blob using the devicekey, and the blobid, which is just a hash of the data. So we can hash the email.

       Master docs here:
       // https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/containerclient?view=azure-node-latest#@azure-storage-blob-containerclient-uploadblockblob

       * The BlockBlobUploadOptions Interface is where storage tier is set.
         - https://learn.microsoft.com/en-us/javascript/api/%40azure/storage-blob/blockblobuploadoptions?view=azure-node-latest
    */

    let keysToCheck = [deviceKey];

    // Confirm the email exists
    const normalized = (email ?? "").trim().toLowerCase();
    if (!normalized) {
        return { jsonBody: { message: "Email not provided" }, status: 404 };
    }

    // Loop through record/children keys and subscribe to all of them
    while (keysToCheck.length != 0) {
        // Add any children of the current key to the list to subscribe to
        let key = keysToCheck[0];
        let uniqueChildKeys = await getChildKeys(key, deviceKey);
        keysToCheck = keysToCheck.concat(uniqueChildKeys);

        // Setup the blobClient and get emails subscribed to the record
        let [blobName, blobClient] = await setupBlobClient(containerClient, calculateDeviceID, key);
        const exists = await blobClient.exists();
        let [emailSet, emailIDSet] = await getExisitingEmails(exists, blobClient);

        // Add the specified email to the set
        const sizeBeforeAdding = emailSet.size;
        emailSet.add(normalized);

        // If email is already stored move on to the next key to check
        if (exists && emailSet.size === sizeBeforeAdding) {
            keysToCheck.shift();
            continue;
        }

        // Generate a unique string id to represent the new email
        const uniqueString = await crypto.subtle.generateKey(
            {
            name: "AES-CBC",
            length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );

        const buffer = await crypto.subtle.exportKey("raw", uniqueString);
        const uniqueEmailString = base58encode(new Uint8Array(buffer));
        emailIDSet.add(uniqueEmailString)

        try {
            // Update our stored emails to include the new email/id
            uploadBlob(containerClient, blobName, emailSet, emailIDSet, tags);
        } catch(error) {
            return {
                jsonBody: {message: 'Failed to subscribe to email notifications'},
                status: 500,
            }
        }

        keysToCheck.shift();
    }

    return {
        jsonBody: { message: "Success" },
        status: 200
    }
}

export async function unsubscribeFromNotifications(containerClient: ContainerClient, calculateDeviceID: (key: string | Uint8Array) => Promise<string>, deviceKey: string, emailID: string, tags: string[] = []) {
    // Get the email that corresponds to the given email id
    let keysToCheck = [deviceKey];

    const [blobName, blobClient] = await setupBlobClient(containerClient, calculateDeviceID, deviceKey);
    const exists = await blobClient.exists();
    const [emailSet, emailIDSet] = await getExisitingEmails(exists, blobClient);

    // Confirm the emailID/email exists
    const emailIndex = Array.from(emailIDSet).indexOf(emailID);
    if (emailIndex < 0) {
        return { jsonBody: { message: "Email not found in the database" }, status: 200 };
    }
    const existingEmails = Array.from(emailSet);
    const email = existingEmails[emailIndex];
    const normalized = (email ?? "").trim().toLowerCase();

    // Loop through record/children keys and unsubscribe from all of them
    while (keysToCheck.length != 0) {
        // Add any children of the current key to the list to unsubscribe from
        let key = keysToCheck[0];
        let uniqueChildKeys = await getChildKeys(key, deviceKey);
        keysToCheck = keysToCheck.concat(uniqueChildKeys);

        // Setup the blobClient and get emails subscribed to the record
        let [blobName, blobClient] = await setupBlobClient(containerClient, calculateDeviceID, key);
        const exists = await blobClient.exists();
        let [emailSet, emailIDSet] = await getExisitingEmails(exists, blobClient);

        // Check if the email is subscribed to the child record
        const emailIndex = Array.from(emailSet).indexOf(email);
        if (emailIndex < 0) {
            keysToCheck.shift();
            continue
        }

        // Get the child record's id
        const existingEmailIDs = Array.from(emailIDSet);
        const emailID = existingEmailIDs[emailIndex];

        // Remove the specified email and id from the set
        emailSet.delete(normalized);
        emailIDSet.delete(emailID);

        try {
            // Update our stored emails to no longer include the specified email/id
            uploadBlob(containerClient, blobName, emailSet, emailIDSet, tags);
        } catch(error) {
            return {
                jsonBody: {message: 'Failed to unsubscribe from email notifications'},
                status: 500,
            }
        }

        keysToCheck.shift();
    }

    return {
        jsonBody: { message: "Success",
                    name: blobName },
        status: 200
    }
}

export async function retrieveNotifEmails(containerClient: ContainerClient, calculateDeviceID: (key: string | Uint8Array) => Promise<string>, key: string) {
    // https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-download-javascript?tabs=javascript
    const deviceID = await calculateDeviceID(key);
    const blobName = `${NOTIFICATION_TYPE}/${deviceID}`

    try {
        const blobClient = containerClient.getBlobClient(blobName);
        const downloadResponse = await blobClient.download();
        const downloaded = await streamToString(downloadResponse.readableStreamBody);
        console.log('Downloaded blob content:', downloaded.toString());

        return {
            jsonBody: { message: downloaded},
            status: 200
        }
    } catch(error) {
        return {
            jsonBody: {message: error.message},
            status: 500,
        }
    }
}

async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
    });
}

export function extractEmailsFromResponse(response: any) {
    const emailSet = new Set<string>();
    const emailIDArray = new Array<string>();
    if (!response || (response.status !== 200) || !response.jsonBody || !response.jsonBody.message) {
        return emailSet;
    }
    try {
        const parsed = JSON.parse(response.jsonBody.message);
        let emails = parsed.email
        let emailIDs = parsed.email_id
        emails.forEach((e: string) => emailSet.add(e));
        emailIDs.forEach((e: string) => emailIDArray.push(e));
    } catch (error) {
        console.log("Failed to extract emails:", error.message)
    }
    return [emailSet, emailIDArray];
}

async function getChildKeys(key: string, groupKey: string): Promise<string[]> {
    const baseUrl = process.env['backend_url'];
    let getKey = await fetch(`${baseUrl}${key}`);
    const provenance = await getKey.json();

    let childKeys: string[] = []

    for (const p of provenance) {
        const child = p.record.children_key; // Can be "" if not a group or string[] if a group
        // child may be undefined or an empty array
        if (!child || !child.length || child == '') {
            continue;
        }
        childKeys = [...childKeys, ...child];
    }

    let childrenKeys = Array.from(new Set(childKeys));

    // Remove group key if it's stored to prevent infinite loops
    if (childrenKeys.includes(groupKey.toString())) {
        childrenKeys.splice(childrenKeys.indexOf(groupKey.toString()), 1);
    }

    return childrenKeys
}
