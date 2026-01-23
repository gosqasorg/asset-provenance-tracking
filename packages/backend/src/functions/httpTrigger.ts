import bs58 from 'bs58';
import JSON5 from 'json5';
import * as z from "zod";
import { webcrypto as crypto } from 'node:crypto';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables'
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlockBlobClient, ContainerClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { VERSION_INFO } from '../version.js';
import { makeEncodedDeviceKey } from '../utils/keyFuncs.js';

// To deploy this project from the command line, you need:
//  * Azure CLI : https://learn.microsoft.com/en-us/cli/azure/
//  * Azure Functions Core Tools: https://github.com/Azure/azure-functions-core-tools/blob/v4.x/README.md

// Once you've logged into Azure via 'az login' to an Azure account w/ PubInv permissions,
// you deploy this function project via this command:
//  > func azure functionapp publish gosqasbe

// Docs
// https://learn.microsoft.com/en-us/javascript/api/@azure/functions/httpresponseinit?view=azure-node-latest

/*=================  Setup  =================*/

let accountName; if (isEmpty(accountName = process.env["AZURE_STORAGE_ACCOUNT_NAME"])) {
    throw new Error('Env vars not set')
}
let accountKey; if (isEmpty(accountKey = process.env["AZURE_STORAGE_ACCOUNT_KEY"])) {
    throw new Error('Env vars not set')
} 

const baseUrl = accountName === "devstoreaccount1"
    ? `http://127.0.0.1:10000/devstoreaccount1`
    : `https://${accountName}.blob.core.windows.net`;

const cred = new StorageSharedKeyCredential(accountName, accountKey);
const containerClient = new ContainerClient(`${baseUrl}/gosqas`, cred);


/*==============  Utils Section  ============*/

interface ProvenanceRecord {
    record: any,
    attachments?: readonly string[],
}

interface DecryptedBlob {
    data: Uint8Array;
    contentType: string;
    timestamp: number;
    filename?: string;
}

interface NamedBlob {
    name?: string,
    blob: Blob,
}

function findDeviceIdFromName(blobName: string): string {
    // blobNames look like: 'gosqas/63f4b781c0688d83d40908ff368fefa6a2fa4cd470216fd83b3d7d4c642578c0/prov/1a771caa4b15a45ae97b13d7a336e1e9c9ec1c91c70f1dc8f7749440c0af8114'
    // where the id is that last part (before the last slash)
    return blobName.split("/", 4)[1];
}

function isEmpty(str) {
    return (!str || str.length === 0 );
}

async function sha256(data: BufferSource) {
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(buffer);
}

export function toHex(data: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>): string {
    return Buffer.from(data).toString("hex");
}

export function fromHex(hex: string): Uint8Array {
    return new Uint8Array(Buffer.from(hex, 'hex'));
}

export function decodeKey(key: string): Uint8Array {
    const $key = bs58.decode(key);
    switch ($key.length) {
        case 16:
        case 24:
        case 32:
            return $key
        default:
            throw new Error(`Invalid Key Length ${$key.length}`);
    }
}

export async function calculateDeviceID(key: string | Uint8Array): Promise<string> {
    // if key is a string, convert it to a buffer
    key = typeof key === 'string' ? decodeKey(key) : key;
    const hash = await sha256(key);
    return toHex(hash);
}

function fnv1(input: Uint8Array): bigint {
    const fnvOffset = 14695981039346656037n
    const fnvPrime = 1099511628211n
    let hash = fnvOffset;
    for (let i = 0; i < input.length; i++) {
        hash = BigInt.asUintN(64, hash * fnvPrime)
        hash ^= BigInt(input[i])
    }
    return hash;
}

function calculateLegacyDeviceID(key: string | Uint8Array): bigint {
    // if key is a string, convert it to a buffer
    key = typeof key === 'string' ? decodeKey(key) : key;
    return fnv1(key);
}

export async function encrypt(key: Uint8Array, data: BufferSource, salt?: Uint8Array): Promise<{ salt: Uint8Array; encryptedData: Uint8Array; }> {
    const $key = await crypto.subtle.importKey("raw", key.buffer, "AES-CBC", false, ['encrypt']);
    salt ??= crypto.getRandomValues(new Uint8Array(16));
    const encryptedData = await crypto.subtle.encrypt({ name: "AES-CBC", iv: salt }, $key, data);
    return { salt, encryptedData: new Uint8Array(encryptedData) };
}

