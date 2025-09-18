import { File } from 'node:buffer';
import { readdir, readFile, lstat } from 'node:fs/promises'
import { join, extname} from 'node:path'
import { lookup as mimeLookup} from 'mime-types'
import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const localBaseUrl = "http://localhost:7071/api"
const cloudBaseUrl = "https://gosqasbe.azurewebsites.net/api"

async function getStatistics(baseUrl: string) {
    const response = await fetch(`${baseUrl}/statistics`, { method: "GET", });
    //trying to see what is stored in the response
    console.log(response.status)
    return await response.json();

}
async function getProvRecords(baseUrl: string, deviceKey: string) {
    const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
        method: "GET",
    });
    return await response.json() as { record: any, attachments?: string[], deviceID: string, timestamp: number }[];
}

async function getAttachment(baseUrl: string, deviceKey: string, attachmentID: string) {
    return await fetch(`${baseUrl}/attachment/${deviceKey}/${attachmentID}`, {
        method: "GET",
    });
}

async function getAttachmentName(baseUrl: string, deviceKey: string, attachmentID: string) {
    return await fetch(`${baseUrl}/attachment/${deviceKey}/${attachmentID}/name`, {
        method: "GET",
    });
}

async function putProvRecord(baseUrl: string, deviceKey: string, record: any, attachments: readonly File[]) {
    const formData = new FormData();
    formData.append("provenanceRecord", JSON.stringify(record));
    for (const blob of attachments) {
        formData.append(blob.name, blob as Blob);
    }
    const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
        method: "POST",
        body: formData,
    });
    return await response.json();
}

const testDeviceKey = "5LAtuNjm3iuAR3ohpjTMy7";

const testRecord = {
    id: 95,
    title: 'Wholesale cargo lashing Belt',
    price: 930,
    quantity: 1,
    total: 930,
    discountPercentage: 17.67,
    discountedPrice: 766,
}

const program = new Command();

interface StartOptions {
    cloud?: boolean
    put?: boolean
    statistics?: boolean
}

program
    .option('-c, --cloud', 'use cloud data storage')
    .option('-p, --put', 'put to storage')
    .option('-s, --statistics', "get statistics")
    .action(async (options: StartOptions) => {
        const baseUrl = options.cloud ?? false ? cloudBaseUrl : localBaseUrl; 
        const doStats = options.statistics ?? false;

        if (doStats) {
            const stats = await getStatistics(baseUrl);
            console.log("statistics", stats);
            return;
        } 

        const doPut = options.put ?? false;
        console.log(`${doPut ? "Putting to" : "Getting from"} ${baseUrl}`);

        if (doPut) {
            const images = await getTestImages();
            const response = await putProvRecord(baseUrl, testDeviceKey, testRecord, images);
            console.log(response);
        } else {
            const json = await getProvRecords(baseUrl, testDeviceKey);
            console.log(json);
        
            const attachment = json[0]?.attachments?.[0];
            if (attachment) {
                console.log(`Downloading ${attachment}`);
                const resp = await getAttachment(baseUrl, testDeviceKey, attachment);
                console.log("Headers");
                for (const [key, value] of resp.headers) {
                    console.log(`  ${key}: ${value}`);
                }
                const resp2 = await getAttachmentName(baseUrl, testDeviceKey, attachment);
                const name = await resp2.text();
                console.log({name});
            }
        }
    })

program.parse(process.argv);

async function getTestImages(): Promise<readonly File[]> {
    const images = new Array<File>();
    for (const fileName of await readdir(__dirname)) {
        const filePath = join(__dirname, fileName);
        const stat = await lstat(filePath);
        if (!stat.isFile()) continue; // Skip if not a file
        const ext = extname(fileName);
        if (ext === ".ts") continue;
        const type = mimeLookup(ext) || 'application/octet-stream';
        const buffer = await readFile(filePath);
        const file = new File([buffer], fileName, { type });
        images.push(file)
    }
    return images;
}