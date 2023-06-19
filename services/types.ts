export interface Device {
    readonly name: string;
    readonly key: string;
    readonly deviceID: bigint;
}

export interface DeviceRepository {
    createDevice(name: string, factory: ProvenanceReportFactory): Promise<Device>;
    getDevice(key: string | Uint8Array): Promise<Device | null>;
    getDevices(): Promise<readonly Device[]>;
}

export interface ProvenanceReport {
    readonly deviceID: bigint;
    readonly contents: string;
    readonly attachments: readonly Pick<ProvenanceAttachment, 'type' | 'reportID'>[];
    readonly tags: readonly string[];
    readonly createdAt: Date;
}

export interface ProvenanceAttachment {
    readonly deviceID: bigint;
    readonly reportID: bigint;
    readonly type: string;
    readonly data: Uint8Array;
    readonly createdAt: Date;
}

export interface CreateReportOptions {
    readonly attachments?: readonly Pick<ProvenanceAttachment, 'type' | 'data'>[];
    readonly tags?: readonly string[]
}

export type ProvenanceReportFactory = (key: string | Uint8Array, contents: string, options?: CreateReportOptions) => Promise<ProvenanceReport>;

export interface ProvenanceRepository {
    createReport: ProvenanceReportFactory;
    getReports(key: string | Uint8Array): Promise<readonly ProvenanceReport[]>;
    getAttachment(key: string | Uint8Array, reportID: bigint): Promise<readonly ProvenanceAttachment[]>;
}















export interface ProvenanceRecord {
    readonly deviceID: bigint;
    readonly type: string;
    readonly data: Uint8Array;
    readonly createdAt: Date;
    readonly dataURI: string;
}




export interface Repository {
    createDevice(name: string): Promise<Device>;
    getDevice(key: string | Uint8Array): Promise<Device | null>;
    getDevices(): Promise<readonly Device[]>;
    createProvenanceRecord(key: string | Uint8Array, type: string, data: Uint8Array): Promise<ProvenanceRecord>;
    getProvenanceRecords(key: string | Uint8Array): Promise<readonly ProvenanceRecord[]>;
}