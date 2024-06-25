// sequelizeRepo.ts -- related to provenance record model 
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


import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ModelCtor, ModelStatic, Sequelize, Transaction } from "sequelize";
import { CreateRecordOptions, Device, DeviceRepository, ProvenanceAttachment, ProvenanceRecord, ProvenanceRecordFactory, ProvenanceRepository } from "./types";
import { calculateDeviceID, decodeKey, encodeKey, fnv1 } from "./common";
import * as crypto from 'crypto';
// import base58 from 'bs58';
import { report } from "process";

interface DeviceModel extends Model<InferAttributes<DeviceModel>, InferCreationAttributes<DeviceModel>> {
    id: CreationOptional<number>;
    name: string;
    key: string;
}

interface ProvenanceRecordModel extends Model<InferAttributes<ProvenanceRecordModel>, InferCreationAttributes<ProvenanceRecordModel>> {
    id: CreationOptional<number>;
    deviceID: string;
    salt: string;
    data: Uint8Array; // contains encrypted JSON with description, attachements info and tags
    createdAt: CreationOptional<Date>;
}

interface ProvenanceAttachmentModel extends Model<InferAttributes<ProvenanceAttachmentModel>, InferCreationAttributes<ProvenanceAttachmentModel>> {
    id: CreationOptional<number>;
    attachmentID: string;
    salt: string;
    mimetype: string;
    data: Uint8Array;
    createdAt: CreationOptional<Date>;
}

function createDeviceRepo(deviceModel: ModelStatic<DeviceModel>) {
    async function createDevice(name: string, key?: string | Uint8Array | undefined): Promise<Device> {
        key = key
            ? typeof key === 'string' ? decodeKey(key) : key
            : crypto.randomBytes(16);        

        
        const device = await deviceModel.create({ name, key: encodeKey(key) });
        return mapDevice(device);
    }

    async function getDevice(key: string | Uint8Array): Promise<Device | null> {
        key = typeof key === 'string' ? decodeKey(key) : key;
        const device = await deviceModel.findOne({ where: { key: encodeKey(key) } });
        return device ? mapDevice(device) : null;
    }


    async function getDevices(): Promise<readonly Device[]> {
        const devices = await deviceModel.findAll();
        return devices.map(mapDevice);
    }

    function mapDevice(device: DeviceModel): Device {
        const deviceID = calculateDeviceID(device.key);
        return { deviceID, key: device.key, name: device.name };
    }


    return { createDevice, getDevice, getDevices};
}

type ProvenanceRecordJson = Omit<ProvenanceRecord, 'deviceID' | 'createdAt'>;

