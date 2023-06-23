import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, ModelCtor, ModelStatic, Sequelize, Transaction } from "sequelize";
import { CreateRecordOptions, Device, DeviceRepository, ProvenanceAttachment, ProvenanceRecord, ProvenanceRecordFactory, ProvenanceRepository } from "./types";
import { calculateDeviceID, fnv1, fromHex, toHex } from "./common";
import * as crypto from 'crypto';

interface DeviceModel extends Model<InferAttributes<DeviceModel>, InferCreationAttributes<DeviceModel>> {
    id: CreationOptional<number>;
    name: string;
    key: string;
}

interface ProvenanceRecordModel extends Model<InferAttributes<ProvenanceRecordModel>, InferCreationAttributes<ProvenanceRecordModel>> {
    id: CreationOptional<number>;
    deviceID: bigint;
    salt: string;
    data: Uint8Array; // contains encrypted JSON with description, attachements info and tags
    createdAt: CreationOptional<Date>;
}

interface ProvenanceAttachmentModel extends Model<InferAttributes<ProvenanceAttachmentModel>, InferCreationAttributes<ProvenanceAttachmentModel>> {
    id: CreationOptional<number>;
    attachmentID: bigint;
    salt: string;
    mimetype: string;
    data: Uint8Array;
    createdAt: CreationOptional<Date>;
}

function createDeviceRepo(deviceModel: ModelStatic<DeviceModel>) {
    async function createDevice(name: string, factory: ProvenanceRecordFactory, key?: string | Uint8Array | undefined): Promise<Device> {
        key = key
            ? typeof key === 'string' ? fromHex(key) : key
            : crypto.randomBytes(32);

        const device = await deviceModel.create({ name, key: toHex(key) });
        const report = await factory(key, `created ${name}`, { tags: ['creation'] });
        return mapDevice(device);
    }

    async function getDevice(key: string | Uint8Array): Promise<Device | null> {
        key = typeof key === 'string' ? fromHex(key) : key;
        const device = await deviceModel.findOne({ where: { key: toHex(key) } })
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

    return { createDevice, getDevice, getDevices };
}

type ProvenanceRecordJson = Pick<ProvenanceRecord, 'description' | 'attachments' | 'tags'>;

function createProvenanceRepo(
    sequelize: Sequelize,
    recordModel: ModelStatic<ProvenanceRecordModel>,
    attachmentModel: ModelStatic<ProvenanceAttachmentModel>,
): ProvenanceRepository {

    async function createRecord(key: string | Uint8Array, description: string, options?: CreateRecordOptions) : Promise<ProvenanceRecord> {
        key = typeof key === 'string' ? fromHex(key) : key;
        const deviceID = calculateDeviceID(key);

        const attachements = (options?.attachments ?? []).map(a => {
            const salt = crypto.randomBytes(16);
            const attachmentID = fnv1(a.data);
            const crypter = crypto.createCipheriv('aes-256-cbc', key, salt);
            const encryptedData = Buffer.concat([crypter.update(a.data),  crypter.final()]);
            return {...a, salt, attachmentID, encryptedData}
        })

        const record: ProvenanceRecordJson = {
            description,
            tags: options?.tags ?? [],
            attachments: attachements.map(a => ({ type: a.type, attachmentID: a.attachmentID }))
        }

        const json = JSON.stringify(record, (k, v) => k === 'attachmentID' ? v.toString() : v);
        const data = Buffer.from(json, 'utf8');
        const salt = crypto.randomBytes(16);
        const crypter = crypto.createCipheriv('aes-256-cbc', key, salt);
        const encryptedRecord = Buffer.concat([crypter.update(data),  crypter.final()]);

        const createdAt = await sequelize.transaction(async tx => {
            const record = await recordModel.create({ data: encryptedRecord, deviceID, salt: salt.toString('hex') }, { transaction: tx });
            for (const a of attachements) {
                await attachmentModel.create(
                    {
                        attachmentID: a.attachmentID,
                        data: a.encryptedData,
                        mimetype: a.type,
                        salt: a.salt.toString('hex'),
                        createdAt: record.createdAt 
                    }, { transaction: tx });
            }
            return record.createdAt;
        })

        return {
            deviceID,
            description,
            tags: options?.tags ?? [],
            attachments: attachements.map(a => ({ type: a.type, attachmentID: a.attachmentID })),
            createdAt
        }
    }

    function decrypt(key: Uint8Array, salt: string, encryptedData: Uint8Array) {
        const $salt = Buffer.from(salt, 'hex');
        const crypter = crypto.createDecipheriv('aes-256-cbc', key, $salt);
        return Buffer.concat([crypter.update(encryptedData), crypter.final()]);
    }

    async function getRecords(key: string | Uint8Array): Promise<readonly ProvenanceRecord[]> {
        const $key = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
        const deviceID = calculateDeviceID(key);
        const records = await recordModel.findAll({
            order: [['createdAt', 'DESC']],
            where: { deviceID }
        });
        return records.map(record => {
            const data = decrypt($key, record.salt, record.data);
            const $record = JSON.parse(data.toString('utf8'), (k,v) => k === 'attachmentID' ? BigInt(v) : v) as ProvenanceRecordJson;
            return <ProvenanceRecord>{
                deviceID,
                description: $record.description,
                tags: $record.tags,
                attachments: $record.attachments,
                createdAt: record.createdAt
            }
        });
    }

    async function getAttachment(key: string | Uint8Array, attachmentID: bigint): Promise<ProvenanceAttachment | null> {
        const $key = typeof key === 'string' ? Buffer.from(key, 'hex') : key;
        const deviceID = calculateDeviceID(key);
        const attachment = await attachmentModel.findOne({ where: { attachmentID } });
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

    return { createRecord, getRecords, getAttachment };
}

export async function createSequelizeReposities(sequelize: Sequelize): Promise<{ devices: DeviceRepository, provenance: ProvenanceRepository }> {
    const device = sequelize.define<DeviceModel>('Device', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
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
        }
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
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        deviceID: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        salt: {
            type: DataTypes.STRING(32).BINARY,
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
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        attachmentID: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true
        },
        salt: {
            type: DataTypes.STRING(32).BINARY,
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