export async function decrypt(key: Uint8Array, salt: Uint8Array, encryptedData: Uint8Array): Promise<Uint8Array> {
    const $key = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["decrypt"]);
    const result = await crypto.subtle.decrypt({ name: "AES-CBC", iv: salt }, $key, encryptedData);
    return new Uint8Array(result);
}

export async function upload(client: ContainerClient, deviceKey: Uint8Array, data: BufferSource, type: 'attach' | 'prov', contentType: string, timestamp: number, fileName: string | undefined): Promise<string> {
    const dataHash = toHex(await sha256(data));
    const deviceID = await calculateDeviceID(deviceKey);
    const { salt, encryptedData } = await encrypt(deviceKey, data);
    const blobID = toHex(await sha256(encryptedData));

    let blobName;
    if (type === 'prov') {
        blobName = `prov/${deviceID}/${blobID}`;
    } else if (type === 'attach') {
        blobName = `attach/${blobID}`;
    } else {
        throw new Error(`Invalid type provided: ${type}. Expected 'prov' or 'attach'.`);
    }

    const { encryptedData: encryptedName } = fileName
        ? await encrypt(deviceKey, new TextEncoder().encode(fileName), salt)
        : { encryptedData: undefined };

    await client.uploadBlockBlob(blobName, encryptedData.buffer, encryptedData.length, {
        metadata: {
            gdtcontenttype: contentType,
            gdthash: dataHash,
            gdtsalt: toHex(salt),
            gdttimestamp: `${timestamp}`,
            gdtname: encryptedName ? toHex(encryptedName) : ""
        },
        blobHTTPHeaders: {
            blobContentType: "application/octet-stream"
        }
    });
    return blobID;
}

async function uploadProvenance(containerClient: ContainerClient, deviceKey: Uint8Array, timestamp: number, record: any, attachments: NamedBlob[]): Promise<{ record: string; attachments: NamedBlob[]; }> {

    const attachmentIDs = new Array<string>();
    for (const attach of attachments) {
        if (typeof attach === 'string') continue;
        const data = await attach.blob.arrayBuffer()
        const attachmentID = await upload(containerClient, deviceKey, data, "attach", attach.blob.type, timestamp, attach.name);
        attachmentIDs.push(attachmentID);
    }

    const provRecord = { record, attachments: attachmentIDs };

    const data = new TextEncoder().encode(JSON.stringify(provRecord));
    const recordID = await upload(containerClient, deviceKey, data, "prov", "application/json", timestamp, undefined);
    return { record: recordID, attachments };
}

async function decryptBlob(client: BlockBlobClient, deviceKey: Uint8Array): Promise<DecryptedBlob> {
    const props = await client.getProperties();
    const salt = props.metadata?.["gdtsalt"];
    if (!salt) throw new Error(`Missing Salt ${client.name}`);
    const timestamp = parseInt(props.metadata?.["gdttimestamp"]);
    if (isNaN(timestamp) || !isFinite(timestamp)) throw new Error(`Invalid Timestamp ${client.name}`);

    const buffer = await client.downloadToBuffer();
    const saltBuffer = fromHex(salt);
    const data = await decrypt(deviceKey, saltBuffer, buffer);
    const hash = props.metadata?.["gdthash"];
    if (hash) {
        if (!areEqual(fromHex(hash), await sha256(data))) {
            throw new Error(`Invalid Hash ${client.name}`);
        }
    }

    const contentType = props.metadata?.["gdtcontenttype"];
    const encryptedName = props.metadata?.["gdtname"] ?? "";
    const encodedName = encryptedName.length > 0 ? await decrypt(deviceKey, saltBuffer, fromHex(encryptedName)) : undefined;
    const filename = encodedName ? new TextDecoder().decode(encodedName) : undefined;

    return { data, contentType, timestamp, filename };

    function areEqual(first: Uint8Array, second: Uint8Array) {
        return first.length === second.length
            && first.every((value, index) => value === second[index]);
    }
}

