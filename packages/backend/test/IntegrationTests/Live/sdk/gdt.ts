#!/usr/bin/env -S npx --yes tsx

import { 
    getNewDeviceKey,
    createSimpleRecord,
} from './gdt-utils';

console.log(await getNewDeviceKey())
const simpleRecordId = await createSimpleRecord('Title', 'Description')
console.log(simpleRecordId)

