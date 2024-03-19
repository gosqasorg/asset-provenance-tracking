import { File } from 'node:buffer';
import { readdir, readFile } from 'node:fs/promises'
import { join, extname} from 'node:path'
import { lookup as mimelookup} from 'mime-types'
import { Command } from 'commander';

const localBaseUrl = "http://localhost:7071/api"
const cloudBaseUrl = "https://gosqasbe.azurewebsites.net/api"

async function getProvRecords(baseUrl: string, deviceKey: string) {
    const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
        method: "GET",
    });
    return await response.json() as { record: any, attachments?: string[], timestamp: number }[];
}

async function getAttachment(baseUrl: string, deviceKey: string, attachmentID: string) {
    const response = await fetch(`${baseUrl}/attachment/${deviceKey}/${attachmentID}`, {
        method: "GET",
    });
    return await response.blob();
}

async function putProvRecord(baseUrl: string, deviceKey: string, record: any, attachments: readonly Blob[]) {
    const formData = new FormData();
    formData.append("provenanceRecord", JSON.stringify(record));
    for (const blob of attachments) {
        formData.append("attachment", blob);
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
}

program
    .option('-c, --cloud', 'use cloud data storage')
    .option('-p, --put', 'put to storage')
    .action(async (options: StartOptions) => {
        const baseUrl = options.cloud ?? false ? cloudBaseUrl : localBaseUrl; 
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
                await getAttachment(baseUrl, testDeviceKey, attachment!);
            }
        }
    })

program.parse(process.argv);

async function getTestImages(): Promise<readonly File[]> {
    const images = new Array<File>();
    for (const fileName of await readdir(__dirname)) {
        const ext = extname(fileName);
        if (ext === ".ts") continue;
        const type = mimelookup(ext) || 'application/octet-stream';
        const buffer = await readFile(join(__dirname, fileName));
        const file = new File([buffer], fileName, { type });
        images.push(file)
    }
    return images
}