import { calculateDeviceID, fnv1 } from "./common";
import { CreateReportOptions, Device, DeviceRepository, ProvenanceAttachment, ProvenanceReport, ProvenanceReportFactory, ProvenanceRepository } from "./types";
import * as crypto from 'crypto';

class Repository implements DeviceRepository, ProvenanceRepository {
    private devices: Device[] = [];
    private attachments: ProvenanceAttachment[] = [];
    private reports: ProvenanceReport[] = [];

    async createDevice(name: string, factory: ProvenanceReportFactory): Promise<Device> {
        const key = crypto.randomBytes(32);
        const deviceID = calculateDeviceID(key);
        const device = { name, key: key.toString('hex'), deviceID };

        this.devices.push(device);
        const report = await factory(key, `created ${name}`, { tags: ['creation'] });
        return device;
    }

    getDevice(key: string | Uint8Array): Promise<Device | null> {
        const deviceID = calculateDeviceID(key);
        const device = this.devices.find(device => device.deviceID === deviceID);
        return Promise.resolve(device ?? null);
    }

    getDevices(): Promise<readonly Device[]> {
        return Promise.resolve(this.devices);
    }

    get createReport(): ProvenanceReportFactory {
        return this.$createReport.bind(this);
    }

    private $createReport(key: string | Uint8Array, contents: string, options?: CreateReportOptions): Promise<ProvenanceReport> {
        const deviceID = calculateDeviceID(key);
        const createdAt = options?.createdAt ?? new Date();
        const attachments = options?.attachments?.map(({ type, data }) => {
            const attachmentID = fnv1(data);
            return <ProvenanceAttachment>{ deviceID, attachmentID, type, data, createdAt };
        }) ?? [];
        const tags = options?.tags ?? [];

        const report = <ProvenanceReport>{ deviceID, contents, attachments, tags, createdAt };
        this.reports.push(report);
        this.attachments.push(...attachments);

        return Promise.resolve(report);
    }

    getReports(key: string | Uint8Array): Promise<readonly ProvenanceReport[]> {
        const deviceID = calculateDeviceID(key);
        return Promise.resolve(this.reports.filter(report => report.deviceID === deviceID));
    }

    getAttachment(key: string | Uint8Array, attachmentID: bigint): Promise<readonly ProvenanceAttachment[]> {
        const deviceID = calculateDeviceID(key);
        return Promise.resolve(this.attachments.filter(attachment => attachment.deviceID === deviceID && attachment.attachmentID === attachmentID));
    }
}

export function createMemoryRepository(): DeviceRepository & ProvenanceRepository {
    return new Repository();
}