async function pathExists(containerClient: ContainerClient, path: string) {
    const iterResult = await containerClient.listBlobsFlat({ prefix: path }).next();
    if (iterResult.done) {
        return false;
    } else {
        return true;
    }
}

async function convertLegacyProvenance(containerClient: ContainerClient, key: string | Uint8Array) {
    key = typeof key === 'string' ? decodeKey(key) : key;
    const deviceID = await calculateDeviceID(key);
    if (await pathExists(containerClient, `prov/${deviceID}`)) {
        return undefined; // already converted
    }

    const legacyDeviceID = calculateLegacyDeviceID(key);
    const records = new Array<unknown>();
    for await (const blob of containerClient.listBlobsFlat({ prefix: `legacy/prov/${legacyDeviceID}` })) {
        const blobClient = containerClient.getBlockBlobClient(blob.name);
        const { data, timestamp } = await decryptBlob(blobClient, key);
        const json = new TextDecoder().decode(data);
        if (!validateJSON(json)) { return { status: 404 }; }
        const record = JSON.parse(json) as { attachments?: { attachmentID: string }[] };
        const attachmentIDs = record.attachments?.slice() ?? [];
        delete record.attachments;
        if ('name' in record) {
            const name = record['name'];
            record["deviceName"] = name;
        }

        const attachments = new Array<NamedBlob>();
        for (const attachment of attachmentIDs) {
            const attachmentClient = containerClient.getBlockBlobClient(`legacy/attach/${attachment.attachmentID}`);
            const { data, contentType, filename } = await decryptBlob(attachmentClient, key);
            attachments.push({
                blob: new Blob([data], { type: contentType }),
                name: filename
            });
        }

        const uploaded = await uploadProvenance(containerClient, key, timestamp, record, attachments);
        records.push(uploaded);
    }
    return records;
}

export async function getDecryptedBlob(request: HttpRequest, context: InvocationContext): Promise<DecryptedBlob | undefined> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const deviceID = await calculateDeviceID(deviceKey);
    const attachmentID = request.params.attachmentID;
    context.log(`getDecryptedBlob`, { accountName, deviceKey: request.params.deviceKey, deviceID, attachmentID });

    const containerExists = await containerClient.exists();
    if (!containerExists) { return undefined; }

    const blobClient = containerClient.getBlockBlobClient(`attach/${attachmentID}`);
    const exists = await blobClient.exists();
    if (!exists) { return undefined; }

    return await decryptBlob(blobClient, deviceKey);
}


/*=================  Endpoints  =====================*/

/* ----- API Endpoints Section 1/2: Functions ----- */

export async function getProvenance(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const deviceID = await calculateDeviceID(deviceKey);
    context.log(`getProvenance`, { accountName, deviceKey: request.params.deviceKey, deviceID });

    const containerExists = await containerClient.exists();
    if (!containerExists) { return { jsonBody: [] }; }

    const provExists = await pathExists(containerClient, `prov/${deviceID}`);
    if (!provExists) {
        await convertLegacyProvenance(containerClient, deviceKey);
    }

    const records = new Array<ProvenanceRecord & { deviceID: string, timestamp: number }>();
    for await (const blob of containerClient.listBlobsFlat({ prefix: `prov/${deviceID}` })) {
        const blobClient = containerClient.getBlockBlobClient(blob.name);
        const { data, timestamp } = await decryptBlob(blobClient, deviceKey);
        const json = new TextDecoder().decode(data);
        if (!validateJSON(json)) { return { status: 404 }; }
        const provRecord = JSON.parse(json) as ProvenanceRecord;
        records.push({ ...provRecord, deviceID, timestamp });
    }
    records.sort((a, b) => b.timestamp - a.timestamp)
    return { jsonBody: records };
}

