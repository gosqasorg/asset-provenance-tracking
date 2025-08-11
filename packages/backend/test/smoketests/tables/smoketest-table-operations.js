#!/usr/bin/node

import 'dotenv/config';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

const account = process.env.account;
const key = process.env.storage_key;
const table = process.env.table;

const credential = new AzureNamedKeyCredential(account, key);
const tableClient = new TableClient(`https://${account}.table.core.windows.net`, table, credential);

console.log(`https://${account}.table.core.windows.net`);

async function addRow(email) {
  try {
    const entity = {
      partitionKey: 'UserFeedbackVolunteers',
      rowKey: email
    };

    await tableClient.createEntity(entity);
    console.log('Added feedback volunteer contact info.');
  } catch (error) {
    if (error.statusCode === 409) {
      console.log('Already exists. Not an error. Do not report to user.');
    } else {
      console.log('Error adding. Do not report to user.', error.message);
    }
  }
}

addRow('foo@bar.test');
