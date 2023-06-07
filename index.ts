import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { v1 as uuidV1, parse } from 'uuid';
import * as crypto from 'crypto';
import { DataTypes, Model, Sequelize } from 'sequelize'

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
})

// const Device  = sequelize.define('Device', {
//   deviceId: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   key: {
//     type: DataTypes.STRING,
//     allowNull: false
//   }
// });

class Device extends Model {
  declare deviceId: string;
  declare key: string;
}

Device.init({
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { sequelize });

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/new-device', async (req: Request, res: Response) => {
  const deviceId = uuidV1();
  const deviceSecret = crypto.randomBytes(32).toString('hex');
  await Device.create({ deviceId: deviceId, key: deviceSecret });
  res.json({ deviceId, deviceSecret });
});

app.get('/devices', async (req: Request, res: Response) => {
  const devices = await Device.findAll();
  res.json(devices);


});

async function main() {
  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}

main();