export async function postProvenance(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const deviceID = await calculateDeviceID(deviceKey);
    context.log(`postProvenance`, { accountName, deviceKey: request.params.deviceKey, deviceID });

    await containerClient.createIfNotExists();

    const formData = await request.formData();
    const provenanceRecord = formData.get("provenanceRecord");
    if (typeof provenanceRecord !== 'string') { return { status: 404 }; }
    const record = JSON5.parse(provenanceRecord);
    if (!validateJSON(record)) { return { status: 404 }; }

    // https://stackoverflow.com/questions/9756120/how-do-i-get-a-utc-timestamp-in-javascript#comment73511758_9756120
    const timestamp = new Date().getTime();
    const attachments = new Array<NamedBlob>();
    for (const attach of formData.values()) {
        if (typeof attach === 'string') continue;
        console.log("attach type: " + typeof(attach))
        attachments.push({ blob: attach, name: attach.name });
    }

    const body = await uploadProvenance(containerClient, deviceKey, timestamp, record, attachments);
    return { jsonBody: body ?? { converted: true}};
}

async function upgradeProvenance(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const body = await convertLegacyProvenance(containerClient, deviceKey);
    return { jsonBody: body ?? { "already-converted": true} };
}

export async function getAttachment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const decryptedBlob = await getDecryptedBlob(request, context);
    if (!decryptedBlob) { return { status: 404 } }

    const { data, contentType, filename } = decryptedBlob;
    const headers = new Headers();
    headers.append("Access-Control-Allow-Headers", "Attachment-Name");
    if (contentType) { headers.append("Content-Type", contentType); }
    if (filename) {
        headers.append("Content-Disposition", `attachment; filename="${filename}"`);
        headers.append("Attachment-Name", filename);
    }

    return { body: data, headers };
};

export async function getAttachmentName(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const decryptedBlob = await getDecryptedBlob(request, context);
    if (!decryptedBlob) { return { status: 404 } }

    const { filename } = decryptedBlob;
    return { body: filename };
};

export async function getStatistics(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const containerExists = await containerClient.exists();
    if (!containerExists) { return { jsonBody: [] }; }

    // Build up a JSON return value
    // NOTE: We seem to have to read the properties of the blob to get the
    // metadata.  There is a field called "metadata" on the blob itself
    // which does not contain our metadata. I don't know if this is terribly
    // expensive, or if we could improve it. I insist we should not worry about
    // performance until we measure it to be a problem, but this is an "orang flag"--
    // some caution around this issue is warranted.
    var records = [];
    for await (const blob of containerClient.listBlobsFlat()) {
        const blobClient = containerClient.getBlockBlobClient(blob.name);
        const props = await blobClient.getProperties();
        const metadata = props.metadata;
        // now we want to build up an object that we can return as statistics
        // that inlcudes the id and the timestamp, though really the timestamp
        // is enough. We would like to distinguish the additon of a device
        // from the addition of new provenance, I supoose.
        const id = findDeviceIdFromName(blob.name);
        // We could do some sorting in this function, but that is more or less
        // easily done by whomever is using this. So I think it better to just
        // return the data in  a fairly raw form, as an array of {timestamp, id} tuples.
        // Eventually, this function may have to only look back X days or X hours,
        // but until it gets unwieldy we can return everything.
        // I think the proper way to test this is to build a test program that
        // puts 1000s of objects into the database and see where performance becomes a problem.
        records.push({ timestamp: metadata.gdttimestamp, deviceID: id });
    }

    const contentType = "application/json";

    return {
        jsonBody: records,
        headers: { "Content-Type": contentType }
    };
};

export async function postEmail(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const tableUrl = accountName === "devstoreaccount1"
            ? `http://127.0.0.1:10002/devstoreaccount1`
            : `https://${accountName}.table.core.windows.net`;

        let table = 'UserFeedbackEmails'
        const credential = new AzureNamedKeyCredential(accountName, accountKey);
        const tableClient = new TableClient(tableUrl, table, credential, { allowInsecureConnection: true })
        await tableClient.createTable();  // Create if not exist, no error if it does

        const formData = await request.formData();
        let email; if (typeof (email = formData.get('email')) !== 'string') {
            throw new Error('postEmail: Unexpected non-string value received')
            return { status: 404 };
        }

        const entity = {
            partitionKey: 'UserFeedbackVolunteers',
            rowKey: email,
        }

        const response = await tableClient.createEntity(entity);
        console.log(response)

        console.log('postEmail: Added feedback volunteer contact info')
        return {
            status: 200,
            body: "Created",
            headers: { "Content-Type": "text/plain" }
        }
    } catch(error) {
        console.error('postEmail: Failed to add feedback volunteer contact info', error.message)
        // Deliberate lack of error message to client
    }
}

