#!/usr/bin/env node

if (process.argv.length !== 3) {
    console.error('Usage: ./read-record.js <record_id>');
    console.info('Example: ./read-record.js Ra1rnStUK7CctNehGVWtDa')
    process.exit(1);
}

const recordId = process.argv[2];

async function main(recordId) {
    var response = await fetch(`https://gdtprodbackend.azurewebsites.net/api/provenance/${recordId}`)
    return await response.json();
}

var data = await main(recordId)
console.info(data)

