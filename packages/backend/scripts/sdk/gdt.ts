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
console.log(`\n0. Background: Creating New Device Keys`);
console.log('-'.repeat(80))
console.log(`\nCreated New Device Key: ${newDeviceKey}`)


// Example 1: Creating + Reading Records. 
const simpleRecordId = await createSimpleRecord(
    'New Record Title', 'Greetings from the terminal!')
console.log(`\n\n1. Creating + Reading Records`)
console.log('-'.repeat(80))
console.log(`\nCreated + Verified a new record with key: ${simpleRecordId}`)
console.log(`Take a look. Aim a browser at:\nhttps://gosqas.org/history/${simpleRecordId}`)


// Example 2: Updating the record we created
// Suppose we inspected the item, and we want to note this with tags
console.log('\n\n2. Updating our record with tags and status after passing QC')
console.log('-'.repeat(80))

// Setup data
const statusUpdateDescription = `
    Shipment received, passed QC, deployed to field. 
`.trim()
const statusUpdateTags: string[] = ['received', 'inspected', 'tested_pass', 'deployed']

// Initiate interaction
const updateResponse = await updateRecordTags(
    simpleRecordId, 
    statusUpdateTags,
    statusUpdateDescription,
)

// Examine results
console.log('\nSuccessfully updated record\n')
console.log(`Take a look at the update in a browser:`)
console.log(`https://gosqas.org/history/${simpleRecordId}`)
console.log('\nAnd here:')
console.dir(updateResponse, {depth: null, colors: true})
console.log('\n')