export async function getVersion(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    // This is a simple function that returns the version of the server.
    return { 
        jsonBody: VERSION_INFO,
        headers: { "Content-Type": "application/json" }
    };
}

export async function getNewDeviceKey(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try{
        const key = await makeEncodedDeviceKey();
        return {
            status: 200, 
            body: key,  //makeEncodedDeviceKey(),
            headers: { "Content-Type": "text/plain" }
        }
    } catch(error) {
        console.error('getNewDeviceKey: Failed to create a new key', error.message)
        return {
            status: 500,
            body: "",
            headers: { "Content-Type": "text/plain" }
        }
    }
}

export async function validateJSON(json: any) {
    // NOTE: Create Record only has blobType, description, childrenkeys, and tags
    const Valid = z.object({
        blobType: z.string().optional(),
        children_key: z.union([z.string(), z.array(z.string())]),
        children_name: z.array(z.string()).optional(),
        description: z.string(),
        deviceName: z.string().optional(),
        hasParent: z.boolean().optional(),
        isReportingKey: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
    });

    try {
        Valid.parse(json);
        return true;
    } catch (e) {
        console.log("Format of JSON provided was invalid.")
        return false;
    }
}

export function deduplicateKeys(keys: string[]): string[] {
    return Array.from(new Set(keys))
}

// Annotate: Send new record's tags to all children
export async function notifyChildren(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const baseUrl = process.env['backend_url'];

    try {
        const deviceKey = request.params.deviceKey;
        let getRecords = await fetch(`${baseUrl}/${deviceKey}`)
        const records = await getRecords.json()

        if (records[0].record.tags.includes("annotate")) {
            let length = Object.keys(records).length;
            let keysToCheck = Array.from(new Set(records[length - 1].record.children_key));

            // Send annotated record to all children
            while (keysToCheck.length != 0) {
                let key = keysToCheck[0];
                let getKey = await fetch(`${baseUrl}/${key}`);
                const keyProvenance = await getKey.json();

                // Make sure key is NOT a reporting key (reporting keys do not have the ability to recall)
                if (!keyProvenance[0].record.isReportingKey) {
                    let uniqueChildKeys = deduplicateKeys(keyProvenance[0].record.children_key);

                    if (uniqueChildKeys.includes(deviceKey.toString())) {
                        uniqueChildKeys.splice(uniqueChildKeys.indexOf(deviceKey.toString()), 1);
                    }

                    keysToCheck = keysToCheck.concat(uniqueChildKeys);

                    const keyFormData = new FormData();
                    keyFormData.append("provenanceRecord", JSON.stringify({
                        blobType: 'deviceRecord',
                        description: "Annotated by admin",
                        children_key: '',
                        tags: records[0].record.tags,
                    }));
                    
                    let response = await fetch(`${baseUrl}/${key}`, {
                        method: "POST",
                        body: keyFormData,
                    })
                }

                keysToCheck.shift();
            }
        }

        return {
            status: 200
        }
    } catch (error) {
        console.error(`Error annotating children: ${error}`);
        return {
            status: 500
        }
    }
 }
 
 // Recall: Pin and send new record entry to all children
 export async function recallChildren(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const baseUrl = process.env['backend_url'];

    try {
        const deviceKey = request.params.deviceKey;
        let getRecords = await fetch(`${baseUrl}/${deviceKey}`)
        const records = await getRecords.json()

        if (records[0].record.tags.includes("recall")) {
            let length = Object.keys(records).length;
            let keysToCheck = Array.from(new Set(records[length - 1].record.children_key));

            // Send recalled record to all children
            while (keysToCheck.length != 0) {
                let key = keysToCheck[0];
                let getKey = await fetch(`${baseUrl}/${key}`);
                const keyProvenance = await getKey.json();

                // Make sure key is NOT a reporting key (reporting keys do not have the ability to recall)
                if (!keyProvenance[0].record.isReportingKey) {
                    let uniqueChildKeys = deduplicateKeys(keyProvenance[0].record.children_key);

                    if (uniqueChildKeys.includes(deviceKey.toString())) {
                        uniqueChildKeys.splice(uniqueChildKeys.indexOf(deviceKey.toString()), 1);
                    }

                    keysToCheck = keysToCheck.concat(uniqueChildKeys);

                    const keyFormData = new FormData();
                    keyFormData.append("provenanceRecord", JSON.stringify({
                        blobType: 'deviceRecord',
                        description: records[0].record.description,
                        children_key: '',
                        tags: records[0].record.tags,
                    }));
                    
                    let response = await fetch(`${baseUrl}/${key}`, {
                        method: "POST",
                        body: keyFormData,
                    })
                }

                keysToCheck.shift();
            }
        }

        return {
            status: 200
        }
    } catch (error) {
        console.error(`Error notifying children: ${error}`);
        return {
            status: 500
        }
    }
 }

