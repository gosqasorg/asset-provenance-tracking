export interface Device {
    readonly name: string;
    readonly key: string;
    readonly deviceID: bigint;
    readonly parent_of?: (string | Uint8Array)[];
}

export interface ProvenanceRecord {
    readonly deviceID: bigint;
    readonly name?: string;
    readonly description?: string;
    readonly attachments: readonly Pick<ProvenanceAttachment, 'type' | 'attachmentID'>[];
    readonly tags: readonly string[];
    readonly children_key?: readonly string[];
    readonly children_name?: readonly string[]
    readonly warnings?: readonly string[];
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
    readonly name?: string;
    readonly attachments?: readonly Pick<ProvenanceAttachment, 'type' | 'data'>[];
    readonly tags?: readonly string[];
    readonly children_key?: readonly string[];
    readonly children_name?: readonly string[];
    readonly warnings?: readonly string[];
    readonly createdAt?: Date;
}

export type ProvenanceRecordFactory = (key: string | Uint8Array, description: string, options?: CreateRecordOptions) => Promise<ProvenanceRecord>;

export interface DeviceRepository {
    createDevice(name: string, key?: string | Uint8Array): Promise<Device>;
    getDevice(key: string | Uint8Array): Promise<Device | null>;
    getDevices(): Promise<readonly Device[]>;

    //something like add children
}

export interface ProvenanceRepository {
    createRecord(key: string | Uint8Array, description: string, options?: CreateRecordOptions) : Promise<ProvenanceRecord>;
    getRecords(key: string | Uint8Array): Promise<readonly ProvenanceRecord[]>;
    getChildren(key: string | Uint8Array): Promise<readonly ProvenanceRecord[]>;
    getAttachment(key: string | Uint8Array, attachmentID: bigint): Promise<ProvenanceAttachment | null>;
}
