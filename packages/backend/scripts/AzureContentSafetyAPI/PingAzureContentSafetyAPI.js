#!/usr/bin/env node

import 'dotenv/config';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

// Ensure called correctly
let inFile = process.argv[2];
if(!inFile) { console.log('usage: ./script.js input_file'); process.exit(1) }
if(!existsSync(inFile)) { console.error(`Error: ${inFile} does not exist`); process.exit(1) }

// Setup credentials
let KEY1 = process.env.KEY1
let KEY2 = process.env.KEY2
let LOCATION = process.env.LOCATION
let ENDPOINT = process.env.ENDPOINT

// Check credentials
if(! [KEY1, 
      KEY2,
      LOCATION, 
      ENDPOINT
     ].every(Boolean)
) { console.error('Error: credentials not set'); process.exit(1) }

/*
Read file, base64encode, hand to api, print response
*/
async function hitAPI(inputFileName) {
    // Read file, base64encode
    let base64File;
    try {
        base64File = (await readFile(inputFileName)).toString('base64')
    } catch(err) {
        console.error('Error reading file')
        console.error(err)
        process.exit(1)
    }

    // Build json
    let payload = {
        "image": {
            "content": base64File
        },
        "categories": [
            "Hate",
            "SelfHarm",
            "Sexual",
            "Violence"
        ],
        "outputType": "FourSeverityLevels"
    }

    let body = {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': KEY1,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }

    // Perform HTTP Interaction
    let url = ENDPOINT + 'contentsafety/image:analyze?api-version=2024-09-01'
    let response;
    if(! ((response = await fetch(url, body)).status == 200)) {
        console.error(`Error: API Interaction Failed: ${result}`)
        process.exit(1);
    }

    // Write result
    let result = await response.text()

    // Print result
    console.log(result)
}


await hitAPI(inFile);
