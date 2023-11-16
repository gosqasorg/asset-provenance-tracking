import os from 'os';
import path from 'node:path';

import { Sequelize } from 'sequelize';
import { createFastifyServer } from './server';
import { createSequelizeReposities } from './services/sequelizeRepo';

const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;

async function getReposities() {
    const sequelize = process.env.DATABASE_URL
        ? new Sequelize(process.env.DATABASE_URL, {
            dialectOptions: {
                ssl: { rejectUnauthorized: false }
            }
        })
        : new Sequelize({
            dialect: 'sqlite',
            storage: path.join(__dirname, '..', 'database.sqlite'),
        })
    return await createSequelizeReposities(sequelize);
}

async function main() {
    const { devices, provenance } = await getReposities();
    const server = await createFastifyServer(devices, provenance);

    server.listen({ port, host: '0.0.0.0' }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        const interfaces = Object.entries(os.networkInterfaces())
            .flatMap(([key, value]) => (value ?? []).map(v => ({ name: key, ...v })))
            .filter(v => v.family === 'IPv4')
            .map(v => ({ name: v.name, address: v.address }))

        for (const i of interfaces) {
            console.log(`\x1b[32m[server]: ${i.name} Server is running at \x1b[33mhttp://${i.address}:${port}\x1b[0m`);
        }
    });
}

main();
