import { calculateDeviceID } from "./common";
import { Device, DeviceRepository as IDeviceRepository, ProvenanceAttachment, ProvenanceReport, ProvenanceReportFactory, ProvenanceRepository } from "./types";
import * as crypto from 'crypto';


class DeviceRepository implements IDeviceRepository {

    private devices: Device[] = [];
    

    async createDevice(name: string, factory: ProvenanceReportFactory): Promise<Device> {
        const key = crypto.randomBytes(32);
        const deviceID = calculateDeviceID(key);
        const device = { name, key: key.toString('hex'), deviceID };

        this.devices.push(device);
        const report = await factory(key, 'created device', { tags: ['device'] });
        return device;
    }

    getDevice(key: string | Uint8Array): Promise<Device | null> {
        key = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
        const deviceID = calculateDeviceID(key);
        const device = this.devices.find(device => device.deviceID === deviceID);
        return Promise.resolve(device || null);
    }

    getDevices(): Promise<readonly Device[]> {
        return Promise.resolve(this.devices);
    }
}

export function createDeviceRepository(): IDeviceRepository {
    return new DeviceRepository();
}

