// app.ts -- App 
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
