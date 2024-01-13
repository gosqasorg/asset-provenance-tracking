import fastify from 'fastify'
import fastifyView from '@fastify/view'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { Liquid } from 'liquidjs'
import * as qrcode from 'qrcode';
import { DeviceRepository, ProvenanceAttachment, ProvenanceRecord, ProvenanceRepository, calculateDeviceID, encodeKey } from './services';
import path from 'path'
import os from 'os'
import * as crypto from 'crypto';
import { FastifyRequest } from 'fastify/types/request'

type Attachment = Pick<ProvenanceAttachment, 'type' | 'data'>;

async function getFormFields(request: FastifyRequest) {
    const fields = new Map<string, string | Attachment>();
    for await (const part of request.parts()) {
        const fieldname = part.fieldname;
        if (part.type === 'file') {
            const buffer = await part.toBuffer();
            if (buffer.length === 0) continue;
            fields.set(fieldname, { data: buffer, type: part.mimetype });
        } else {
            const value = part.value!.toString();
            if (value.length === 0) continue;
            fields.set(fieldname, value)
        }
    }
    return fields;
}

export async function createFastifyServer(deviceRepo: DeviceRepository, recordRepo: ProvenanceRepository) {

    // the base URL is set via config var on heroku. If it's not set, generate it from the local service IP address
    const BASE_URL = process.env.BASE_URL ?? Object.entries(os.networkInterfaces())
        .flatMap(([key, value]) => (value ?? []).map(v => ({ name: key, ...v })))
        .filter(v => v.family === 'IPv4')
        .filter(v => !v.internal)
        .map(v => `http://${v.address}${process.env.PORT ? `:${process.env.PORT}` : ''}/`)[0];

    // __dirname is the directory of the compiled .js file in the dist directory,
    // so need to add the '..' to get to the root directory
    const engine = new Liquid({ root: path.join(__dirname, '..', 'views') });
    const server = fastify({ logger: true })
    server.register(fastifyView, {
        engine: { liquid: engine },
    });
    server.register(fastifyFormbody);
    server.register(fastifyMultipart, {
        limits: {
            fileSize: 1024 * 1024 * 10, // 10MB
        }
    });
    server.register(fastifyStatic, {
        root: path.join(__dirname, '..', 'public'),
        prefix: '/public/',
    });

    server.get('/', async (_request, reply) => {
        return reply.view('views/index', {})
    });

    server.post('/', async (request, reply) => {
        const fields = await getFormFields(request);

        const name = fields.get('name') as string;
        const description = fields.get('description') as string;
        const picture = fields.get('picture') as Attachment | undefined;
        const saveDeviceKey = fields.get('save-device-key') === "on";

        const deviceKey = encodeKey(crypto.randomBytes(16));
        if (saveDeviceKey) {
            await deviceRepo.createDevice(name, deviceKey);
        }
        await recordRepo.createRecord(deviceKey, description, {
            name,
            tags: ['creation'],
            attachments: picture ? [picture] : undefined,
            children_key: undefined,
            children_name: undefined,
        })

        reply.redirect(`/device/${deviceKey}`);
    });

    // This endpoint can be invoked from the command line: curl http://127.0.0.1:8000/manykeys/spudboy/3
    // And it will return something like:
    //      {"keys":["6bXXFunVNY9gtsY47n1tgQ","2UsUGTNYNFWA4jsdWBFxgf","LyGoHQ7wYr9XG1oWMkgXCx"]}
    // ...which creates 3 records and keys with the name "spudboy".
    server.get<{ Params: { count: number, name: string } }>('/manykeys/:name/:count', async (request, reply) => {
        const { count, name } = request.params;
        const description = "";

        let keys: string[] = [];
        for (let i = 0; i < count; i++) {
            const deviceKey = encodeKey(crypto.randomBytes(16));
            keys.push(deviceKey);
            await recordRepo.createRecord(deviceKey, description, {
                name,
                tags: ['creation'],
                attachments: undefined,
                children_key: undefined,
                children_name: undefined,
            })
        }

        reply.code(200).send({ keys: keys });
    });

    server.get('/info', async (request, reply) => {
        return reply.redirect("https://github.com/gosqasorg/home");
    });

    server.get('/devices', async (request, reply) => {
        const devices = await deviceRepo.getDevices();
        return reply.view('views/devices', { devices })
    });

    type DeviceKey = { deviceKey: string };

    server.get<{ Params: DeviceKey }>('/device/:deviceKey', async (request, reply) => {
        const { deviceKey } = request.params;
        const device = await getDevice(deviceKey);

        return reply.view('views/device', { device });

        async function getDevice(deviceKey: string) {
            const id = calculateDeviceID(deviceKey);
            const qrCode = await qrcode.toDataURL(`${BASE_URL}provenance/${deviceKey}`);
            const $device = await deviceRepo.getDevice(deviceKey);
            if ($device) {
                return {
                    key: deviceKey,
                    id,
                    qrCode,
                    name: $device.name,
                    saved: true
                };
            }

            const records = await recordRepo.getRecords(deviceKey);
            return {
                key: deviceKey,
                id,
                qrCode,
                name: records.findLast(r => r.name)?.name,
                saved: false
            };
        }
    });

    server.get<{ Params: DeviceKey }>('/provenance/:deviceKey', async (request, reply) => {
        const { deviceKey } = request.params;
        const deviceID = calculateDeviceID(deviceKey);
        const reports = await recordRepo.getRecords(deviceKey);
        const deviceName = reports.findLast(r => r.name)?.name ?? "";

        return reply.view('views/provenance', { deviceKey, deviceID, deviceName, reports });
    });

    server.post<{ Params: DeviceKey }>('/provenance/:deviceKey', async (request, reply) => {
        const { deviceKey } = request.params;
        const fields = await getFormFields(request);

        const description = fields.get('description') as string;
        const picture = fields.get('picture') as Attachment | undefined;
        const tagField = fields.get('tags') as string ?? "";
        const tagSet = new Set(tagField.toLowerCase().split(' ').map(t => t.trim()).filter(t => t.length > 0));
        const childField = fields.get('children') as string ?? "";
        const childKeySet = new Set(childField.split(',').map(t => t.trim()).filter(t => t.length > 0));
        const parentKey = fields.get('parent') as string ?? ""; //should only get one key

        const deviceProvenance = await addChildren(deviceKey,childKeySet);

        if (parentKey != "") {
            //check if parent key exi8sts
            const parentRecords = await recordRepo.getRecords(parentKey);
            const parentName = parentRecords.findLast(r => r.name)?.name ?? "";

            if (parentName){
                deviceProvenance.warnings.push("Added a parent to this device");
                //should try to add some boolean that says this device already has a parent?
    
                const parentDeviceChildrenWarnings = await addChildren(parentKey, new Set([deviceKey]));
                console.log("this is the parent device: ", parentDeviceChildrenWarnings);
                await recordRepo.createRecord(parentKey, description, {
                    tags: [...tagSet],
                    attachments: picture ? [picture] : undefined,
                    children_key: [...parentDeviceChildrenWarnings.childKeys],
                    children_name: [...parentDeviceChildrenWarnings.childrenNames],
                    warnings: [...parentDeviceChildrenWarnings.warnings],
                });    
            }
            else{
                deviceProvenance.warnings.push("Parent device does not exist");
            }
        }

        async function addChildren(parentKey: string, childKeySet: Set<string>) {
            const childNameSet = [];
            const warningSet = [];
            for (var childKey of childKeySet.values()) {
                //need to check if device has been added or not
                const childList = await recordRepo.getChildren(parentKey);
                const match = childList.find(({children_key}) => children_key?.includes(childKey));
                const childRecords = await recordRepo.getRecords(childKey);
                
                if (match) {
                    //if already recorded, say "child has been recorded in the past"
                    const creationDate = childRecords.findLast(r => r.createdAt)?.createdAt;
                    childKeySet.delete(childKey);
                    warningSet.push(`Warning: Device with key "${childKey}" was added on ${creationDate}`);
    
                } else {
                    const childName = childRecords.findLast(r => r.name)?.name ?? "";
                    if (childName) { // if the device has not been made, the name is undefined
                        childNameSet.push(childName);
                    } else {
                        childKeySet.delete(childKey);
                        warningSet.push(`Warning: Device with key "${childKey}" does not exist!`);
                    }
                }                      
            }
            return {
                childKeys : childKeySet,
                childrenNames: childNameSet, 
                warnings: warningSet };
        }


        await recordRepo.createRecord(deviceKey, description, {
            tags: [...tagSet],
            attachments: picture ? [picture] : undefined,
            children_key: [...deviceProvenance.childKeys],
            children_name: [...deviceProvenance.childrenNames],
            warnings: [...deviceProvenance.warnings],
        });

        // need to make this so it recalls grandchildren too
        if (tagSet.has("recall")) {
            await recallChildren(deviceKey);
        }


        async function recallChildren(deviceKey: string) {
            const childList = await recordRepo.getChildren(deviceKey);
            // need to obtain each provenance record, then in each key of provenance record
            for (var child of childList) {
                if (child.children_key) {
                    for (var child_key of child.children_key) {
                        await recordRepo.createRecord(child_key, description, {
                            tags: [...tagSet],
                            attachments: picture ? [picture] : undefined,
                        });   
                        await recallChildren(child_key);
                    }
                }
            } 
            return;
        }

        reply.redirect(`/provenance/${deviceKey}`);
    })

    server.get<{ Params: { deviceKey: string, attachmentID: string } }>('/provenance/:deviceKey/attachment/:attachmentID', async (request, reply) => {
        const { deviceKey, attachmentID } = request.params;

        const attachment = await recordRepo.getAttachment(deviceKey, BigInt(attachmentID));
        if (attachment) {
            reply.header('Content-Type', attachment.type);
            reply.send(attachment.data);
        } else {
            reply.status(404).send();
        }
    });

    return server;
}
