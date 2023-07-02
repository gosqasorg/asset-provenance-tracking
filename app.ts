import os from 'os';
import dotenv from 'dotenv';

import { Sequelize } from 'sequelize';
import { createMemoryRepositories } from './services';
import { createFastifyServer } from './server';
import { createSequelizeReposities } from './services/sequelizeRepo';

dotenv.config();
const port = process.env.PORT ? parseInt(process.env.PORT) : undefined;

async function main() {

    // const sequelize = new Sequelize({
    //     dialect: 'sqlite',
    //     storage: './database.sqlite',
    // })

    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: 'ec2-54-156-185-205.compute-1.amazonaws.com',
        database: 'dflanf0ljt49a1',
        username: 'mhlziffxlpoojm',
        password: '38a573a03eec55a57a79387af29906de54aa7db1e5794701253df1c8bad2aa37',
        port: 5432,
        dialectOptions: {
            ssl: { rejectUnauthorized: false }
        }
    });

    // const { devices, provenance } = createMemoryRepositories();
    const { devices, provenance } = await createSequelizeReposities(sequelize);
    const server = await createFastifyServer(devices, provenance);

    server.listen({ port: port ?? 3000, host: '0.0.0.0' }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        const interfaces = Object.entries(os.networkInterfaces())
            .flatMap(([key, value]) => (value ?? []).map(v => ({ name: key, ...v })))
            .filter(v => v.family === 'IPv4')
            .map(v => ({ name: v.name, address: v.address }))

        // console.log(`[server]: Server is running at ${address}`);
        for (const i of interfaces) {
            console.log(`\x1b[32m[server]: ${i.name} Server is running at \x1b[33mhttp://${i.address}:${port}\x1b[0m`);
        }
    });
}

main();
