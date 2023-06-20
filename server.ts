import fastify from 'fastify'
import fastifyView from '@fastify/view'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart, { Multipart, MultipartFile } from '@fastify/multipart'
import { Liquid } from 'liquidjs'
import * as qrcode from 'qrcode';
import { DeviceRepository, ProvenanceRepository, calculateDeviceID } from './services';
import path from 'path'

export async function createFastifyServer(deviceRepo: DeviceRepository, recordRepo: ProvenanceRepository) {

    await deviceRepo.createDevice('Test Device', recordRepo.createRecord, 'd92da1463cfa83cec946fe6e9d513bdb58aa38749530b0969fa2085d66ee250b');

    // __dirname is the directory of the compiled .js file in the dist directory, 
    // so need to add the '..' to get to the root directory
    const root = path.join(__dirname, '..', 'views')
    const engine = new Liquid({ root });
    const server = fastify({ logger: true })
    server.register(fastifyView, {
        engine: { liquid:engine },
    });
    server.register(fastifyFormbody);
    server.register(fastifyMultipart);

    server.get('/', async (request, reply) => {
        return reply.view('views/index', {})
    });

    server.get('/devices', async (request, reply) => {
        const devices = await deviceRepo.getDevices();
        return reply.view('views/devices', { devices })
    });

    type DeviceKey = { deviceKey: string };

    server.post<{ Body: { deviceName: string } }>('/devices', async (request, reply) => {
        const { deviceName } = request.body;
        const device = await deviceRepo.createDevice(deviceName, recordRepo.createRecord);
        reply.redirect(`/device/${device.key}`);
    });

    server.get<{ Params: DeviceKey }>('/device/:deviceKey([0-9A-Fa-f]{64})', async (request, reply) => {
        const { deviceKey } = request.params;
        const device = await deviceRepo.getDevice(deviceKey);
        if (!device) throw new Error('Device not found');
        const dataURL = await qrcode.toDataURL(`${process.env.BASE_URL}/provenance/${device.deviceID}`);
        return reply.view('views/device', { device, dataURL });
    });

    server.get<{ Params: DeviceKey }>('/provenance/:deviceKey([0-9A-Fa-f]{64})', async (request, reply) => {
        const { deviceKey } = request.params;
        const deviceID = calculateDeviceID(deviceKey);
        const reports = await recordRepo.getRecords(deviceKey);

        return reply.view('views/provenance', { deviceKey, deviceID, reports });
    });

    // server.post<{ Params: DeviceKey, Body: { assertion: string } }>('/provenance/:deviceKey([0-9A-Fa-f]{64})', async (request, reply) => {
    //     const { deviceKey } = request.params;
    //     const { assertion } = request.body;
    //     await recordRepo.createRecord(deviceKey, assertion);
    //     reply.redirect(`/provenance/${deviceKey}`);
    // })

    // server.post<{ Params: DeviceKey }>('/provenance/image/:deviceKey([0-9A-Fa-f]{64})', async (request, reply) => {
    //     const { deviceKey } = request.params;
    //     const file = await request.file();
    //     if (file) {
    //         const data = await file.toBuffer();
    //         await repo.createProvenanceRecord(deviceKey, file.mimetype, data);
    //     }
    //     reply.redirect(`/provenance/${deviceKey}`);
    // });

    return server;
}
