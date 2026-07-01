import { HttpResponseInit, InvocationContext } from "@azure/functions";
import { ContainerClient } from "@azure/storage-blob";
import { encode as base58encode } from '@urlpack/base58';

const NOTIFICATION_TYPE = 'notificationSignups';
const FROM_ADDRESS = "DoNotReply@8577d69b-9011-4385-abec-cfe9325dbfe6.azurecomm.net"
const SUBJECT = 'GDT Tracking update';
const BASE_URL = process.env['frontend_url']; // for unsubscribe page

export async function notifySubscribers(containerClient: ContainerClient, calculateDeviceID: (key: string | Uint8Array) => Promise<string>, deviceKey: string, formData: any, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Entered notifySubscribers')
    const description = JSON.parse(formData.get('provenanceRecord')).description

    // Notify users who subscribed to this record.
    const retrieveNotifEmailResponse = await retrieveNotifEmails(containerClient, calculateDeviceID, deviceKey);
    const extractedEmails = extractEmailsFromResponse(retrieveNotifEmailResponse);
    const emailSet = extractedEmails[0] || new Set<string>();
    const emailIDArray = extractedEmails[1] || [];
    if (emailSet.size === 0) {
        context.log("No subscribers found for this record.");
        return;
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
            let result = await sendEmail(FROM_ADDRESS, to_email, SUBJECT + ` for record ${deviceKey}`, email_body, displayName);

            if (result.status !== "Succeeded") {
                throw result.message
            }
        }
    } catch (error) {
        context.error("Error sending email: " + error);
    }
}

export async function updateNotifications(containerClient: ContainerClient, calculateDeviceID: (key: string | Uint8Array) => Promise<string>, deviceKey: string, emailInfo: string, tags: string[] = [], subscribing: boolean) {
    /*
       Note: this is not a general-purpose function. This proof-of-concept exclusively adds new key-value pairs where no key yet exists.
       We look up the blob using the devicekey, and the blobid, which is just a hash of the data. So we can hash the email.

       Master docs here:
       // https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/containerclient?view=azure-node-latest#@azure-storage-blob-containerclient-uploadblockblob

       * The BlockBlobUploadOptions Interface is where storage tier is set.
         - https://learn.microsoft.com/en-us/javascript/api/%40azure/storage-blob/blockblobuploadoptions?view=azure-node-latest
    */

    // 0: setup id
    const deviceID = await calculateDeviceID(deviceKey);

    // 1: setup data

    // 2 Setup blob name & id
    const blobName = `${NOTIFICATION_TYPE}/${deviceID}`
    const blobClient = containerClient.getBlockBlobClient(blobName);

    // 3 Update blob content：read existing content, merge email list, write back
    const exists = await blobClient.exists();

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

    let emailID = "";
    let email = emailInfo;

    // If we're unsubscribing convert the emailID to email
    if (!subscribing) {
        emailID = emailInfo;
        const emailIndex = existingEmailIDs.indexOf(emailID);
        email = existingEmails[emailIndex];
    }

    const normalized = (email ?? "").trim().toLowerCase();
    if (!normalized) {
        return { jsonBody: { message: "Email not found in the database" }, status: 404 };
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

    const sizeBeforeAdding = emailSet.size;
    if (subscribing) {
        emailSet.add(normalized);
    } else {
        emailSet.delete(normalized);
        emailIDSet.delete(emailID);
    }

    // Generate a unique string id to represent the new email (only if we're subscribing, skips if unsubscribing)
    for (let i = emailIDSet.size; i < emailSet.size; i++) {
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
    }

    if (exists && emailSet.size === sizeBeforeAdding) {
        return {
        jsonBody: { message: "Success", name: blobName },
        status: 200,
        };
    }

    const payloadObj = { email: Array.from(emailSet), email_id: Array.from(emailIDSet), tags};
    const data = JSON.stringify(payloadObj);

    const uploadOptions = {
        tier: "Cool",
        blobHTTPHeaders: {
            blobContentType: "application/json; charset=utf-8",
        },
    };

    try {
        // Note: do not reformat; leave as commented
        let status = (await containerClient.uploadBlockBlob(
                        blobName,   // 1. Blob name
                        data,       // 2. body (can be a string)
                        data.length, // 3. length of body in bytes (or Buffer.byteLength(data))
                        // 4. optional options
                        // nothing for now
                        // we need to set BlockBlobUploadOptions to set usage tier
                        uploadOptions
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
            throw Error('Failed to update email')
        }
    } catch(error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
            jsonBody: {message: error.message},
            status: 500,
        }
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