export async function postNotificationEmail(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try{
        const body = await request.json() as any;
        const email = body.email;
        const recordKey = body.recordKey;
        const tags = body.tags;

        if (!email || !recordKey){
            return {
                jsonBody: {error: "Error: email and record key required"},
                status: 400
            }
        }

        console.log("Received signup for " + email)
        return {
            jsonBody: {message: "Success"},
            status: 200
        } 
        
    }catch(error){
        console.error(error.message);
        return {
            jsonBody: {message: "Internal Server Error"},
            status: 500,

        }

    }
}

async function signupForNotifications(deviceKey: string, email: string, tags: string[] = []) {
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
    const datum = {
        'key': {
            'email': email,
            'tags': tags
        }
    }    
    const data = JSON.stringify(datum)

    // 2 Setup blob name & id
    const type = 'notificationSignups'
    const blobName = `${type}/${deviceID}/`

    try {
        // Note: do not reformat; leave as commented
        let status = (await containerClient.uploadBlockBlob(
                        blobName,   // 1. Blob name
                        data,       // 2. body (can be a string)
                        data.length // 3. length of body in bytes
                        // 4. optional options
                        // nothing for now
                        // TODO: we need to set BlockBlobUploadOptions to set usage tier
        )).response._response.status

        if (status < 300 || status >= 100) {
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
        return {
            jsonBody: {message: error.message},
            status: status,
        }
    }
}

async function retrieveNotifEmails(key: string) {
    // https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-download-javascript?tabs=javascript
    const deviceID = await calculateDeviceID(key);
    const type = 'notificationSignups'
    const blobName = `${type}/${deviceID}/`

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
            status: status,
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

async function emailSignupTestEndpoint(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    /* How this pseudo-smoketest works:
       1. Put a string into blobstore
       2. Get it back out
       3. Hand both responses back
     */

    try {
        const key = await makeEncodedDeviceKey()

        // Add it
        const putResponse = await signupForNotifications(key, "email@email.foo")

        // Access it
        const getResponse = await retrieveNotifEmails(key)

        return {
            jsonBody: {message: `${JSON.stringify(putResponse)},${JSON.stringify(getResponse)}`},
            status: 200,
        }

    } catch(error) {

        console.log(error)
        
        return {
            jsonBody: {message: error.message},
            status: 500,
        }
    }
}


export type NotificationSignUp = {

    noTagsMeansAllUpdates: string[];
    [tags: string]: string[];

}

export function validateNotification(data: any) {

    try {
        const validationCheck: NotificationSignUp = data;
        return true;
    } catch(error) {
        return false
    }

}

async function notificationSignUpTags(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {

    let data;
    try{
        data = await request.json();
    }
    catch (error){
        return {
            status: 400,
            body: 'Invalid JSON format'
        }
    }

    if (!validateNotification(data)){
        return {
            status: 400,
            body: 'Invalid email list'
        }
    }

    return{
        status: 200,
        body: 'Signup data received and validated'
    }
}



interface GroupCreationOrder {
    title: string;
    description: string;
    /*
    tags?: [string];
    number_of_children?: strin;
    custom_record_titles?: ;
    create_reporting_key?: ;
    annotate?: ;
    */
}


/*
    it("should create a group record with zero children", async () => {
        const baseUrl = "https://gosqasbe.azurewebsites.net/api";
        // Generate device key
        const groupKeyRes = await fetch(`${baseUrl}/getNewDeviceKey`);
        const groupKey = await groupKeyRes.text();
        // Create group record
        const groupFormData = new FormData();
        groupFormData.append("provenanceRecord", JSON.stringify({
            blobType: "deviceInitializer",
            deviceName: "group_zero_children_smoketest",
            description: "group with zero children for smoketest",
            tags: [],
            children_key: [],
            hasParent: false,
            isReportingKey: false
        }));
        const groupResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
            method: "POST",
            body: groupFormData,
        });
        expect(groupResponse.ok).toBe(true);

        // Verify group record
        const verificationResponse = await fetch(`${baseUrl}/provenance/${groupKey}`);
        const verificationData = await verificationResponse.json();
*/
export async function createGroup(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try{

        context.log('--------------------')
        const apiUrl = 'http://localhost:7071/api'
        const frontendUrl = 'http://localhost:3000'

        let theGroupCreationOrder: Record<string, any> = await request.json()
        context.log(theGroupCreationOrder)


        const groupKey = await makeEncodedDeviceKey()
        const groupFormData = new FormData();

        /*
        A group is a record with a 
                    children_key: childrenDeviceList,
                    children_name: childrenDeviceName,
        */

        
        groupFormData.append("provenanceRecord", JSON.stringify({
            blobType: "deviceInitializer",
            ...theGroupCreationOrder,
            children_key: [], // Note: this is what turns a record into a group
            tags: [],            
            hasParent: false,
            isReportingKey: false
        }));

        context.log(groupFormData)
        

        const createInitUrl = `${apiUrl}/provenance/${groupKey}`
        const groupResponse = await fetch(createInitUrl, {
            method: "POST",
            body: groupFormData,
        });

        /**/

        context.log(groupResponse)

        context.log('--------------------')

        return {
            status: 200,
            jsonBody: {url: `${frontendUrl}/record/${groupKey}`},
            headers: { "Content-Type": "text/plain" }
        }
    } catch(error) {
        console.error('Failed to create group', error.message)
        return {
            status: 500,
            jsonBody: {},
            headers: { "Content-Type": "text/plain" }
        }
    }
}



/* ----- API Endpoints Section 2/2: Route Definitions ----- */


//
app.post("createGroup", {
    authLevel: 'anonymous',
    route: 'createGroup',
    handler: createGroup,
})
//

app.post("notificationSignUpTags", {
    authLevel: 'anonymous',
    route: 'notificationSignUpTags',
    handler: notificationSignUpTags
})

app.get("emailSignupTestEndpoint", {
    authLevel: 'anonymous',
    route: 'emailSignupTestEndpoint',
    handler: emailSignupTestEndpoint
})

app.post("postNotificationEmail", {
    authLevel: 'anonymous',
    route: 'notificationSubscription',
    handler: postNotificationEmail
})

app.get("getProvenance", {
    authLevel: 'anonymous',
    route: 'provenance/{deviceKey}',
    handler: getProvenance,
})

app.post("postProvenance", {
    authLevel: 'anonymous',
    route: 'provenance/{deviceKey}',
    handler: postProvenance
})

app.get("upgradeProvenance", {
    authLevel: 'anonymous',
    route: 'upgrade/{deviceKey}',
    handler: upgradeProvenance
})

app.get("getAttachment", {
    authLevel: 'anonymous',
    route: 'attachment/{deviceKey}/{attachmentID}',
    handler: getAttachment,
})

app.get("getAttachmentName", {
    authLevel: 'anonymous',
    route: 'attachment/{deviceKey}/{attachmentID}/name',
    handler: getAttachmentName,
})

app.get("getStatistics", {
    authLevel: 'anonymous',
    route: 'statistics',
    handler: getStatistics
})

app.post('postEmail', {
    authLevel: 'anonymous',
    route: 'feedbackVolunteer',
    handler: postEmail,
})

app.get("getVersion", {
    authLevel: 'anonymous',
    route: 'version',
    handler: getVersion
})

app.get('getNewDeviceKey', {
    authLevel: 'anonymous',
    route: 'getNewDeviceKey',
    handler: getNewDeviceKey,
})

app.post('annotateChildren', {
    authLevel: 'anonymous',
    route: 'provenance/annotate/{deviceKey}',
    handler: notifyChildren,
})

app.post('recallChildren', {
    authLevel: 'anonymous',
    route: 'provenance/recall/{deviceKey}',
    handler: recallChildren,
})



// Experimental
/* Notes. httpTrigger.ts line 315
    // https://stackoverflow.com/questions/9756120/how-do-i-get-a-utc-timestamp-in-javascript#comment73511758_9756120
    const timestamp = new Date().getTime();
    const attachments = new Array<NamedBlob>();
    for (const attach of formData.values()) {
        if (typeof attach === 'string') continue;
        console.log("attach type: " + typeof(attach))
        attachments.push({ blob: attach, name: attach.name });
    }

    const body = await uploadProvenance(containerClient, deviceKey, timestamp, record, attachments);
*/
/* Notes. httpTrigger.ts line 50

interface NamedBlob {
    name?: string,
    blob: Blob,
}
*/
/*
Notes. httpTrigger.ts line 160

async function uploadProvenance(containerClient: ContainerClient, deviceKey: Uint8Array, timestamp: number, record: any, attachments: NamedBlob[]): Promise<{ record: string; attachments: NamedBlob[]; }> {

    const attachmentIDs = new Array<string>();
    for (const attach of attachments) {
        if (typeof attach === 'string') continue;
        const data = await attach.blob.arrayBuffer()
        const attachmentID = await upload(containerClient, deviceKey, data, "attach", attach.blob.type, timestamp, attach.name);
        attachmentIDs.push(attachmentID);
    }

    const provRecord = { record, attachments: attachmentIDs };

    const data = new TextEncoder().encode(JSON.stringify(provRecord));
    const recordID = await upload(containerClient, deviceKey, data, "prov", "application/json", timestamp, undefined);
    return { record: recordID, attachments };
}
*/
/* Notes. httpTrigger.ts line 127
export async function upload(client: ContainerClient, deviceKey: Uint8Array, data: BufferSource, type: 'attach' | 'prov', contentType: string, timestamp: number, fileName: string | undefined): Promise<string> {
    const dataHash = toHex(await sha256(data));
    const deviceID = await calculateDeviceID(deviceKey);
    const { salt, encryptedData } = await encrypt(deviceKey, data);
    const blobID = toHex(await sha256(encryptedData));

    let blobName;
    if (type === 'prov') {
        blobName = `prov/${deviceID}/${blobID}`;
    } else if (type === 'attach') {
        blobName = `attach/${blobID}`;
    } else {
        throw new Error(`Invalid type provided: ${type}. Expected 'prov' or 'attach'.`);
    }

    const { encryptedData: encryptedName } = fileName
        ? await encrypt(deviceKey, new TextEncoder().encode(fileName), salt)
        : { encryptedData: undefined };

    await client.uploadBlockBlob(blobName, encryptedData.buffer, encryptedData.length, {
        metadata: {
            gdtcontenttype: contentType,
            gdthash: dataHash,
            gdtsalt: toHex(salt),
            gdttimestamp: `${timestamp}`,
            gdtname: encryptedName ? toHex(encryptedName) : ""
        },
        blobHTTPHeaders: {
            blobContentType: "application/octet-stream"
        }
    });
    return blobID;
}
*/
/* Notes on upbloadblockblob

From: https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/containerclient?view=azure-node-latest#@azure-storage-blob-containerclient-uploadblockblob

The function signature:
function uploadBlockBlob(blobName: string, body: RequestBodyType, contentLength: number, options?: BlockBlobUploadOptions): Promise<{ blockBlobClient: BlockBlobClient, response: BlockBlobUploadResponse }>

*/
/* Notes. Thanks, @milena!

        	const buffer = await readFile('./test/attachments/a200.jpg')
        	const blob = new Blob([buffer], { type: 'image/jpeg' })
        	groupFormData.append('attachment', blob) 
*/ 


