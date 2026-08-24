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

*/
async function readTheFile(inputFileName: String): File {
  const buffer = await readFile(inputFileName)
  let theFileObject = await new File([buffer], inputFileName)

  if(! (theFileObject instanceof File) ){ throw new Error('not made: File') }

  return theFileObject
}

async function convertFileForSharp(inputFileObject: File): Buffer {

  if (! (inputFileObject instanceof File) ){ throw new Error('Not got: File') }

  /*
  const segments = []
  for await (const segment of inputFileObject.stream()) {
    segments.push(segment)
  }
  return Buffer.concat(segments)
  */
  console.log(inputFileObject.constructor.name, Object.keys(inputFileObject))
  console.log(inputFileObject.constructor.name, Object.keys(inputFileObject), inputFileObject.size)
  let theBuffer = await Buffer.from(await inputFileObject.arrayBuffer())
  if(! (theBuffer instanceof Buffer) ){ throw new Error('not made: buffer') }
  return theBuffer
}

/*
Read file, downscale if needed, base64encode, return string
*/
async function downscaleAndBase64Encode(inputFileBuffer: Buffer): String {
    if(! (inputFileBuffer instanceof Buffer) ){ throw new Error('not got: buffer') }
    try {
        let base64EncodedString = await (await sharp(inputFileBuffer)
            .resize(2048, 2048, {
                fit: 'inside',
                withoutEnlargement: true // only resize if necessary
            }).toBuffer()).toString('base64')
        console.log(base64EncodedString.constructor.name)
        console.log(base64EncodedString.constructor.name)
        console.log(base64EncodedString.constructor.name)
        console.log(base64EncodedString.constructor.name)
        console.log(base64EncodedString.constructor.name)
        console.log(base64EncodedString.constructor.name)
        if(! (typeof base64EncodedString == 'string') ){ throw new Error('not made: String') }
        return base64EncodedString;
    } catch(error) {
        console.error('Error reading file')
        console.error(error)
        process.exit(1)
    }
}

/*
Hand image to api, print response
*/
async function hitAPI(base64File: String) {
    if(! (typeof base64File == 'string') ){ throw new Error('not got: string') }

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
    console.log(payload)

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

async function setup() {
  let inputFileName = 'test/Microtest/oversize-g-rated.jpeg'
  let file = await readTheFile(inputFileName)
  let buffer = await convertFileForSharp(file)
  let base64File = await downscaleAndBase64Encode(buffer);
  return base64File
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

    let base64File = await setup()
    let response = await hitAPI(base64File)
    console.log(response)
    console.log(response)
    console.log(response)
    console.log(response)
    console.log(response)

    expect(true).toBe(true)
  });
});
