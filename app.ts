import dotenv from 'dotenv';

import { Sequelize } from 'sequelize';
import { createMemoryRepository } from './services';
import { createFastifyServer } from './server';

dotenv.config();
const port = process.env.PORT ? parseInt(process.env.PORT) : undefined;

async function main() {
    // const sequelize = new Sequelize({
    //     dialect: 'sqlite',
    //     storage: './database.sqlite'
    // })

    // const repo = await createSequelizeRepository(sequelize);

    const repo = createMemoryRepository();
    const server = createFastifyServer(repo, repo);

    server.listen({ port: port ?? 3000 }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`[server]: Server is running at ${address}`);
    });
}

main();
