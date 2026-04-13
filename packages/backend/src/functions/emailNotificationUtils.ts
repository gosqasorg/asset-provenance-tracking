import { HttpResponseInit, InvocationContext } from "@azure/functions";
import { ContainerClient } from "@azure/storage-blob";

const NOTIFICATION_TYPE = 'notificationSignups';
const FROM_ADDRESS = "DoNotReply@8577d69b-9011-4385-abec-cfe9325dbfe6.azurecomm.net";
const SUBJECT = 'Tracking update';
const EMAIL_BODY = 'Hi, you are receiving this message because you signed up for record updates.';

export async function notifySubscribers(containerClient: ContainerClient, calculateDeviceID: (key: string | Uint8Array) => Promise<string>, deviceKey: string, context: InvocationContext): Promise<HttpResponseInit> {
    // Notify users who subscribed to this record.
    const retrieveNotifEmailResponse = await retrieveNotifEmails(containerClient, calculateDeviceID, deviceKey);
    const emailSet = extractEmailsFromResponse(retrieveNotifEmailResponse);
    if (emailSet.size === 0) {
        context.log("No subscribers found for this record.");
        return;
    }

    if (!process.env['COMMUNICATION_SERVICES_CONNECTION_STRING']) {
        context.log("COMMUNICATION_SERVICES_CONNECTION_STRING not set. Skipping sendEmail.");
        return;
    }

    const displayName: string = FROM_ADDRESS;
    try {
        const { sendEmail } = await import('./sendEmail.js'); //  This prevents the top-level code in sendEmail.ts from running at startup.
        for (const to_email of emailSet) {
            await sendEmail(FROM_ADDRESS, to_email, SUBJECT, EMAIL_BODY, displayName);
        }
    } catch (error) {
        context.log("Error sending email: " + error);
    }
}

export async function signupForNotifications(containerClient: ContainerClient, calculateDeviceID: (key: string | Uint8Array) => Promise<string>, deviceKey: string, email: string, tags: string[] = []) {
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
    const normalized = (email ?? "").trim().toLowerCase();
    if (!normalized) {
        return { jsonBody: { message: "Ignored empty email" }, status: 200 };
    }

    // 3 Update blob content：read existing content, merge email list, write back
    const exists = await blobClient.exists();

    let existingEmails: string[] = [];
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
        }
    }

    const emailSet = new Set(
        existingEmails
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)
    );

    const sizeBeforeAdding = emailSet.size;
    emailSet.add(normalized);

    if (exists && emailSet.size === sizeBeforeAdding) {
        return {
        jsonBody: { message: "Success", name: blobName },
        status: 200,
        };
    }

    const payloadObj = { email: Array.from(emailSet), tags};
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
            throw Error('Failed to store email')
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

export function extractEmailsFromResponse(response: any): Set<string> {
    const emailSet = new Set<string>();
    if (!response || (response.status !== 200) || !response.jsonBody || !response.jsonBody.message) {
        return emailSet;
    }
    try {
        const parsed = JSON.parse(response.jsonBody.message);
        if (parsed.email && Array.isArray(parsed.email)) {
            parsed.email.forEach((e: string) => emailSet.add(e));
        } else if (parsed.key?.email) {
            emailSet.add(parsed.key.email);
        }
    } catch (error) {
        console.log("Fail to extract emails:", error.message)
    }
    return emailSet;
}
