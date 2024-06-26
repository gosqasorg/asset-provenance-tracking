import { webcrypto as crypto } from 'node:crypto';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlockBlobClient, ContainerClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import * as bs58 from 'bs58';
import * as JSON5 from 'json5';

// To deploy this project from the command line, you need:
//  * Azure CLI : https://learn.microsoft.com/en-us/cli/azure/
//  * Azure Functions Core Tools: https://github.com/Azure/azure-functions-core-tools/blob/v4.x/README.md

// Once you've logged into Azure via 'az login' to an Azure account w/ PubInv permissions,
// you deploy this function project via this command:
//  > func azure functionapp publish gosqasbe

interface ProvenanceRecord {
    record: any,
    attachments?: readonly string[],
}

async function sha256(data: BufferSource) {
    const buffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(buffer);
}

function toHex(data: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>): string {
    return Buffer.from(data).toString("hex");
}

function fromHex(hex: string): Uint8Array {
    return new Uint8Array(Buffer.from(hex, 'hex'));
}

function decodeKey(key: string): Uint8Array {
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

async function calculateDeviceID(key: string | Uint8Array): Promise<string> {
    // if key is a string, convert it to a buffer
    key = typeof key === 'string' ? decodeKey(key) : key;
    const hash = await sha256(key);
    return toHex(hash);
}

async function encrypt(key: Uint8Array, data: BufferSource): Promise<{ salt: Uint8Array; encryptedData: Uint8Array; }> {
    const $key = await crypto.subtle.importKey("raw", key.buffer, "AES-CBC", false, ['encrypt']);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encryptedData = await crypto.subtle.encrypt({ name: "AES-CBC", iv: salt }, $key, data);
    return { salt, encryptedData: new Uint8Array(encryptedData) };
}

async function decrypt(key: Uint8Array, salt: Uint8Array, encryptedData: Uint8Array): Promise<Uint8Array> {
    const $key = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["decrypt"]);
    const result = await crypto.subtle.decrypt({ name: "AES-CBC", iv: salt }, $key, encryptedData);
    return new Uint8Array(result);
}

async function upload(client: ContainerClient, deviceKey: Uint8Array, data: BufferSource, type: 'attach' | 'prov', contentType: string, timestamp: number): Promise<string> {
    const dataHash = toHex(await sha256(data));
    const deviceID = await calculateDeviceID(deviceKey);
    const { salt, encryptedData } = await encrypt(deviceKey, data);
    const blobID = toHex(await sha256(encryptedData));
    const blobName = `${client.containerName}/${deviceID}/${type}/${blobID}`;

    await client.uploadBlockBlob(blobName, encryptedData.buffer, encryptedData.length, {
        metadata: {
            gdtcontenttype: contentType,
            gdthash: dataHash,
            gdtsalt: toHex(salt),
            gdttimestamp: `${timestamp}`,
        },
        blobHTTPHeaders: {
            blobContentType: "application/octet-stream"
        }
    });
    return blobID;
}

async function decryptBlob(client: BlockBlobClient, deviceKey: Uint8Array) {
    const props = await client.getProperties();
    const salt = props.metadata?.["gdtsalt"];
    if (!salt) throw new Error(`Missing Salt ${client.name}`);
    const timestamp = parseInt(props.metadata?.["gdttimestamp"]);
    if (isNaN(timestamp) || !isFinite(timestamp)) throw new Error(`Invalid Timestamp ${client.name}`);

    const buffer = await client.downloadToBuffer();
    const data = await decrypt(deviceKey, fromHex(salt), buffer);
    const hash = props.metadata?.["gdthash"];
    if (hash) {
        if (!areEqual(fromHex(hash), await sha256(data))) {
            throw new Error(`Invalid Hash ${client.name}`);
        }
    }
    const contentType = props.metadata?.["gdtcontenttype"];
    return { data, contentType, timestamp };

    function areEqual(first: Uint8Array, second: Uint8Array) {
        return first.length === second.length
            && first.every((value, index) => value === second[index]);
    }
}

const accountName = process.env["AZURE_STORAGE_ACCOUNT_NAME"] ?? "devstoreaccount1";
const accountKey = process.env["AZURE_STORAGE_ACCOUNT_KEY"] ?? "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
const baseUrl = accountName === "devstoreaccount1"
    ? `http://127.0.0.1:10000/devstoreaccount1`
    : `https://${accountName}.blob.core.windows.net`;

