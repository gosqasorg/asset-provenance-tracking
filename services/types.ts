export interface Device {
    readonly name: string;
    readonly key: string;
    readonly deviceID: bigint;
}

export interface ProvenanceRecord {
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

export interface CreateRecordOptions {
    readonly attachments?: readonly Pick<ProvenanceAttachment, 'type' | 'data'>[];
    readonly tags?: readonly string[];
    readonly createdAt?: Date;
}

export type ProvenanceRecordFactory = (key: string | Uint8Array, contents: string, options?: CreateRecordOptions) => Promise<ProvenanceRecord>;

export interface DeviceRepository {
    createDevice(name: string, factory: ProvenanceRecordFactory, key?: string | Uint8Array): Promise<Device>;
    getDevice(key: string | Uint8Array): Promise<Device | null>;
    getDevices(): Promise<readonly Device[]>;
}

export interface ProvenanceRepository {
    createRecord(key: string | Uint8Array, contents: string, options?: CreateRecordOptions) : Promise<ProvenanceRecord>;
    getRecords(key: string | Uint8Array): Promise<readonly ProvenanceRecord[]>;
    getAttachment(key: string | Uint8Array, attachmentID: bigint): Promise<readonly ProvenanceAttachment[]>;
}