function createProvenanceRepo(
    sequelize: Sequelize,
    recordModel: ModelStatic<ProvenanceRecordModel>,
    attachmentModel: ModelStatic<ProvenanceAttachmentModel>,
): ProvenanceRepository {

    async function createRecord(key: string | Uint8Array, description: string,   options?: CreateRecordOptions, reportingKey?: string |  undefined) : Promise<ProvenanceRecord> {
        const $key = typeof key === 'string' ? decodeKey(key) : key;
        const deviceID = calculateDeviceID(key);
    
        const attachments = (options?.attachments ?? []).map(a => {
            const attachmentID = fnv1(a.data);
            const {salt, encryptedData } = encrypt($key, a.data);
            return {...a, salt, attachmentID, encryptedData}
        })

        const record: ProvenanceRecordJson = {
            description,
            name: options?.name,
            tags: options?.tags ?? [],
            children_key: options?.children_key ?? [],
            children_name: options?.children_name ?? [],
            warnings: options?.warnings ?? [],
            attachments: attachments.map(a => ({ type: a.type, attachmentID: a.attachmentID })),
            reportingKey: reportingKey,
            isReportingKey: options?.isReportingKey,
            isRecall: options?.isRecall,
        }

        const json = JSON.stringify(record, (k, v) => k === 'attachmentID' ? v.toString() : v);
        const data = Buffer.from(json, 'utf8');
        const {salt, encryptedData } = encrypt($key, data);

        const createdAt = await sequelize.transaction(async tx => {
            const record = await recordModel.create({ data: encryptedData, deviceID: deviceID.toString(16), salt}, { transaction: tx });
            for (const a of attachments) {
                await attachmentModel.create(
                    {
                        attachmentID: a.attachmentID.toString(16),
                        data: a.encryptedData,
                        mimetype: a.type,
                        salt: a.salt,
                        createdAt: record.createdAt 
                    }, { transaction: tx });
            }
            return record.createdAt;
        })

        return {
            deviceID,
            description,
            name: options?.name,
            tags: options?.tags ?? [],
            children_key: options?.children_key ?? [],
            children_name: options?.children_name ?? [],
            warnings: options?.warnings ?? [],
            attachments: attachments.map(a => ({ type: a.type, attachmentID: a.attachmentID })),
            createdAt
        }
    }

    function encrypt(key: Uint8Array, data: Uint8Array) {
        const salt = crypto.randomBytes(16);
        const crypter = crypto.createCipheriv('aes-128-cbc', key, salt);
        const encryptedData = Buffer.concat([crypter.update(data),  crypter.final()]);
        return { salt: salt.toString('hex'), encryptedData };
    }

    function decrypt(key: Uint8Array, salt: string, encryptedData: Uint8Array) {
        const $salt = Buffer.from(salt, 'hex');
        const crypter = crypto.createDecipheriv('aes-128-cbc', key, $salt);
        return Buffer.concat([crypter.update(encryptedData), crypter.final()]);
    }

    async function getRecords(key: string | Uint8Array): Promise<readonly ProvenanceRecord[]> {
        const $key = typeof key === 'string' ? decodeKey(key) : key;
        const deviceID = calculateDeviceID(key);
        const records = await recordModel.findAll({
            order: [['createdAt', 'DESC']],
            where: { deviceID: deviceID.toString(16) }
        });

        
        return records.map(record => {
            const data = decrypt($key, record.salt, record.data);
            const $record = JSON.parse(data.toString('utf8'), (k,v) => k === 'attachmentID' ? BigInt(v) : v) as ProvenanceRecordJson;
            // console.log("this is data: ", data);
            // if (data) {
            //     console.log("record is not empty for this ID: ", deviceID.toString(16));
            // } else {
            //     console.log("record is empty for this device ID: ", deviceID.toString(16));
            // }
            return <ProvenanceRecord>{
                deviceID,
                description: $record.description,
                name: $record.name,
                tags: $record.tags,
                attachments: $record.attachments,
                children_key: $record.children_key,
                children_name: $record.children_name,
                warnings: $record.warnings,
                createdAt: record.createdAt,
                reportingKey: $record.reportingKey,
                isReportingKey: $record.isReportingKey,
                isRecall: $record.isRecall
            }
        });

    }

    async function getChildren(key: string | Uint8Array): Promise<readonly ProvenanceRecord[]> {
        const $key = typeof key === 'string' ? decodeKey(key) : key;
        const deviceID = calculateDeviceID(key);
        const records = await recordModel.findAll({
            order: [['createdAt', 'DESC']],
            where: { deviceID: deviceID.toString(16) }
        });
        return records.map(record => {
            const data = decrypt($key, record.salt, record.data);
            const $record = JSON.parse(data.toString('utf8')) as ProvenanceRecordJson;
            return <ProvenanceRecord>{
                children_key: $record.children_key,
                children_name: $record.children_name,
                createdAt: record.createdAt,
            }
        });

    }

    async function getAttachment(key: string | Uint8Array, attachmentID: bigint): Promise<ProvenanceAttachment | null> {
        const $key = typeof key === 'string' ? decodeKey(key) : key;
        const deviceID = calculateDeviceID(key);
        const attachment = await attachmentModel.findOne({ where: { attachmentID: attachmentID.toString(16) } });
        if (!attachment) return null;
        const data = decrypt($key, attachment.salt, attachment.data);
        return {
            deviceID,
            attachmentID,
            type: attachment.mimetype,
            data,
            createdAt: attachment.createdAt
        }
    }



    return { createRecord, getRecords, getAttachment, getChildren };
}

export async function createSequelizeReposities(sequelize: Sequelize): Promise<{ devices: DeviceRepository, provenance: ProvenanceRepository }> {
    const device = sequelize.define<DeviceModel>('Device', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        key: {
            type: DataTypes.STRING(64).BINARY,
            allowNull: false,
            unique: true
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['key']
            }
        ]
    });

    const provenanceRecord = sequelize.define<ProvenanceRecordModel>('ProvenanceRecord', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        deviceID: {
            type: DataTypes.STRING(64).BINARY,
            allowNull: false,
        },
        salt: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        data: {
            type: DataTypes.BLOB,
            allowNull: false
        },
        createdAt: DataTypes.DATE,
    }, {
        indexes: [
            {
                fields: ['deviceID']
            }
        ],
    });

    const provenanceAttachment = sequelize.define<ProvenanceAttachmentModel>('ProvenanceAttachment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        attachmentID: {
            type: DataTypes.STRING(64).BINARY,
            allowNull: false,
            unique: true
        },
        salt: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        mimetype: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        data: {
            type: DataTypes.BLOB,
            allowNull: false
        },
        createdAt: DataTypes.DATE,
    }, {
        indexes: [
            {
                fields: ['attachmentID']
            }
        ],
    });

    await sequelize.sync();

    const devices = createDeviceRepo(device);
    const provenance = createProvenanceRepo(sequelize, provenanceRecord, provenanceAttachment);
    return { devices, provenance}
}