const cred = new StorageSharedKeyCredential(accountName, accountKey);
const containerClient = new ContainerClient(`${baseUrl}/gosqas`, cred);

async function getProvenance(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const deviceID = await calculateDeviceID(deviceKey);
    context.log(`getProvenance`, { accountName, deviceKey: request.params.deviceKey, deviceID });

    const containerExists = await containerClient.exists();
    if (!containerExists) { return { jsonBody: [] }; }

    const records = new Array<ProvenanceRecord & { deviceID: string, timestamp: number }>();
    for await (const blob of containerClient.listBlobsFlat({ prefix: `gosqas/${deviceID}/prov/` })) {
        const blobClient = containerClient.getBlockBlobClient(blob.name);
        const { data, timestamp } = await decryptBlob(blobClient, deviceKey);
        const json = new TextDecoder().decode(data);
        const provRecord = JSON.parse(json) as ProvenanceRecord;
        records.push({ ...provRecord, deviceID, timestamp });
    }
    records.sort((a, b) => b.timestamp - a.timestamp)
  return { jsonBody: records };
}

async function getAttachment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const deviceID = await calculateDeviceID(deviceKey);
    const attachmentID = request.params.attachmentID;
    context.log(`getAttachment`, { accountName, deviceKey: request.params.deviceKey, deviceID, attachmentID });

    const containerExists = await containerClient.exists();
    if (!containerExists) { return { status: 404 }; }

    const blobClient = containerClient.getBlockBlobClient(`gosqas/${deviceID}/attach/${attachmentID}`);
    const exists = await blobClient.exists();
    if (!exists) { return { status: 404 }; }

    const { data, contentType } = await decryptBlob(blobClient, deviceKey);
    return {
        body: data,
        headers: contentType
            ? { "Content-Type": contentType }
            : undefined
    };
};

async function postProvenance(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const deviceKey = decodeKey(request.params.deviceKey);
    const deviceID = await calculateDeviceID(deviceKey);
    context.log(`postProvenance`, { accountName, deviceKey: request.params.deviceKey, deviceID });

    await containerClient.createIfNotExists();

    const formData = await request.formData();
    const provenanceRecord = formData.get("provenanceRecord");
    if (typeof provenanceRecord !== 'string') { return { status: 404 }; }
    const record = JSON5.parse(provenanceRecord);

    // https://stackoverflow.com/questions/9756120/how-do-i-get-a-utc-timestamp-in-javascript#comment73511758_9756120
    const timestamp = new Date().getTime();

    const attachments = new Array<string>();
    {
        for (const attach of formData.getAll("attachment")) {
            if (typeof attach === 'string') continue;
            const data = await attach.arrayBuffer()
            const attachmentID = await upload(containerClient, deviceKey, data, "attach", attach.type, timestamp);
            attachments.push(attachmentID);
        }
    }

    {
        const provRecord: ProvenanceRecord = { record, attachments };
        const data = new TextEncoder().encode(JSON.stringify(provRecord));
        const recordID = await upload(containerClient, deviceKey, data, "prov", "application/json", timestamp);
      return {
        jsonBody: { record: recordID, attachments } };
    }
}
// blobNames look like: 'gosqas/63f4b781c0688d83d40908ff368fefa6a2fa4cd470216fd83b3d7d4c642578c0/prov/1a771caa4b15a45ae97b13d7a336e1e9c9ec1c91c70f1dc8f7749440c0af8114'
// where the id is that last part (before the last slash)
function findDeviceIdFromName(blobName : string) : string {
    return blobName.split("/",4)[1];
}

async function getStatistics(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {

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
        records.push({ timestamp: metadata.gdttimestamp, deviceID: id});
    }

    const contentType = "application/json";

    return {
        jsonBody: records,
        headers: { "Content-Type": contentType }
    };
};

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

app.get("getAttachment", {
    authLevel: 'anonymous',
    route: 'attachment/{deviceKey}/{attachmentID}',
    handler: getAttachment
})

app.get("getStatistics", {
    authLevel: 'anonymous',
    route: 'statistics',
    handler: getStatistics
})
