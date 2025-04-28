import { sendEmail } from "./sendEmail.js";
import { calculateDeviceID, decodeKey, decryptBlob, DecryptedBlob, encrypt, pathExists, sha256, toHex } from './httpTrigger.js';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { ContainerClient, Metadata, StorageSharedKeyCredential } from "@azure/storage-blob";

enum NotificationType {
    Email = 'email',
}

export interface Notification {
    toAddress: string;
    toName: string;
    subject: string;
    body: string;
    type: NotificationType;
}

export interface Subscriber {
    email: string;
    tags: string[];
}


///////////////////////////////////////////////////////////////////////////////////////////////////

// Notification Subscriptions are stored separately from the records
// A table of device ids to subscribers is maintained

// Notification Storage

// gosqas
//   -- gdt-notifications
//       -- subscribers
//           -- deviceID1
//           -- deviceID2
//           -- deviceID3

// Blob storage is write only so updates are new blobs.
// The deviceID is the name of the blob
// The blob contains the subscriber list per device id

const accountName = process.env["AZURE_STORAGE_ACCOUNT_NAME"] ?? "devstoreaccount1";
const accountKey = process.env["AZURE_STORAGE_ACCOUNT_KEY"] ?? "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
const baseUrl = accountName === "devstoreaccount1"
    ? `http://127.0.0.1:10000/devstoreaccount1`
    : `https://${accountName}.blob.core.windows.net`;

const cred = new StorageSharedKeyCredential(accountName, accountKey);
const containerClient = new ContainerClient(`${baseUrl}/gdt-notifications`, cred);

