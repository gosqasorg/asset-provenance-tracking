
type BufferSource = any;
namespace NodeJS { export type BufferSource = any; }
// delete the top two lines, temporary for testing

import bs58 from 'bs58';
import JSON5 from 'json5';
import * as z from "zod";
import { webcrypto as crypto } from 'node:crypto';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables'
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlockBlobClient, ContainerClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { VERSION_INFO } from '../version.js';
import { makeEncodedDeviceKey } from '../utils/keyFuncs.js';
import { notifySubscribers, retrieveNotifEmails, updateNotifications } from './emailNotificationUtils.js';
import { ClientSecretCredential } from "@azure/identity";

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

const MAX_ATTACHMENTS_LIMIT = 1000;

/*==============  Utils Section  ============*/

interface ProvenanceRecord {
    record: any,
    attachments?: readonly string[],
}

interface DecryptedBlob {
    data: Uint8Array<ArrayBuffer>;
    contentType: string;
    timestamp: number;
    filename?: string;
}

interface NamedBlob {
    name?: string,
    blob: Blob,
}

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB

function findDeviceIdFromName(blobName: string): string {
    // blobNames look like: 'gosqas/63f4b781c0688d83d40908ff368fefa6a2fa4cd470216fd83b3d7d4c642578c0/prov/1a771caa4b15a45ae97b13d7a336e1e9c9ec1c91c70f1dc8f7749440c0af8114'
    // where the id is that last part (before the last slash)
    return blobName.split("/", 4)[1];
}

function isEmpty(str) {
    return (!str || str.length === 0 );
}

async function sha256(data: NodeJS.BufferSource) {
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(buffer);
}

export function toHex(data: Uint8Array<ArrayBuffer>): string {
    return Buffer.from(data).toString("hex");
}

export function fromHex(hex: string): Uint8Array {
    return new Uint8Array(Buffer.from(hex, 'hex'));
}

export function decodeKey(key: string): Uint8Array<ArrayBuffer> {
    const theKey = bs58.decode(key);

    switch (theKey.length) {
        case 16:
        case 24:
        case 32:
            return theKey as Uint8Array<ArrayBuffer>
        default:
            throw new Error(`Invalid Key Length ${theKey.length}`);
    }
}

