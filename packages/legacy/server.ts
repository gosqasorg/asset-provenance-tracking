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
        root: path.join(__dirname, '..'),
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
        const hasReportingKey = fields.get('reporting-key');
        const numChildren = fields.get('children-keys') as string;

        const deviceKey = encodeKey(crypto.randomBytes(16));
        const childrenDeviceList = [];
        const childrenDeviceName = [];
        
        if (saveDeviceKey) {
            await deviceRepo.createDevice(name, deviceKey);
        }
        if (hasReportingKey == "true") {
            const reportingKey = encodeKey(crypto.randomBytes(16)); //reporting key = public key
            // const reportingDescription = "reporting key";
            await recordRepo.createRecord(reportingKey, description, {
            name,
            tags: ['creation', 'reportingkey'],
            attachments: picture ? [picture] : undefined,
            children_key: undefined,
            children_name: undefined,
            isReportingKey: true},
            )

            childrenDeviceList.push(reportingKey);
            childrenDeviceName.push(name);
            
        }

        if (numChildren) {
            for (let i = 0; i < Number(numChildren); i++) {
                const childKey = encodeKey(crypto.randomBytes(16)); //reporting key = public key
                const childName = name + " #" + String(i + 1);
                await recordRepo.createRecord(childKey, description, {
                name: childName,
                tags: ['creation'],
                attachments: picture ? [picture] : undefined,
                children_key: undefined,
                children_name: undefined,
                isReportingKey: false},
                )

                childrenDeviceList.push(childKey);
                childrenDeviceName.push(childName);

            }

        }
        
        await recordRepo.createRecord(deviceKey, description, {
            name,
            tags: ['creation'],
            attachments: picture ? [picture] : undefined,
            children_key: [...childrenDeviceList],
            children_name: [...childrenDeviceName],
            isReportingKey: false},
            )
        

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
            const records = await recordRepo.getRecords(deviceKey);

            const childrenList = records.findLast(r=>r.children_key)?.children_key ?? [];
            const childrenKeyList = [];
            const childrenNameList = [];
            const childrenQrCode = [];
            var reportingKey = undefined;
            var reportQrCode = undefined;

            for (var childKey of childrenList) {
                const childQrCode = await qrcode.toDataURL(`${BASE_URL}provenance/${childKey}`);

                const childRecords = await recordRepo.getRecords(childKey);
                const childName = childRecords.findLast(r=>r.name)?.name;
                const isReportingKey = childRecords.findLast(r=>r.isReportingKey)?.isReportingKey;
                if (isReportingKey) {
                    reportingKey = childKey;
                } else {
                    childrenKeyList.push(childKey);
                    childrenQrCode.push(childQrCode);
                    childrenNameList.push(childName);
                }
            }

            if (reportingKey) {
                reportQrCode = await qrcode.toDataURL(`${BASE_URL}provenance/${reportingKey}`);
            } 

            if ($device) {
                return {
                    key: deviceKey,
                    id,
                    qrCode,
                    name: $device.name,
                    saved: true,
                    reportingKey,
                    reportQrCode,
                    childrenKeyList,
                    childrenQrCode: childrenQrCode,
                    childrenName: childrenNameList
                };
            }

            // const reportingKey = records.findLast(r => r.reportingKey)?.reportingKey ?? "";
            // const reportQrCode = await qrcode.toDataURL(`${BASE_URL}provenance/${reportingKey}`);
            console.log("this is what childrenKeyList is ", childrenKeyList);
            return {
                key: deviceKey,
                id,
                qrCode,
                name: records.findLast(r => r.name)?.name,
                saved: false,
                reportingKey,
                reportQrCode,
                childrenKeyList,
                childrenQrCode: childrenQrCode,
                childrenName: childrenNameList

            
            };
        }
    });

    server.get<{ Params: DeviceKey }>('/provenance/:deviceKey', async (request, reply) => {
        const { deviceKey } = request.params;
        const deviceID = calculateDeviceID(deviceKey);
        const reportsReport = await recordRepo.getRecords(deviceKey);
        const deviceName = reportsReport.findLast(r => r.name)?.name ?? "";
        const isReportingKey = reportsReport.findLast(r => r.isReportingKey)?.isReportingKey;
        var reports = reportsReport

        //if device name is "" then device does not exist, this perhaps might be a reporting key
        // pass reportingKey, original device ID, original device name, original records

        return reply.view('views/provenance', { deviceKey, deviceID, deviceName, isReportingKey, reports });
    });

    server.post<{ Params: DeviceKey }>('/provenance/:deviceKey', async (request, reply) => {
        const { deviceKey } = request.params;
        const fields = await getFormFields(request);
        
        var reports = await recordRepo.getRecords(deviceKey);
        const isReportingKey = reports.findLast(r => r.isReportingKey)?.isReportingKey;
        
        
        const description = fields.get('description') as string;
        const picture = fields.get('picture') as Attachment | undefined;
        const tagField = fields.get('tags') as string ?? "";
        const tagSet = new Set(tagField.toLowerCase().split(' ').map(t => t.trim()).filter(t => t.length > 0));
        const childField = fields.get('children') as string ?? "";
        const childKeySet = new Set(childField.split(',').map(t => t.trim()).filter(t => t.length > 0));
        const containerKey = fields.get('container') as string ?? ""; //should only get one key

        var deviceProvenance;
        var key;
        var isRecall = false;
        
        // always use the public key to add provenance children etc
        // if it is not reporting key (meaning it is private key) get the reporting key from it
        // if (!isReportingKey) { 
        //     const reportingKey = reports.findLast(r => r.reportingKey)?.reportingKey ?? "";
        //     key = reportingKey;
        //     reports = await recordRepo.getRecords(key);
            
        // } else { key = deviceKey; }
        
        deviceProvenance = await addChildren(deviceKey,childKeySet);
        
        if (tagSet.has("recall") && (!isReportingKey)) {
            console.log("current key is not reporting, meaning its private")
            console.log("there is recall and this is a private key");
            await recallChildren(deviceKey);
            isRecall = true;
        } 

        // user has entered a container key; meaning that this device is stored 
        // inside this container
        if (containerKey != "") {

            if (reports.find(({warnings}) => warnings?.includes("Added a container to this device"))) {
                deviceProvenance.warnings.push("Error. This device already has a container.")
            }
            else {
                //check if container key exists
                const containerRecords = await recordRepo.getRecords(containerKey);
                const containerName = containerRecords.findLast(r => r.name)?.name ?? "";

                if (containerName){ //container device exists
                    deviceProvenance.warnings.push("Added a container to this device");
                    //should try to add some boolean that says this device already has a container?
        
                    const containerDeviceChildrenWarnings = await addChildren(containerKey, new Set([deviceKey]));
                    console.log("this is the container device: ", containerDeviceChildrenWarnings);
                    await recordRepo.createRecord(containerKey, description, {
                        tags: [...tagSet],
                        attachments: picture ? [picture] : undefined,
                        children_key: [...containerDeviceChildrenWarnings.childKeys],
                        children_name: [...containerDeviceChildrenWarnings.childrenNames],
                        warnings: [...containerDeviceChildrenWarnings.warnings],
                    });    
                }
                else{
                    deviceProvenance.warnings.push("container device does not exist");
                }
            }

        }
        
        await recordRepo.createRecord(deviceKey, description, {
            tags: [...tagSet],
            attachments: picture ? [picture] : undefined,
            children_key: [...deviceProvenance.childKeys],
            children_name: [...deviceProvenance.childrenNames],
            warnings: [...deviceProvenance.warnings],
            isRecall: isRecall,
        });





        async function addChildren(containerKey: string, childKeySet: Set<string>) {
            const childNameSet = [];
            const warningSet = [];
            for (var childKey of childKeySet.values()) {
                //need to check if device has been added or not
                const childList = await recordRepo.getChildren(containerKey);
                const childRecords = await recordRepo.getRecords(childKey);
                const isChildReportingKey = childRecords.findLast(r => r.isReportingKey)?.isReportingKey;
                
                // if this is child's reporting key, then make it invalid
                if (isChildReportingKey) {
                    childKeySet.delete(childKey);
                    warningSet.push(`Warning: Device with key "${childKey}" not valid`);
                } else { //if this is not a reporting key, proceed to add

                     const match = childList.find(({children_key}) => children_key?.includes(childKey));
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
            }
            return {
                childKeys : childKeySet,
                childrenNames: childNameSet, 
                warnings: warningSet };
        }




        async function recallChildren(deviceKey: string) {
            const childList = await recordRepo.getChildren(deviceKey);
            // need to obtain each provenance record, then in each key of provenance record
            const onlyChildKeys = [];
            for (var child of childList) { 
                if (child.children_key) {
                    for (var child_key of child.children_key) { //for every child, get their key
                        onlyChildKeys.push(child_key);
                        console.log("child key is ", child_key)
                        await recordRepo.createRecord(child_key, description, {
                            tags: [...tagSet],
                            attachments: picture ? [picture] : undefined,
                            isRecall: true,
                        });   
                        console.log("record created");
                        await recallChildren(child_key);
                    }
                }
            } 
            const json = JSON.stringify(onlyChildKeys);
            console.log("json file of children keys ", JSON.parse(json.toString()));
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