export async function uploadBlob(metadata: Metadata, blobName: string, encryptedData: Uint8Array): Promise<void> {
    console.log("uploadBlob", blobName);
    await containerClient.createIfNotExists();

    const containerExists = await containerClient.exists();
    const blobExists = await pathExists(containerClient, blobName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const exists = await blockBlobClient.exists();

    console.log("container exists:", containerExists, "blob exists:", blobExists, "block blob exists:", exists);

    await containerClient.uploadBlockBlob(
        blobName,
        encryptedData.buffer,
        encryptedData.length, {
        metadata,
        blobHTTPHeaders: {
            blobContentType: "application/octet-stream"
        }
    });
}

export async function downloadBlob(deviceKey: Uint8Array, blobName: string): Promise<DecryptedBlob | undefined> {
    console.log("downloadBlob", blobName);
    await containerClient.createIfNotExists();

    const containerExists = await containerClient.exists();
    if (!containerExists) {
        throw new Error("Container not found");
    }

    const blobClient = containerClient.getBlockBlobClient(blobName);
    const exists = await blobClient.exists();
    if (!exists) {
        // throw new Error("Blob not found");
        return undefined;
    }

    return await decryptBlob(blobClient, deviceKey);
}


///////////////////////////////////////////////////////////////////////////////////////////////////


export async function putSubscriber(deviceKey: Uint8Array, data: BufferSource, contentType: string,
    timestamp: number, fileName: string | undefined): Promise<void> {
    const dataHash = toHex(await sha256(data));
    const deviceID = await calculateDeviceID(deviceKey);
    const { salt, encryptedData } = await encrypt(deviceKey, data);

    // Unique ID for the blob, so that each change to the data is a new blob
    // const blobID = toHex(await sha256(encryptedData));

    // Virtual path for the blob
    const blobName = `subscribers/${deviceID}`;//${blobID}`;

    const { encryptedData: encryptedName } = fileName
        ? await encrypt(deviceKey, new TextEncoder().encode(fileName), salt)
        : { encryptedData: undefined };

    const metadata = {
        gdtcontenttype: contentType,
        gdthash: dataHash,
        gdtsalt: toHex(salt),
        gdttimestamp: `${timestamp}`,
        gdtname: encryptedName ? toHex(encryptedName) : ""
    };

    await uploadBlob(metadata, blobName, encryptedData);
}


export async function getSubscribers(deviceKey: Uint8Array, context?: InvocationContext): Promise<Subscriber[]> {
    const deviceID = await calculateDeviceID(deviceKey);
    const blobName = `subscribers/${deviceID}`;

    const decryptedBlob = await downloadBlob(deviceKey, blobName);
    if (!decryptedBlob) {
        context?.log("Blob not found");
        return [];
        // throw new Error("Blob not found");
    }

    const { data, contentType, filename } = decryptedBlob;
    context?.log("data:", data, "contentType:", contentType, "filename:", filename);

    const data_string = new TextDecoder().decode(data);
    context?.log("data_string:", data_string);

    const json = data_string ? JSON.parse(data_string) as Subscriber[] : [];

    context?.log("json:", json);
    return json;
}


export async function subscribeNotification(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    // This should be called from the frontend or another function like postProvenance

    context.log("subscribeNotification", JSON.stringify(request));
    try {
        const timestamp = Date.now();

        const body = await request.json() as Subscriber;
        context.log("body:", body);

        // Validate request
        if (!body.email) {
            throw new Error('Email is required');
        }

        if (!body.tags) {
            context.log("No tags... should subscribe to everything");
        }


        // assert(request.params.deviceKey, "deviceKey is required");
        context.log("deviceKey:", request.params.deviceKey);
        const deviceKey = decodeKey(request.params.deviceKey);
        const subscribers = await getSubscribers(deviceKey, context);

        context.log("subscribers:", subscribers);

        if (subscribers) {
            // Check if the subscriber is already in the list
            for (const subscriber of subscribers) {

                if (subscriber.email === body.email) {//} && subscriber.tags === obj.tags) {
                    return {
                        status: 200,
                        body: "Already subscribed"
                    };
                }
            }
        }

        // Add the subscriber
        // subscribers.push(obj);
        const updatedSubscribers = [...subscribers, body];
        context.log("subscribers:", updatedSubscribers);
        await putSubscriber(deviceKey, Buffer.from(JSON.stringify(updatedSubscribers)), "application/json", timestamp, undefined);

        return {
            status: 200,
            body: "Subscribed successfully"
        };

    } catch (error) {
        console.error(error);
        return {
            status: 400, // Bad request
            body: "Error subscribing"
        };
    }
}


// This might be called from the unsubscribe link in the email (or similar)
export async function unsubscribeNotification(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("unsubscribeNotification", JSON.stringify(request));

    try {
        const timestamp = Date.now();
        const body = await request.json() as Subscriber;
        
        context.log("body:", body);

        // Validate email
        if (!body.email) {
            throw new Error('Email is required');
        }

        if (!body.tags) {
            context.log("No tags... should unsub to everything");
        }

        const deviceKey = decodeKey(request.params.deviceKey);
        const subscribers = await getSubscribers(deviceKey, context);

        context.log("subscribers:", subscribers);

        // Check if there are any existing subscribers
        if (!subscribers || subscribers.length === 0) {
            context.log("No subscribers");
            return {
                status: 200,
                body: "No subscribers"
            }
        }


        // Check if the subscriber is already in the list
        for (const subscriber of subscribers) {
            if (subscriber.email === body.email) {
                // Existing subscription
                // Remove the subscriber
                const updatedSubscribers = subscribers.filter(s => s.email !== body.email);
                context.log("subscribers:", updatedSubscribers);

                // Update the subscribers
                await putSubscriber(deviceKey, Buffer.from(JSON.stringify(updatedSubscribers)), "application/json", timestamp, undefined);

                context.log("Unsubscribed successfully");
                return {
                    status: 200,
                    body: "Unsubscribed successfully"
                };
            } else {
                context.log("Not subscribed");
                return {
                    status: 200,
                    body: "Not subscribed"
                }
            }
        }

    } catch (error) {
        context.error(error);
        return {
            status: 400, // Bad request
            body: "Error subscribing"
        };
    }
}


// Notification messaging

export async function sendNotification(context: InvocationContext, notification: Notification): Promise<void> {
    // TODO: add rate limiting, queueing, other notification channels and other notification logic

    try {
        switch (notification.type) {
            case NotificationType.Email:
                const from_address = process.env['FROM_ADDRESS'];
                if (!from_address) {
                    throw new Error('FROM_ADDRESS is not defined');
                }
                await sendEmail(context, from_address, notification.toAddress, notification.subject, notification.body, notification.toName);
                break;
            default:
                throw new Error('Unsupported notification type');
        }

    } catch (error) {
        console.error("Failed to send notification", error);
    }
}


export async function publishNotification(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    // When a provenance record is updated, this function will process the subscriptions and send notifications

    // Ideally only the subscription object should be needed, so the notification system can be decoupled from the 
    // provenance system prove that it works without provenance data

    console.log("notifySubscribers", JSON.stringify(request));

    // TODO: // This could take a long time! Add rate limiting, queueing etc.

    try {
        const deviceKey = decodeKey(request.params.deviceKey);
        const subscribers = await getSubscribers(deviceKey, context);

        context.log("subscribers:", subscribers);

        // Send email to each subscriber
        for (const subscriber of subscribers) {
            context.log("Sending notification to", subscriber);
            const notification = {
                toAddress: subscriber.email,
                toName: "Notification",
                subject: "Notification",
                body: "Notification body",
                type: NotificationType.Email
            };
            await sendNotification(context, notification);
        }

        return {
            status: 200,
            body: "Notified successfully"
        };

    } catch (error) {
        context.log(error);
        return {
            status: 400,
            body: "Error notifying subscribers",
        };
    }
}

export async function getAllSubscribers(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("getAllSubscribers", JSON.stringify(request));

    try {
        const deviceKey = decodeKey(request.params.deviceKey);
        const subscribers = await getSubscribers(deviceKey, context);

        context.log("subscribers:", subscribers);

        return {
            status: 200,
            body: JSON.stringify(subscribers)
        }
    } catch (error) {
        context.error(error);
        return {
            status: 400, // Bad request
            body: "Error subscribing"
        };
    }
}

// TODO: for dev only
app.get("getAllSubscribers", {
    authLevel: 'anonymous',
    route: 'notification/subscriber/{deviceKey}',
    handler: getAllSubscribers
})

app.post("subscribeNotification", {
    authLevel: 'anonymous',
    route: 'notification/subscribe/{deviceKey}',
    handler: subscribeNotification
})

app.post("unsubscribeNotification", {
    authLevel: 'anonymous',
    route: 'notification/unsubscribe/{deviceKey}',
    handler: unsubscribeNotification
})

// TODO: this shouldn't be a public endpoint
app.post('publishNotification', {
    authLevel: 'anonymous',
    route: 'notification/publish/{deviceKey}',
    handler: publishNotification
})
