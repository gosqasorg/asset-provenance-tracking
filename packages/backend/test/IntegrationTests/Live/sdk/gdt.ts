#!/usr/bin/env -S npx --yes tsx

import { 
    getNewDeviceKey,
    createSimpleRecord,
    updateRecordTags,
} from './gdt-utils';


/*

Welcome to the GDT API Demo. Be sure to check out gdt-utils as well. 

*/

// Example 0: Creating Device Keys
// To see this in use, refer to gdt-utils:createSimpleRecord
const newDeviceKey = await getNewDeviceKey()
console.log(`0. Background: Get New Device Key: ${newDeviceKey}`)


// Example 1: Creating + Reading Records. 
const simpleRecordId = await createSimpleRecord(
    'New Record Title', 'Greetings from the terminal!')
console.log(`1. Created + Verified a new record with key: ${simpleRecordId}`)
console.log(`\nTake a look. Aim your browser at:\nhttps://gosqas.org/history/${simpleRecordId}`)


// Example 2: Updating the record we created
// Suppose we inspected the item, and we want to note this with tags
const statusUpdateDescription = `
    Shipment received, passed QC, deployed to field. 
`.trim()
const statusUpdateTags: string[] = ['received', 'inspected', 'tested_pass', 'deployed']
const updateResponse = await updateRecordTags(
    simpleRecordId, 
    statusUpdateTags,
    statusUpdateDescription,
)
console.log(updateResponse)
console.log('2. Updating our record with tags and status after passing QC')
console.log(`\nLook again:\nhttps://gosqas.org/history/${simpleRecordId}`)

