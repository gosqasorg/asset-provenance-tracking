import fastify from 'fastify'
import fastifyView from '@fastify/view'
import fastifyFormbody from '@fastify/formbody'
import fastifyMultipart, { Multipart, MultipartFile } from '@fastify/multipart'
import * as qrcode from 'qrcode';
import { DeviceRepository, ProvenanceRepository, calculateDeviceID } from './services';

export function createFastifyServer(deviceRepo: DeviceRepository, recordRepo: ProvenanceRepository) {

    const server = fastify({ logger: true })
    server.register(fastifyView, {
        engine: { ejs: require('ejs') },
    });
    server.register(fastifyFormbody);
    server.register(fastifyMultipart);

    server.get('/', async (request, reply) => {
        return reply.view('views/index.ejs', {})
    });

    server.get('/devices', async (request, reply) => {
        const devices = await deviceRepo.getDevices();
        return reply.view('views/devices.ejs', { devices })
    });

    type DeviceKey = { deviceKey: string };

    server.post<{ Body: { deviceName: string } }>('/devices', async (request, reply) => {
        const { deviceName } = request.body;
        const device = await deviceRepo.createDevice(deviceName, recordRepo.createReport);
        reply.redirect('/devices');
    });

    server.get<{ Params: DeviceKey }>('/device/:deviceKey([0-9A-Fa-f]{64})', async (request, reply) => {
        const { deviceKey } = request.params;
        const device = await deviceRepo.getDevice(deviceKey);
        if (!device) throw new Error('Device not found');
        const dataURL = await qrcode.toDataURL(`${process.env.BASE_URL}/provenance/${device.deviceID}`);
        return reply.view('views/device.ejs', { device, dataURL });
    });

    server.get<{ Params: DeviceKey }>('/provenance/:deviceKey([0-9A-Fa-f]{64})', async (request, reply) => {
        const { deviceKey } = request.params;
        const deviceID = calculateDeviceID(deviceKey);
        const reports = await recordRepo.getReports(deviceKey);

        return reply.view('views/provenance.ejs', { deviceKey, deviceID, reports });
    });

    server.post<{ Params: DeviceKey, Body: { assertion: string } }>('/provenance/:deviceKey([0-9A-Fa-f]{64})', async (request, reply) => {
        const { deviceKey } = request.params;
        const { assertion } = request.body;
        await recordRepo.createReport(deviceKey, assertion);
        reply.redirect(`/provenance/${deviceKey}`);
    })

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
