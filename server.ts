import fastify from 'fastify'
import fastifyView from '@fastify/view'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { Liquid } from 'liquidjs'
import * as qrcode from 'qrcode';
import { DeviceRepository, ProvenanceAttachment, ProvenanceRepository, calculateDeviceID, encodeKey } from './services';
import * as fs from 'fs';
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
        })

        reply.redirect(`/device/${deviceKey}`);
    });

    // This is Rob, who is a noob here (and the architect, go figure...)
    // attempting to produce a batch of keys at once.
    // This can be tested with:
    // curl -H "Content-Type: application/x-www-form-urlencoded" -X POST http://127.0.0.1:8000/manykeys/spudboy/3
    // And will return something like:
    // {"keys":["6bXXFunVNY9gtsY47n1tgQ","2UsUGTNYNFWA4jsdWBFxgf","LyGoHQ7wYr9XG1oWMkgXCx"]}
    // ...which creates 3 records and keys with the name "spudboy".
    type NumberParam = { n: number,
                         name:   string };
    server.post<{ Params: NumberParam }>('/manykeys/:name/:n', async (request, reply) => {
        const { n, name } = request.params;
        const description = "";

        let keys: string[] = [];
        for (let i = 0; i < n; i++) {
            const deviceKey = encodeKey(crypto.randomBytes(16));
            keys.push(deviceKey);
            await recordRepo.createRecord(deviceKey, description, {
                name,
                tags: ['creation'],
                attachments: undefined,
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
    });
    // An attempt by Rob to write a utility routine that will download a QR code
    // as a separate file for batch operations, test with:
    // curl -H "Content-Type: application/x-www-form-urlencoded" -X GET http://127.0.0.1:8000/qrcode/6bXXFunVNY9gtsY47n1tgQc
    // This has
    server.get<{ Params: DeviceKey }>('/qrcode/:deviceKey', async (request, reply) => {
        const { deviceKey } = request.params;
        const device = await getDevice(deviceKey);
        const $device = await deviceRepo.getDevice(deviceKey);
        if (device) {
            request.log.info(deviceKey + ' $device found');

            const filePath = "./" + deviceKey + ".png";
            const writableStream = fs.createWriteStream(filePath);
            qrcode.toFileStream(writableStream, `${BASE_URL}provenance/${deviceKey}`,
                {
                    type: 'png'
            });
          const stream = fs.createReadStream(filePath);
            reply.header('Content-Type', 'image/png').send(stream);
        } else {
            request.log.info(deviceKey + ' $device not found');
            reply.code(404);
        }
      return reply;

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
