// types.ts -- interface
// Copyright (C) 2024 GOSQAS Team
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>. 

export interface Device {
    readonly name: string;
    readonly key: string;
    readonly deviceID: bigint;
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
    readonly reportingKey?: string;
    readonly isReportingKey?: boolean;
    readonly isRecall?: boolean;
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
    readonly isReportingKey?: boolean;
    readonly isRecall?: boolean;
    readonly createdAt?: Date;
}

export type ProvenanceRecordFactory = (key: string | Uint8Array, description: string, options?: CreateRecordOptions) => Promise<ProvenanceRecord>;

export interface DeviceRepository {
    createDevice(name: string, key?: string | Uint8Array): Promise<Device>;
    getDevice(key: string | Uint8Array): Promise<Device | null>;
    getDevices(): Promise<readonly Device[]>;

   
}

export interface ProvenanceRepository {
    createRecord(key: string | Uint8Array, description: string, options?: CreateRecordOptions, reportingKey?: string | undefined) : Promise<ProvenanceRecord>;
    getRecords(key: string | Uint8Array): Promise<readonly ProvenanceRecord[]>;
    getChildren(key: string | Uint8Array): Promise<readonly ProvenanceRecord[]>;
    getAttachment(key: string | Uint8Array, attachmentID: bigint): Promise<ProvenanceAttachment | null>;
}
