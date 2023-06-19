export interface Device {
    readonly name: string;
    readonly key: string;
    readonly deviceID: bigint;
}

export interface ProvenanceReport {
    readonly deviceID: bigint;
    readonly contents: string;
    readonly attachments: readonly Pick<ProvenanceAttachment, 'type' | 'attachmentID'>[];
    readonly tags: readonly string[];
    readonly createdAt: Date;
}

export interface ProvenanceAttachment {
    readonly deviceID: bigint;
    readonly attachmentID: bigint;
    readonly type: string;
    readonly data: Uint8Array;
    readonly createdAt: Date;
}

export interface CreateReportOptions {
    readonly attachments?: readonly Pick<ProvenanceAttachment, 'type' | 'data'>[];
    readonly tags?: readonly string[];
    readonly createdAt?: Date;
}

export type ProvenanceReportFactory = (key: string | Uint8Array, contents: string, options?: CreateReportOptions) => Promise<ProvenanceReport>;

export interface DeviceRepository {
    createDevice(name: string, factory: ProvenanceReportFactory): Promise<Device>;
    getDevice(key: string | Uint8Array): Promise<Device | null>;
    getDevices(): Promise<readonly Device[]>;
}

export interface ProvenanceRepository {
    readonly createReport: ProvenanceReportFactory;
    getReports(key: string | Uint8Array): Promise<readonly ProvenanceReport[]>;
    getAttachment(key: string | Uint8Array, attachmentID: bigint): Promise<readonly ProvenanceAttachment[]>;
}
