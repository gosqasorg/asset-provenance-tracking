import fastify from 'fastify'
import fastifyView from '@fastify/view'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { Liquid } from 'liquidjs'
import * as qrcode from 'qrcode';
import { DeviceRepository, ProvenanceAttachment, ProvenanceRepository, calculateDeviceID } from './services';
import path from 'path'
import os from 'os'
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
        }  else {
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
        engine: { liquid:engine },
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

    server.get('/', async (request, reply) => {
        return reply.view('views/index', {})
    });

    server.get('/info', async (request, reply) => {
        return reply.redirect("https://github.com/gosqasorg/home");
    });

    server.get('/devices', async (request, reply) => {
        const devices = await deviceRepo.getDevices();
        return reply.view('views/devices', { devices })
    });

    type DeviceKey = { deviceKey: string };

    server.post('/devices', async (request, reply) => {
        const fields = await getFormFields(request);

        const name = fields.get('name') as string;
        const description = fields.get('description') as string;
        const picture = fields.get('picture') as Attachment | undefined;

        const device = await deviceRepo.createDevice(name);
        const _record = await recordRepo.createRecord(device.key, description, {
            name,
            tags: ['creation'],
            attachments: picture ? [picture] : undefined,
        })
        reply.redirect(`/device/${device.key}`);
    });

    server.get<{ Params: DeviceKey }>('/device/:deviceKey', async (request, reply) => {
        const { deviceKey } = request.params;
        const device = await deviceRepo.getDevice(deviceKey);
        if (!device) throw new Error('Device not found');
        const dataURL = await qrcode.toDataURL(`${BASE_URL}provenance/${device.key}`);
        return reply.view('views/device', { device, dataURL });
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

        await recordRepo.createRecord(deviceKey, description, {
            tags: [...tagSet],
            attachments: picture ? [picture] : undefined,
        });

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