export async function calculateDeviceID(key: string | Uint8Array<ArrayBuffer>): Promise<string> {
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

export async function encrypt(key: Uint8Array<ArrayBuffer>, data: NodeJS.BufferSource, salt?: Uint8Array<ArrayBuffer>): Promise<{ salt: Uint8Array; encryptedData: Uint8Array; }> {
    const $key = await crypto.subtle.importKey("raw", key.buffer, "AES-CBC", false, ['encrypt']);
    salt ??= crypto.getRandomValues(new Uint8Array(16));
    const encryptedData = await crypto.subtle.encrypt({ name: "AES-CBC", iv: salt }, $key, data);
    return { salt, encryptedData: new Uint8Array(encryptedData) };
}

export async function decrypt(key: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>, encryptedData: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
    const $key = await crypto.subtle.importKey("raw", key.buffer, "AES-CBC", false, ["decrypt"]);
    const result = await crypto.subtle.decrypt({ name: "AES-CBC", iv: salt }, $key, encryptedData);
    return new Uint8Array(result);
}

export async function upload(client: ContainerClient, deviceKey: Uint8Array, data: NodeJS.BufferSource, type: 'attach' | 'prov', contentType: string, timestamp: number, fileName: string | undefined): Promise<string> {
    const dataHash = toHex(await sha256(data));
    const deviceID = await calculateDeviceID(deviceKey as Uint8Array<ArrayBuffer>);
    const { salt, encryptedData } = await encrypt(deviceKey as Uint8Array<ArrayBuffer>, data);
    const blobID = toHex(await sha256(encryptedData as NodeJS.BufferSource));

    let blobName;
    if (type === 'prov') {
        blobName = `prov/${deviceID}/${blobID}`;
    } else if (type === 'attach') {
        blobName = `attach/${blobID}`;
    } else {
        throw new Error(`Invalid type provided: ${type}. Expected 'prov' or 'attach'.`);
    }

    const { encryptedData: encryptedName } = fileName
        ? await encrypt(deviceKey as Uint8Array<ArrayBuffer>, new TextEncoder().encode(fileName), salt as Uint8Array<ArrayBuffer>)
        : { encryptedData: undefined };

    await client.uploadBlockBlob(blobName, encryptedData.buffer as NodeJS.BufferSource, encryptedData.length, {
        metadata: {
            gdtcontenttype: contentType,
            gdthash: dataHash,
            gdtsalt: toHex(salt as Uint8Array<ArrayBuffer>),
            gdttimestamp: `${timestamp}`,
            gdtname: encryptedName ? toHex(encryptedName as Uint8Array<ArrayBuffer>) : ""
        },
        blobHTTPHeaders: {
            blobContentType: "application/octet-stream"
        }
    });
    return blobID;
}

async function uploadProvenance(containerClient: ContainerClient, deviceKey: Uint8Array, timestamp: number, record: any, attachments: NamedBlob[]): Promise<{ record: string; attachments: NamedBlob[]; oversizedAttachments: string[] | undefined}> {

    const attachmentIDs = new Array<string>();
    const oversizedAttachments = new Array<string>();
    for (const attach of attachments) {
        if (typeof attach === 'string') continue;
        // Count attachment bytes in chunks until MAX_ATTACHMENT_SIZE is reached
        let byteCount = 0;
        const reader = attach.blob.stream().getReader(); // Get a reader for the blob stream
        try{
            while (true) {
                const { done, value } = await reader.read();
                if (done) break; // Exit loop when reading is complete
                byteCount += value.length; // Increment byte count
                if (byteCount > MAX_ATTACHMENT_SIZE) {
                    const fileName = attach.name ?? "Unknown";
                    oversizedAttachments.push(fileName);
                    // Log the oversized attachment
                    console.log(`Attachment "${fileName}" exceeds maximum allowed size of ${MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB`);
                    //Stop reading further
                    try {
                        await reader.cancel();
                    } catch (ignoreError) {
                        // Ignore cancel errors
                    }
                    break;
                }

            }
            reader.releaseLock(); // Release the lock on the reader after reading is successful + completed
        } catch (error) {
            try{
                reader.releaseLock(); // Release the lock on the reader
            } catch (e) {
                // Do nothing since the lock is already released
            }
            if (error.statusCode === 400) {
                byteCount = 0;
                attach.blob = null as any; // Set the blob to null to help garbage collection
                const fileName = attach.name ?? "Unknown";
                oversizedAttachments.push(fileName);
                console.log(`Attachment "${fileName}" exceeds maximum allowed size of ${MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB`);
            }
            throw error; // Throw other errors
        }
    }

    // If ANY attachment is oversized, return early without uploading anything
    if (oversizedAttachments.length > 0) {
        return {record: '',attachments: [],oversizedAttachments: oversizedAttachments};
    }
    for (const attach of attachments) {    // Upload all attachments if they pass the size check
        if (typeof attach === 'string') continue;
        const data = await attach.blob.arrayBuffer()
        const attachmentID = await upload(containerClient, deviceKey, data, "attach", attach.blob.type, timestamp, attach.name);
        attachmentIDs.push(attachmentID);
    }

    const provRecord = { record, attachments: attachmentIDs };

    const data = new TextEncoder().encode(JSON.stringify(provRecord));
    const recordID = await upload(containerClient, deviceKey, data, "prov", "application/json", timestamp, undefined);
    return { record: recordID, attachments, oversizedAttachments: undefined};
}

async function decryptBlob(client: BlockBlobClient, deviceKey: Uint8Array<ArrayBuffer>): Promise<DecryptedBlob> {
    const props = await client.getProperties();
    const salt = props.metadata?.["gdtsalt"];
    if (!salt) throw new Error(`Missing Salt ${client.name}`);
    const timestamp = parseInt(props.metadata?.["gdttimestamp"]);
    if (isNaN(timestamp) || !isFinite(timestamp)) throw new Error(`Invalid Timestamp ${client.name}`);

    const buffer = await client.downloadToBuffer();
    const saltBuffer = fromHex(salt);
    const data = await decrypt(deviceKey, saltBuffer as Uint8Array<ArrayBuffer>, buffer as Uint8Array<ArrayBuffer>);
    const hash = props.metadata?.["gdthash"];
    if (hash) {
        if (!areEqual(fromHex(hash), await sha256(data))) {
            throw new Error(`Invalid Hash ${client.name}`);
        }
    }

    const contentType = props.metadata?.["gdtcontenttype"];
    const encryptedName = props.metadata?.["gdtname"] ?? "";
    const encodedName = encryptedName.length > 0 ? await decrypt(deviceKey, saltBuffer as Uint8Array<ArrayBuffer>, fromHex(encryptedName) as Uint8Array<ArrayBuffer>) : undefined;
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

async function convertLegacyProvenance(containerClient: ContainerClient, key: Uint8Array<ArrayBuffer>) {
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

export function postProvenanceMiddleware(body: FormData): Boolean {

    // This may seem simple but it is expected to grow
    const sizeLimit: number = 2*10**9  // 2 gigabytes, this may change

    return JSON.stringify(body).length <= sizeLimit
}

async function countExistingAttachments(containerClient: ContainerClient, deviceID: string, deviceKey: Uint8Array<ArrayBuffer>, limit: number = MAX_ATTACHMENTS_LIMIT): Promise<number> {

    let count = 0;

    for await (const blob of containerClient.listBlobsFlat({ prefix: `prov/${deviceID}` })) {
        const blobClient = containerClient.getBlockBlobClient(blob.name);
        
        try {
            const { data } = await decryptBlob(blobClient, deviceKey);
            const json = new TextDecoder().decode(data);
            const prov = JSON.parse(json) as { attachments?: string[] };
            
            if (Array.isArray(prov.attachments)) {
                count += prov.attachments.length;
                if (count >= limit) {
                    return count; 
                }
            }
        } catch {
            continue;
        }
    }
    return count;
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
        // if (!(await validateJSON(json))) { return { status: 400 }; }
        // validateJSON is broken
        const parsed_json = JSON.parse(json);
        const provRecord = parsed_json as ProvenanceRecord;
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

    if (!postProvenanceMiddleware(formData)) {return {status: 304 }; }   
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

    if (attachments.length > 0) {
        const existingCount = await countExistingAttachments(containerClient, deviceID, deviceKey, MAX_ATTACHMENTS_LIMIT);

        if (existingCount + attachments.length > MAX_ATTACHMENTS_LIMIT) {
            return { status: 304 };
        }
    }

    const body = await uploadProvenance(containerClient, deviceKey, timestamp, record, attachments);
    if (body.oversizedAttachments) {
        return {
            status: 400,
            jsonBody: {
                error: `The following file(s) exceed the maximum allowed size of ${MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB: ${body.oversizedAttachments.join(', ')}`,
                oversizedAttachments: body.oversizedAttachments,
                attachments: body.attachments
            }
        }
    }

    try {
        await notifySubscribers(containerClient, calculateDeviceID, request.params.deviceKey, formData, context);
    } catch(error) {
        return {
            status: error.statusCode,
            jsonBody: {
                error: 'Failed to send email'
            }
        }
    }
  
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
    // TODO: need to create below env variables for this code to work, in testing it runs
    const directory_id = process.env['AZURE_TENANT_ID'];
    const app_registration_id = process.env['AZURE_CLIENT_ID'];
    const secret_value = process.env['AZURE_CLIENT_SECRET'];
    const workspace_id = process.env['AZURE_WORKSPACE_ID'];
    let client_id = app_registration_id
    let client_secret = secret_value

    const credential = new ClientSecretCredential(directory_id, client_id, client_secret);
    const tokenResponse = await credential.getToken("https://api.loganalytics.io/.default");
    let token = tokenResponse.token;

    const timesToCheck = ['ago(1h)', 'ago(24h)', 'ago(7d)']
    let valsAtTimes = [0, 0, 0]

    // Get time-based record entry counts
    for (let v in timesToCheck) {
        let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: `{"query": "AppRequests | where Name == 'postProvenance' | where TimeGenerated > ${timesToCheck[v]} | where ResultCode == 200 | count"}`,
        });
        valsAtTimes[v] = (await logs.json()).tables[0].rows[0][0];
    }
    let records1h = valsAtTimes[0]
    let records24h = valsAtTimes[1]
    let records7d = valsAtTimes[2]

    // Get time-based unique record counts
    for (let v in timesToCheck) {
        let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: `{"query": "AppRequests | where Name == 'postProvenance' | where TimeGenerated > ${timesToCheck[v]} | where ResultCode == 200 | distinct Url | count"}`,
        });
        valsAtTimes[v] = (await logs.json()).tables[0].rows[0][0];
    }
    let devices1h = valsAtTimes[0]
    let devices24h = valsAtTimes[1]
    let devices7d = valsAtTimes[2]

    const d = new Date()
    let today = d.getDay()  // returns 0-6 (0 is Sunday, 6 is Saturday)
    let minutes = d.getMinutes() / 60
    let hours = d.getHours() + minutes
    let counted = 0
    let recordsPerDayY = [0, 0, 0, 0, 0, 0, 0]

    // Get record entries per day (last 7 days) for the graph
    for (let i = 0; i <= today; i++) {
        let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            // Gets number of records created 'hours' ago ('hours' == time today in hours + i * 24h)
            body: `{"query": "AppRequests | where Name == 'postProvenance' | where TimeGenerated > ago(${hours}h) | where ResultCode == 200 | count"}`,
        });
        let recent = (await logs.json()).tables[0].rows[0][0];
        
        // Add the records we found to the current day, subtracting records we already counted
        recordsPerDayY[today - i] = recent - counted
        counted = recent
        hours += 24
    }

    // Get record entries per hour (last 7 days, time in UTC) for the graph
    let recordsPerHourY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (let hour = 0; hour < 24; hour++) {
        let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            // Gets number of records created in the last 7 days at 'hour'
            body: `{"query": "AppRequests | where Name == 'postProvenance' | where TimeGenerated > ago(7d) | where datetime_part('hour', TimeGenerated) == ${hour} | where ResultCode == 200 | count"}`,
        });
        let hourly = (await logs.json()).tables[0].rows[0][0];
        recordsPerHourY[hour] = hourly
    }

    // Get number of calls to postProvenance that failed in the last 3 months
    let logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: `{"query": "AppRequests | where Name == 'postProvenance' | where ResultCode != 200 | count"}`,
    });
    let totalFailures = (await logs.json()).tables[0].rows[0][0];

    // Get number of calls to postProvenance that succeeded in the last 3 months
    logs = await fetch(`https://api.loganalytics.io/v1/workspaces/${workspace_id}/query`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: `{"query": "AppRequests | where Name == 'postProvenance' | where ResultCode == 200 | count"}`,
    });
    let totalSuccesses = (await logs.json()).tables[0].rows[0][0];

    // Get total statistics counts (updates once per day)
    let [totalRecords, totalAttachments, totalDevices] = [0, 0, 0]

    await containerClient.createIfNotExists();
    const blobName = `statistics/totals`
    const blobClient = containerClient.getBlockBlobClient(blobName);
    const exists = await blobClient.exists();

    if (exists) {
        const buffer = await blobClient.downloadToBuffer();
        const text = buffer.toString("utf8");

        if (text) {
            const parsed = JSON.parse(text) as any;
            totalRecords = parsed?.totalRecords || 0
            totalAttachments = parsed?.totalAttachments || 0
            totalDevices = parsed?.totalDevices || 0
        }
    }

    return {
        jsonBody: { totalRecords, records1h, records24h, records7d, totalDevices, devices1h, devices24h, devices7d, recordsPerDayY, recordsPerHourY, totalAttachments, totalFailures, totalSuccesses },
        headers: { "Content-Type": "application/json" }
    }; 
};

