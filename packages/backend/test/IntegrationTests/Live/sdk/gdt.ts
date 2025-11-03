#!/usr/bin/env -S npx --yes tsx

import { 
    getNewDeviceKey,
    createSimpleRecord,
} from './gdt-utils';


/*

Welcome to the GDT API Demo. Be sure to check out gdt-utils as well. 

*/

// Example 0: Creating Device Keys
// To see this in use, refer to gdt-utils:createSimpleRecord
const newDeviceKey = await getNewDeviceKey()
console.log(`0. Background: Get New Device Key: ${newDeviceKey}`)

// Example 1: Creating + Reading Records. 
const simpleRecordId = await createSimpleRecord('Title', 'Description')
console.log(`1. Created + Verified a new record with key: ${newDeviceKey}`)



