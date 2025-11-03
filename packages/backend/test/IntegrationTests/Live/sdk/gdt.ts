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
const simpleRecordId = await createSimpleRecord('New Record Title', 'Greetings from the terminal!')
console.log(`1. Created + Verified a new record with key: ${simpleRecordId}`)
//https://gosqas.org/history/3Zgm5KYpwT3tqzT7z4EfiY
console.log(`Take a look. Aim your browser at:\nhttps://gosqas.org/history/${simpleRecordId}`)


