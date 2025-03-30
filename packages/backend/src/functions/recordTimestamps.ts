import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { ContainerClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import JSON5 from 'json5';
import { calculateDeviceID, decodeKey, decryptBlob, DecryptedBlob, encrypt, pathExists, sha256, toHex } from './httpTrigger.js';



// TODO: Access container named timestamp, upload new blobs, and get existing blobs
// To my understanding this will be called by funcs of the same name in azureFuncs.ts,
// which is called from CreateRecord.vue

// ERROR: Uncaught (in promise) Error: Failed to post timestamps: 404
// I think the issue is that I haven't created a container named timestamp so it can't connect
// but it doesn't even seem like the frontend code is reaching the backend because these functions
// never get called



// Get account name and key to connect to the Azure Blob Storage
const accountName = process.env["AZURE_STORAGE_ACCOUNT_NAME"] ?? "devstoreaccount1";
const accountKey = process.env["AZURE_STORAGE_ACCOUNT_KEY"] ?? "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
const baseUrl = accountName === "devstoreaccount1" ? `http://127.0.0.1:10000/devstoreaccount1` : `https://${accountName}.blob.core.windows.net`;

const cred = new StorageSharedKeyCredential(accountName, accountKey);
const containerClient = new ContainerClient(`${baseUrl}/timestamps`, cred);  // container where we store timestamp blobs


// NOTE: All of this is untested as of now, because I can't get the frontend to call it
// Function to post new timestamps to the container (and create it if it doesn't exist)
export async function postTimestamps(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    console.log("BACKEND postTimestamps")

    // Create container if it doesn't exist
    await containerClient.createIfNotExists();

    // Get the form data (formData = {blobType, deviceKey, timestamp})
    const formData = await request.formData();
    const provenanceRecord = formData.get("timestampRecord");
    if (typeof provenanceRecord !== 'string') { return { status: 404 }; }
    const record = JSON5.parse(provenanceRecord);

    // Add formData to the container as a new blob
    const timestamp = new Date().getTime();
    const attachments = new Array<NamedBlob>();
    for (const attach of formData.values()) {
        if (typeof attach === 'string') continue;
        attachments.push({ blob: attach, name: attach.name });
    }

    const body = await uploadProvenance(containerClient, deviceKey, timestamp, record, attachments);
    return { jsonBody: body ?? { converted: true}};
}


// NOTE: Even this function doesn't work, even though it is just returning an empty list
// Function to get timestamps currently stored
async function getTimestamps(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    console.log("BACKEND getTimestamps")

    // Make sure the path exists and connect to the container
    const containerExists = await containerClient.exists();
    if (!containerExists) { return { jsonBody: [] }; }

    // Get the records and sort them by timestamp, removing ones >200 seconds old
    const records = []

    // Return the retreived records
    return { jsonBody: records };
}



// Post with app (doesn't work when connected directly to frontend)
app.get("getTimestamps", {
    authLevel: 'anonymous',
    route: 'timestamps',
    handler: getTimestamps,
})

app.post("postTimestamps", {
    authLevel: 'anonymous',
    route: 'timestamps',
    handler: postTimestamps,
})