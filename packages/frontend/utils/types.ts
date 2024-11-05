// types.ts - Defines common application types

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

export type BlobType = 'deviceInitializer' | 'deviceRecord' | '';


export class ProvenanceRecord {
    blobType?: BlobType;
    deviceName?: string;       // User provided name.
    description?: string;      // User provided description.
    tags?: string[];           // Tags are used to categorize records.
    children_key?: string[];   // child_keys would be a better name.
    children_name?: string[];  // Parallel array to children_key.
    hasParent?: boolean;       // This record belongs to a group.
    isReportingKey?: boolean;  // Identifies a record as a reporting key.
    reportingKey?: string ;    // A groups reporting key.
    attachments?: string[];    // Attachments are files that are associated with a record.

    constructor() {
        this.blobType = '';
        this.deviceName = '';
        this.description = '';
        this.tags = [];
        this.children_key = [];
        this.children_name = [];
        this.hasParent = false;
        this.isReportingKey = false;
        this.reportingKey = '';
        this.attachments = [];
    };
    
    static create(name: string, description: string) {
        let record = new ProvenanceRecord();
        record.deviceName = name;
        record.description = description;
    }
}

// export interface ProvenanceRecord {
//     blobType?: BlobType,
//     deviceName``: string,       // User provided name.
//     description: string,      // User provided description.
//     tags: string[],           // Tags are used to categorize records.
//     children_key?: string[],  // child_keys would be a better name.
//     children_name?: string[], // Parallel array to children_key.
//     hasParent?: boolean,      // This record belongs to a group.
//     isReportingKey?: boolean  // Identifies a record as a reporting key.
//     reportingKey?: string     // A groups reporting key.
// }

export interface Provenance {
    record: ProvenanceRecord;
    attachments?: string[]; // TODO: sometimes this is a filename or a File object...
    deviceID?: string;
    timestamp?: number;     // Timestamps are added server-side.
}