async function setStatisticsTotals() {
    await containerClient.createIfNotExists();
    const containerExists = await containerClient.exists();
    const blobName = `statistics/totals`

    // Get new total records, record entries, and attachments from containerClient
    let totalRecords = 0
    let totalAttachments = 0
    let totalDevices = 0
    let uniqueRecords = new Set<string>();

    if (containerExists) {
        for await (const blob of containerClient.listBlobsFlat()) {
            // Only count blobs that are records or legacy records, skip attachments
            if (blob.name.includes('prov/')) {
                totalRecords++
                uniqueRecords.add(findDeviceIdFromName(blob.name))
            } else if (!(blob.name.includes('statistics/'))) {
                totalAttachments++
            }
        }
    }

    totalDevices = uniqueRecords.size

    // Update the blob with our new values
    const payloadObj = { totalRecords: totalRecords, totalDevices: totalDevices, totalAttachments: totalAttachments};
    const data = JSON.stringify(payloadObj);

    const uploadOptions = {
        tier: "Cool",
        blobHTTPHeaders: {
            blobContentType: "application/json; charset=utf-8",
        },
    };

    try {
        await containerClient.uploadBlockBlob(
            blobName,
            data,
            data.length,
            uploadOptions
        )
    } catch(error) {
        const msg = error instanceof Error ? error.message : String(error);
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
        isPublicKey: z.boolean().optional(),
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
        let getRecords = await fetch(`${baseUrl}${deviceKey}`)
        const records = await getRecords.json()

        if (records[0].record.tags.includes("annotate")) {
            let length = Object.keys(records).length;
            let keysToCheck = Array.from(new Set(records[length - 1].record.children_key));

            // Send annotated record to all children
            while (keysToCheck.length != 0) {
                let key = keysToCheck[0];
                let getKey = await fetch(`${baseUrl}${key}`);
                const keyProvenance = await getKey.json();

                // Make sure key is NOT a public key (public keys do not have the ability to recall)
                if (!keyProvenance[0].record.isPublicKey) {
                    let uniqueChildKeys = deduplicateKeys(keyProvenance[0].record.children_key);

                    if (uniqueChildKeys.includes(deviceKey.toString())) {
                        uniqueChildKeys.splice(uniqueChildKeys.indexOf(deviceKey.toString()), 1);
                    }

                    keysToCheck = keysToCheck.concat(uniqueChildKeys);

                    const keyFormData = new FormData();
                    keyFormData.append("provenanceRecord", JSON.stringify({
                        blobType: 'deviceRecord',
                        description: records[0].record.description || "Annotated by Group",
                        children_key: '',
                        tags: records[0].record.tags,
                    }));
                    
                    let response = await fetch(`${baseUrl}${key}`, {
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
 
async function addRecordWithTags(baseUrl, deviceKey, tags, description) {
    let theUrl = `${baseUrl}${deviceKey}`;

    const updateData = {
      blobType: 'deviceRecord',
      description: description || "Adding record with tags",
      tags: tags,
      children_key: '',
    };
    
    const updateFormData = new FormData();
    updateFormData.append("provenanceRecord", JSON.stringify(updateData));
    
    return await fetch(theUrl, {
      method: "POST",
      body: updateFormData,
    });
}

// Recall: Pin and send new record entry to all children
export async function recall(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {

    const baseUrl = process.env['backend_url'];
    const deviceKey = request.params.deviceKey;

    const formData = await request.formData();
    const recordStr = formData.get("provenanceRecord"); 
    const record = JSON5.parse(formData.get("provenanceRecord") as string) || { tags: []};

    record.tags ??= [];
    if (!record.tags.includes("recall")) record.tags.push("recall");
    const tags = record.tags
    
    const description = record.description || "";

    await addRecordWithTags(baseUrl, deviceKey, tags, description)

    try {
        let getRecords = await fetch(`${baseUrl}${deviceKey}`)
        const records = await getRecords.json()


        if (records[0].record.tags.includes("recall")) {
            let length = Object.keys(records).length;
            let keysToCheck = Array.from(new Set(records[length - 1].record.children_key));

            // Send recalled record to all children
            while (keysToCheck.length != 0) {
                let key = keysToCheck[0];
                let getKey = await fetch(`${baseUrl}${key}`);
                const keyProvenance = await getKey.json();


                // Make sure key is NOT a public key (public keys do not have the ability to recall)
                if (!keyProvenance[0].record.isPublicKey) {

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
                    
                    let response = await fetch(`${baseUrl}${key}`, {
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
        console.error(`Error recalling children: ${error}`);
        return {
            status: 500
        }
    }
}

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
    }
}

export async function postNotificationEmail(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        // parse email, recordKey and tags from body
        const body = await request.json() as any;
        context.log('body:', body);
        const email = body.email;
        const recordKey = body.recordKey;
        // const tags = body.tags ?? [];

        if (!email || !recordKey) {
            return {
                jsonBody: {error: "Error: email and record key required"},
                status: 400
            }
        }

        context.log("Received signup for " + email)

        // Pending Verifications Table (copied from postEmail - will refactor later)
        const tableUrl = accountName === "devstoreaccount1"
            ? `http://127.0.0.1:10002/devstoreaccount1`
            : `https://${accountName}.table.core.windows.net`;

        // const tableUrl =  `https://gdtteststorage.table.core.windows.net` 

        let table = 'PendingEmailVerifications'
        const credential = new AzureNamedKeyCredential(accountName, accountKey);
        const tableClient = new TableClient(tableUrl, table, credential, { allowInsecureConnection: true })
        await tableClient.createTable();  // Create if not exist, no error if it does

        // generate code
        const code = (crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).toString().padStart(6, "0");
        const token = Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString('base64url');

        // store email, code, rec and tags in table
        const codeExpiration = 10 * 60 * 1000;
        const entity = {
            partitionKey: token,
            rowKey: code,
            email: email,
            verified: false,
            expiresAt: Date.now() + codeExpiration,
            recordKey: recordKey,
            // tags: JSON.stringify(tags),
        };

        await tableClient.upsertEntity(entity);

        // sendEmail() with the code attached
        // from_address: string, to_address: string, subject: string, plainText: string, displayName: string
        const frontendUrl = process.env['frontend_url'];
        const verifyLink = `${frontendUrl}/verify?token=${token}&code=${code}`;
        
        try {
            const { sendEmail } = await import('./sendEmail.js'); //  This prevents the top-level code in sendEmail.ts from running at startup.
            
            // Validation email body with link included here for later work, see issue 1121. 
            // `Your verification code is: ${code} \n\nOr click this link to verify automatically:${verifyLink} \nExpires in 10 minutes.\nIf you didn't request this, ignore this email.`,
            const emailResult = await sendEmail(
                "DoNotReply@8577d69b-9011-4385-abec-cfe9325dbfe6.azurecomm.net",
                email,
                "GOSQAS Verification Code",
                `Your verification code is: ${code} \n\nExpires in 10 minutes. \nIf you didn't request this, ignore this email.`,
                "GOSQAS Notification",
                context
            )

            context.log('Email send result:', emailResult);

            if (emailResult.status !== "Succeeded") {
                throw emailResult
            }

        } catch (error) {
            context.log("Error sending email: " + error); 
            throw error  
        }

        // Return Success (frontend checks for properly formed email)
        return {
            jsonBody: {message: "Success", token: token },
            status: 200
        } 
        
    } catch(error) {
        context.error(error.message);
        console.log(error)
        if(Object.hasOwn(error, 'message') && Object.hasOwn(error.message, 'statusCode') && error.message.statusCode == 429) {
            return {
                jsonBody: { message: "" }, // Deliberately blank
                status: 429
            }
        } else {
            return {
                jsonBody: {message: "Internal Server Error"},
                status: 500,
            }
        }
    }
}


export async function getPendingVerification(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const token = request.query.get('token');   
 
        if (!token) { 
            return {
                jsonBody: { error: "Token required" }, 
                status: 400
            }
        }

    const tableUrl = accountName === "devstoreaccount1"
            ? `http://127.0.0.1:10002/devstoreaccount1` 
            : `https://${accountName}.table.core.windows.net`;

        // const tableUrl =  `https://gdtteststorage.table.core.windows.net` 

    const credential = new AzureNamedKeyCredential(accountName, accountKey);
    const tableClient = new TableClient(tableUrl, 'PendingEmailVerifications', credential, { allowInsecureConnection: true });

    // query by partitionKey (token)
    const entities = tableClient.listEntities({
        queryOptions: { filter: `PartitionKey eq '${token}'` }
    });

    // get first match
    let entity = null;
    for await (const e of entities) {
        entity = e;
        break;
    }

    // not found
    if (!entity) {
        return {
            jsonBody: { error: "Invalid or expired code" },
            status: 404
        }
    }

    // expired - delete and return 404
    if (Date.now() > entity.expiresAt) {
        await tableClient.deleteEntity(entity.partitionKey as string, entity.rowKey as string);
        return {
            jsonBody: { error: "Expired", recordKey: entity.recordKey as string },
            status: 410
        }
    }

    // valid - return 200
    return {
        jsonBody: { message: "Valid", recordKey: entity.recordKey as string },
        status: 200
    }

    } catch(error) {
        console.error(error.message);
        return {
            jsonBody: { message: "Internal Error" },
            status: 500
        }
    }
}

// setup TableClient for PendingVerifications
// on success should call signupForNotifications - cause email is now verfies
export async function postVerifyCode(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        // get email and code
        const body = await request.json() as any;
        const token = body.token;
        const code = body.code;
        const tags = []

        if (!token || !code) {
            return {
                jsonBody: { error: "Token and code required" },
                status: 400
            }
        }

        // get the PendingVerifications table
        const tableUrl = accountName === "devstoreaccount1"
            ? `http://127.0.0.1:10002/devstoreaccount1`
            : `https://${accountName}.table.core.windows.net`;

        // const tableUrl =  `https://gdtteststorage.table.core.windows.net`
        let table = 'PendingEmailVerifications'
        const credential = new AzureNamedKeyCredential(accountName, accountKey);
        const tableClient = new TableClient(tableUrl, table, credential, { allowInsecureConnection: true })
        await tableClient.createTable();  // Create if not exist, no error if it does


        // look up directly by partitionKey (token) and rowKey (code)
        let entity = null;
        try {
            entity = await tableClient.getEntity(token, code);
        } catch {
            // not found
        }

        // not found, expired - same generic msg
        if (!entity || Date.now() > entity.expiresAt) {
            return {
                jsonBody: { error: "Invalid or expired code" },
                status: 400
            }
        }

        await tableClient.updateEntity({ partitionKey: token, rowKey: code, verified: true }, 'Merge');

        // Proof of concept 
        // on success, delete pending entity and call signupForNotifications
        await containerClient.createIfNotExists();
        await updateNotifications(containerClient, calculateDeviceID, entity.recordKey as string, entity.email as string, tags, true);
        // return response

        return {
            jsonBody: {message: "Success", recordKey: entity.recordKey as string},
            status: 200
        } 
    } catch(error) {
        console.error(error.message);
        return {
            jsonBody: {message: "Internal Error"},
            status: 500,
        }  
    }
} 

// Additional helper function to resend code using the token instead of the email
// keeping the email out of the url is better for privacy
export async function postResendCode(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as any;   
        const token = body.token;

        if (!token) {
            return {
                jsonBody: {error: "Token required"},
                status: 400
            }
        }

        // get the pendingemailver table
        const tableUrl = accountName === "devstoreaccount1"
             ? `http://127.0.0.1:10002/devstoreaccount1`
             : `https://${accountName}.table.core.windows.net`;

        //const tableUrl =  `https://gdtteststorage.table.core.windows.net`

        let table = 'PendingEmailVerifications'
        const credential = new AzureNamedKeyCredential(accountName, accountKey);
        const tableClient = new TableClient(tableUrl, table, credential, { allowInsecureConnection: true })

        // find the old entity by partitionKey (token)
        const entities = tableClient.listEntities({
            queryOptions: {filter: `PartitionKey eq '${token}'`}
        });

        let entity = null;
        for await (const e of entities) {
            entity = e;
            break;
        }

        // not found
        if (!entity) {
            return {
                jsonBody: { error: "Invalid or expired code" },
                status: 404
            }
        }

        // gen new code
        const code = (crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).toString().padStart(6, "0");

        // delete old entity (token, oldCode) and create new (token, newCode)
        const codeExpiration = 10 * 60 * 1000;
        await tableClient.deleteEntity(token, entity.rowKey as string);
        const updatedEntity = {
            partitionKey: token,
            rowKey: code,
            email: entity.email as string,
            verified: false,
            expiresAt: Date.now() + codeExpiration,
            recordKey: entity.recordKey as string,
            // tags: entity.tags as string ?? '[]'
        };

        await tableClient.createEntity(updatedEntity);

        // sendEmail() with the code attached
        // from_address: string, to_address: string, subject: string, plainText: string, displayName: string;
        const frontendUrl = process.env['frontend_url'];
        const verifyLink = `${frontendUrl}/verify?token=${token}&code=${code}`;

        try {
            const { sendEmail } = await import('./sendEmail.js'); //  This prevents the top-level code in sendEmail.ts from running at startup.
            
            // Validation email body with link included here for later work, see issue 1121. 
            // `Your verification code is: ${code} \n\nOr click this link to verify automatically:${verifyLink} \n\nExpires in 10 minutes.\nIf you didn't request this, ignore this email.`,
            const emailResult = await sendEmail(
                "DoNotReply@8577d69b-9011-4385-abec-cfe9325dbfe6.azurecomm.net",
                entity.email as string,
                "GOSQAS Verification Code",
                `Your verification code is: ${code} \n\nExpires in 10 minutes.\nIf you didn't request this, ignore this email.`,
                "GOSQAS Notification",
                context
            ) 

            context.log('Email resend results:', emailResult);

            if (emailResult.status !== "Succeeded") {
                throw emailResult
            }

        } catch (error) {
            context.log("Error sending email: " + error);   
            throw error
        }

        // Return Success (frontend has checks for properly formed email)
        return {
            jsonBody: {message: "Success" },
            status: 200
        } 
        
    } catch(error) {
        console.error(error.message);
        return {
            jsonBody: {message: "Internal Server Error"},
            status: 500,
        }

    }
}


export async function deleteNotificationEmail(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as any;
        const emailID = body.id;
        const recordKey = body.recordKey;
        const tags: string[] = [];

        if (!emailID || !recordKey) {
            return {
                jsonBody: {error: "Error: email id and record key required"},
                status: 400
            }
        }

        await containerClient.createIfNotExists();
        const response = await updateNotifications(containerClient, calculateDeviceID, recordKey, emailID, tags, false); 

        context.log("Unsubscribed from the record");
        return response;
        
    } catch(error) {
        context.error(error.message);
        return {
            jsonBody: {message: "Internal Server Error"},
            status: 500,
        }
    }
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
        const putResponse = await updateNotifications(containerClient, calculateDeviceID, key, "email@email.foo", [], true)

        // Access it
        const getResponse = await retrieveNotifEmails(containerClient, calculateDeviceID, key)


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

async function createChild(context: InvocationContext, description: string, custom_title: string, tags: string[] = [], isPublicKey: boolean = false ) {
    /* 
    Note to self: Curious that since children are created before the group parent (implied by groups taking the 
    list of child keys), hasParent is set before the parent exists. What if parent creation fails? Retries don't
    solve all cases. Then the db gets littered. How large an issue this is is tbd. This may happen, but be nothing
    to worry about. Question for later: possible to see the "last accessed" date of blob in Azure? Is there an
    access count? Can we enact a policy of "delete if not accessed since creation and it's been three years"?
    */ 

    try {
        const baseUrl = process.env['backend_url'];
        const childKey = await makeEncodedDeviceKey();

        // Create child and group records
        const childFormData = new FormData();
        childFormData.append("provenanceRecord", JSON.stringify({
            blobType: "deviceInitializer",
            deviceName: custom_title,
            description: description || "",
            tags: tags,
            hasParent: true,
            isPublicKey: isPublicKey
        }));

        // https://developer.mozilla.org/en-US/docs/Web/API/Response
        const theResponse = await fetch(`${baseUrl}${childKey}`, {
            method: "POST",
            body: childFormData,
        });

        const theJson = await theResponse.json()
        const dataUrl = theResponse.url.split('/')
        const theRecordKey = dataUrl[dataUrl.length - 1]
        context.log(theRecordKey)
        return theRecordKey

    } catch(e) {
        context.log('createChild Error: Failed to create child record')
        return '';
    }
}

async function createChildren(context, description: string, number_of_children: number,  custom_child_titles: string[], hasPublicKey: boolean, tags: string[] = []) {
    const childrenKeys = []  // Named to correspond with metadatum name expected by frontend
    let thisChild;
    let j = 0;
    
    for (let i = 0; i < 3 * number_of_children; i++) {  // Re: 3 * num: three retries per; attempts are identical
        if(!(thisChild = await createChild(context, description, custom_child_titles[j], tags))) {
            continue;
        }

        j++;
        childrenKeys.push(thisChild)
        if(childrenKeys.length == number_of_children) { 
            // PublicKey is itself a record that is part of a group
            if(hasPublicKey){
                const publicTags = [...tags, "publickey"]
                if(!(thisChild = await createChild(context, description, "Public Key", publicTags, true))) {
                    continue;
                }
                childrenKeys.push(thisChild)
            }
            break;
        }
    }

    return childrenKeys; 
}

async function createGroup(context, name, description, n_children: number = 0, custom_child_titles: string[], hasPublicKey: boolean, tags: string[], attachments: NamedBlob[] = [], annotate: boolean = false) {
    const frontendUrl = process.env['frontend_url'];
    const backendUrl = process.env['backend_url'];

    n_children = Math.max(0, n_children ?? 0);

    // determines if parent deviceName + record number, custom titles, or a blank title to be used for child deviceName
    if (!Array.isArray(custom_child_titles)) {
        custom_child_titles = []
        for (let i = 0; i < n_children; i++) {
                custom_child_titles.push(`${name} #${i + 1}`)
        }
    };

    let customLen = custom_child_titles.length
    if (n_children > customLen) {
        for (let i = 0; i < n_children - customLen; i++) {
            custom_child_titles.push("")
        }
    };
    // Create children first
    let childKeys = await createChildren(context, description, n_children, custom_child_titles, hasPublicKey, tags)
    let totalChildren = n_children + (hasPublicKey ? 1 : 0)
    if (childKeys.length !== totalChildren) {
        throw new Error(`Failed to create all child records: expected ${totalChildren}, got ${childKeys.length}`);
    }

    const groupKey = await makeEncodedDeviceKey()
    const groupFormData = new FormData();

    let public_key = '';
    if(hasPublicKey){
        public_key = childKeys.at(-1);
    }

    groupFormData.append("provenanceRecord", JSON.stringify({
        blobType: "deviceInitializer",
        deviceName: name,
        description: description,
        number_of_children: n_children,
        children_key: childKeys,   
        children_name: custom_child_titles,
        ...(public_key ? { publicKey: public_key } : {}), // only gets added if public key is present
        tags: tags,         
        hasParent: false,
        isPublicKey: false
    })); context.log(groupFormData)

    for (const attachment of attachments) {
        groupFormData.append("attachment", attachment.blob, attachment.name);
    }
    const createInitUrl = `${backendUrl}${groupKey}`
    const groupResponse = await fetch(createInitUrl, {
        method: "POST",
        body: groupFormData,
    });
    if (!groupResponse.ok) {
        const errorBody = await groupResponse.text().catch(() => "");
        throw new Error(`Failed to create group record ${groupKey}: ${groupResponse.status} ${errorBody}`);
    }
    if(annotate){
        for (const key of childKeys){
            if(key !== public_key){
                const annotateFormData = new FormData();
                annotateFormData.append("provenanceRecord", JSON.stringify({
                    blobType: "deviceRecord",
                    description: description || "Annotated by Group",
                    children_key: '',
                    tags: [...tags, "notify_all"],
                }));

                await fetch(`${backendUrl}${key}`, {
                    method: "POST",
                    body:annotateFormData,
                });
            }
        }
    }

    let groupUrlRecordPage = `${frontendUrl}/record/${groupKey}`
    context.log(groupUrlRecordPage)

    return groupUrlRecordPage;
}

const GroupCreationOrderSchema = z.object({
    deviceName: z.string(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    publicKey: z.string().optional(),
    number_of_children: z.number().optional(),
    hasPublicKey: z.boolean().optional(),
    custom_record_titles: z.array(z.string()).optional(),
    children_name: z.array(z.string()).optional(),
    create_public_key: z.boolean().optional(),
    annotate: z.boolean().optional(),
});

export async function createGroupHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try{
        const attachments: NamedBlob[] = [];
        const formData = await request.formData();

        const recordStr = formData.get("provenanceRecord"); 
        if (typeof recordStr !== "string") {
            throw new SyntaxError(
                "Missing provenanceRecord in form data"
            );
        }

        let theRequest = JSON.parse(recordStr); // contentType: multipart/form-data
        for (const value of formData.values()) {
            if (typeof value === "string") continue;
            attachments.push({name: value.name || "attachment", blob: value});
        }

        GroupCreationOrderSchema.parse(theRequest)
        let title = theRequest['deviceName']
        let description = theRequest['description']
        let n_children = theRequest['number_of_children']
        let hasPublicKey = theRequest['hasPublicKey']
        let tags = theRequest['tags']
        let custom_child_titles = theRequest['children_name']
        let annotate = theRequest['annotate']
        let theGroupRecordPageUrl = await createGroup(context, title, description, n_children, custom_child_titles, hasPublicKey, tags, attachments, annotate)
        context.log(theGroupRecordPageUrl)

        return {
            status: 200,
            jsonBody: { groupUrl: theGroupRecordPageUrl },
            headers: { "Content-Type": "application/json" }
        }
    } catch(error) {
        context.error('Failed to create group: ', error.message)
        let message;

        if (error instanceof z.ZodError) {
            message = 'Error: Check argument format.'
            context.error(message)
            return {
                status: 400,
                jsonBody: { data: message },
                headers: { "Content-Type": "text/plain" }
            }
        }

        if (error instanceof SyntaxError) {
            message = 'Error: Check json structure.'
            context.error(message)
            return {
                status: 400,
                jsonBody: { data: message },
                headers: { "Content-Type": "text/plain" }
            }
        }

        message = 'Error: Internal server error.'
        context.error(message)
        return {
            status: 500,
            jsonBody: { data: message },
            headers: { "Content-Type": "text/plain" }
        }
    }
}

async function createRecord(context, name, description, tags, attachments) {
    const baseUrl = process.env['backend_url'];
    const frontendUrl = process.env['frontend_url'];
    const deviceKey = await makeEncodedDeviceKey();
    const decodedDeviceKey = decodeKey(deviceKey);

    try {
        const data = {
            blobType: 'deviceInitializer',
            deviceName: name,
            description: description,
            tags: tags,
            children_key: '',
            hasParent: false,
            isPublicKey: false,
        };

        // use uploadProvenance to post the record and any attachments
        await containerClient.createIfNotExists();
        const timestamp = new Date().getTime();
        const body = await uploadProvenance(containerClient, decodedDeviceKey, timestamp, data, attachments);
        if (body.oversizedAttachments) {
            return {
                status: 400,
                jsonBody: {
                    error: `The following file(s) exceed the maximum allowed size of ${MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB: ${body.oversizedAttachments.join(', ')}`,
                    oversizedAttachments: body.oversizedAttachments,
                    attachments: body.attachments
                }
            }
        }

        return `${frontendUrl}/record/${deviceKey}`;

    } catch (error) {
        context.error('createRecord Error: Failed to create record' + error); 
        return '';
    }
}

const RecordCreationOrderSchema = z.object({
    blobType: z.string().optional(),
    deviceName: z.string(),
    description: z.string(),
    children_key: z.union([z.string(), z.array(z.string())]),
    children_name: z.array(z.string()).optional(),
    hasParent: z.boolean().optional(),
    isPublicKey: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
});

export async function createRecordHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try{
        const formData = await request.formData();
        const recordStr = formData.get("provenanceRecord");
        if (typeof recordStr !== "string") {
            throw new SyntaxError("Missing provenanceRecord in form data");
        }

        let theRequest = JSON.parse(recordStr);
        RecordCreationOrderSchema.parse(theRequest);
        let name = theRequest['deviceName'];
        let description = theRequest['description'];
        let tags = theRequest['tags'];

        // if there's an attachment create a blob to add to the record
        const attachments = new Array<NamedBlob>();
        for (const value of formData.values()) {
            if (typeof value === "string") continue;
            attachments.push({ name: value.name || "attachment", blob: value });
        }

        let recordUrl = await createRecord(context, name, description, tags, attachments)
        context.log(recordUrl)
        return {
            status: 200,
            jsonBody: { recordUrl: recordUrl },
            headers: { "Content-Type": "text/plain" }
        }
    } catch(error) {
        context.error('Failed to create record: ', error.message)
        let message;

        if (error instanceof z.ZodError) {
            message = 'Error: Check argument format.'
            context.error(message)
            return {
                status: 400,
                jsonBody: { data: message },
                headers: { "Content-Type": "text/plain" }
            }
        }

        if (error instanceof SyntaxError) {
            message = 'Error: Check json structure.'
            context.error(message)
            return {
                status: 400,
                jsonBody: { data: message },
                headers: { "Content-Type": "text/plain" }
            }
        }

        message = 'Error: Internal server error.'
        context.error(message)
        return {
            status: 500,
            jsonBody: { data: message },
            headers: { "Content-Type": "text/plain" }
        }
    }
}

// just a wrapper fxn for postProvenance
export async function addEntryHandler(request:HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    // no longer permanently consumes the body, instead makes a copy of the request object that enables body consumption and reuse
    // see: https://developer.mozilla.org/en-US/docs/Web/API/Request/clone
    const requestClone = request.clone();
    const formData = await requestClone.formData();
    const tagsExist = JSON.parse(formData.get("provenanceRecord")).tags

    const postProvResponse = await postProvenance(request, context)
    if (tagsExist && tagsExist.includes("annotate")) {
        const notifChildrenResponse = await notifyChildren(request, context)
    }

    return postProvResponse
}

// Once per day update the total record, record entry, and attachment counts
app.timer('updateRecordCounts', {
    schedule: `0 0 * * *`,
    handler: setStatisticsTotals
})


/* ----- API Endpoints Section 2/2: Route Definitions ----- */

app.post("createRecord", {
    authLevel: 'anonymous',
    route: 'createRecord',
    handler: createRecordHandler
})

app.post("createGroup", {
    authLevel: 'anonymous',
    route: 'createGroup',
    handler: createGroupHandler
})

app.post('deleteNotificationEmail', {
    authLevel: 'anonymous',
    route: 'notificationUnsubscribe',
    handler: deleteNotificationEmail,
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

app.post('recall', {
    authLevel: 'anonymous',
    route: 'recall/{deviceKey}',
    handler: recall,
})

app.post('addEntry', {
    authLevel: 'anonymous',
    route: 'addEntry/{deviceKey}',
    handler: addEntryHandler
})

app.post('postResendCode', {
    authLevel: 'anonymous',
    route: 'resendCode',
    handler: postResendCode,
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

app.get('getPendingVerification', {
    authLevel: 'anonymous',
    route: 'pendingVerification',
    handler: getPendingVerification,
})

app.post("postVerifyCode", {
    authLevel: 'anonymous',
    route: 'verifyCode',
    handler: postVerifyCode
})