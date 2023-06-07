import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { v1 as uuidV1, parse } from 'uuid';
import * as crypto from 'crypto';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/new-device', (req: Request, res: Response) => {
    const deviceId = uuidV1();
    const deviceSecret = crypto.randomBytes(32).toString('hex');
    res.json({ deviceId, deviceSecret });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});