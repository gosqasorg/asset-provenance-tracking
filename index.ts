import express, { Express, Request, Response } from 'express';
import * as BP from 'body-parser'
import dotenv from 'dotenv';
import { v1 as uuidV1, parse } from 'uuid';
import * as crypto from 'crypto';
import { DataTypes, Model, Sequelize } from 'sequelize'
import { assert, log } from 'console';
import { create } from 'domain';

dotenv.config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
})

class Device extends Model {
    declare key: string;
    declare description: string;
}

class Assertion extends Model {
    declare deviceId: string;
    declare salt: string;
    declare assertion: string;
    declare createdAt: Date;
}

Device.init({
    key: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    }
}, { sequelize });

Assertion.init({
    deviceId: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    salt: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    assertion: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    indexes: [{
        unique: false,
        fields: ['deviceId']
    }],
    sequelize
});

const app: Express = express();
const port = process.env.PORT;
app.set('view engine', 'pug');
app.use(BP.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.render('index');
});

app.get('/devices', async (req: Request, res: Response) => {
    const devices = await Device.findAll();
    res.render('devices', { devices });
});

app.get('/devices/new', async (req: Request, res: Response) => {
    res.render('new-device');
});

app.post('/devices/new', async (req: Request, res: Response) => {
    const { description } = req.body;
    if (!description || description.length === 0) {
        res.redirect('/devices/new');
    }

    const key = crypto.randomBytes(32);
    const deviceId = crypto.createHash('sha256').update(key).digest();

    const $key  = key.toString('hex')
    const $deviceId = deviceId.toString('hex');
    
    await Device.create({ key: $key, description });
    await createAssertion($deviceId, $key, `${description} device created`);

    res.redirect('/devices');
});

app.get('/assertions', async (req: Request, res: Response) => {
    const deviceId = req.query.deviceId as string;
    const error = req.query.error as string;
    res.render('assertions', { assertions: [], error });
})

app.post('/assertions', async (req: Request, res: Response) => {
    const { deviceKey: $key } = req.body;

    const key = Buffer.from($key, 'hex');
    const deviceId = crypto.createHash('sha256').update(key).digest();
    const $deviceId = deviceId.toString('hex');

    const $assertions = await Assertion.findAll({ where: { deviceId: $deviceId } })
    const assertions = decryptAssertions($key, $assertions).filter(a => !!a);
    const error = assertions.length !== $assertions.length ? 'Invalid key' : undefined;

    res.render('assertions', { deviceId, assertions, error });
});

app.get('/assertions/new', async (req: Request, res: Response) => {
    const deviceId = req.query.deviceId as string;
    res.render('new-assertion', { deviceId });
})

app.post('/assertions/new', async (req: Request, res: Response) => {
    const { deviceKey:$key, assertion } = req.body;
    const key = Buffer.from($key, 'hex');
    const deviceId = crypto.createHash('sha256').update(key).digest();
    const $deviceId = deviceId.toString('hex');

    const valid = await validateKey($deviceId, $key);
    if (!valid) {
        res.render('new-assertion', { deviceId, assertion, error: 'Invalid key' });
    } else {
        await createAssertion($deviceId, $key, assertion);
        res.redirect(`/assertions?deviceId=${deviceId}`);
    }
});

async function main() {
    await sequelize.sync();
    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
}

main();

async function createAssertion(deviceId: string, key: string, assertion: string) {
    console.log('createAssertion', deviceId, key)

    const $key = Buffer.from(key, 'hex');
    const iv = crypto.randomBytes(16);
    const crypter = crypto.createCipheriv('aes-256-cbc', $key, iv);
    console.log('createAssertopm', deviceId, key, iv.toString('hex'));

    const msg = Buffer.from(assertion, 'utf8');
    const $1 = crypter.update(msg);
    const $2 = crypter.final();
    const $assertion = Buffer.concat([$1, $2]);

    await Assertion.create({ deviceId, salt: iv.toString('hex'), assertion: $assertion.toString('hex') });
}

function decryptAssertions(key: string, assertions: readonly Assertion[]) {
    const $key = Buffer.from(key, 'hex');
    return assertions.map(a => {
        const assertion = decryptAssertion($key, a);
        return assertion ? { assertion, createdAt: a.createdAt } : undefined;
    });
}

function decryptAssertion(key: Buffer, a: Assertion) {
    try {
        const $iv = Buffer.from(a.salt, 'hex');
        const $assertion = Buffer.from(a.assertion, 'hex');
        const decrypter = crypto.createDecipheriv('aes-256-cbc', key, $iv);
        const $1 = decrypter.update($assertion);
        const $2 = decrypter.final();
        return Buffer.concat([$1, $2]).toString('utf8');
    } catch (e) {
        return undefined;
    }
}

async function validateKey(deviceId: string, key: string) {
    const assertion = await Assertion.findOne({ where: { deviceId } });
    if (!assertion) { return false; }    
    const $key = Buffer.from(key, 'hex');
    return decryptAssertion($key, assertion) !== undefined;
}