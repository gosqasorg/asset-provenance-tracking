/*
Intended for cyclically running individual tests for rapid development before
relocating developed tests into the suite. 

Code is not to be kept here. This is a whiteboard. Erase and add your own
as needed. 
*/

// Do not remove. Vitest Requirement
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Do not remove. Vitest Requirement

// Actual Imports
import { config } from 'dotenv';
import sharp from 'sharp'
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

// -- Setup --- //
  
import { config } from 'dotenv';          
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';           // this file
const the_dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(the_dirname, '.env') });

// --- Code --- //

// Setup credentials
let KEY1 = process.env.KEY1
let KEY2 = process.env.KEY2
let LOCATION = process.env.LOCATION
let ENDPOINT = process.env.ENDPOINT

console.log(KEY1)
console.log(KEY2)
console.log(LOCATION)
console.log(ENDPOINT)

// Check credentials
if(! [KEY1, 
      KEY2,
      LOCATION, 
      ENDPOINT
     ].every(Boolean)
) { console.error('Error: credentials not set'); process.exit(1) }

/*
Read file, downscale if needed, base64encode, return string
*/

async function downscaleIfNeeded(inputFileName) {
    try {
        return (await sharp(inputFileName)
            .resize(2048, 2048, {
                fit: 'inside',
                withoutEnlargement: true
            }).toBuffer()).toString('base64')
    } catch(err) {
        console.error('Error reading file')
        console.error(err)
        process.exit(1)
    }
}

/*
Hand image to api, print response
*/
async function hitAPI(inputFileName) {
    let base64File = await downscaleIfNeeded(inputFileName);

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
        console.error(`Error: API Interaction Failed: ${await response.text()}`)
        process.exit(1);
    }

    // Write result
    let result = JSON.parse(await response.text())
    console.log(result['categoriesAnalysis'])

    // Print result
    console.log(result)

    let total_score = 0;
    for(let i = 0; i < result['categoriesAnalysis'].length; ++i) {
        total_score += result['categoriesAnalysis'][i]['severity']
    }
    return total_score > 0 ? 'Fail' : 'Pass'    
}


/* =============================================================== */

async function getFileThatHasBeenTransformedIntoWhateverTypeSharpNeeds() {}

async function moderateContent() {
  let base_url = 'http://localhost:7071/'
  let api_url = base_url + 'api/'
  let content_safety_url = base_url + '/testContentSafetyAPI'



  let response = await fetch(content_safety_url, {
      method: "POST",
      body: groupSpec,
  }); response = await response.json()

}


describe('MicroTestLand', () => {
  it('AzureContentSafetyAPITest', async () => {
/*
    let inFile = './oversize-g-rated.jpeg'
    let response = await hitAPI(inFile)
    console.log(response)
*/
    expect(true).toBe(true)
  });
});
