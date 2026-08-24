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
//import sharp from 'sharp'
import * as htUtils from '../../src/functions/httpTriggerUtils';

// -- Setup --- //

import { config } from 'dotenv';
import { readFile } from 'node:fs/promises';
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

// Check credentials
if(! [KEY1, 
      KEY2,
      LOCATION, 
      ENDPOINT
     ].every(Boolean)
) { console.error('Error: credentials not set'); process.exit(1) }


async function readTheFile(inputFileName: String): File {
  const buffer = await readFile(inputFileName)
  let theFileObject = await new File([buffer], inputFileName)

  if(! (theFileObject instanceof File) ){ throw new Error('not made: File') }

  return theFileObject
}


async function setup() {
  let inputFileName = 'test/Microtest/oversize-g-rated.jpeg'
  let file = await readTheFile(inputFileName)
  let buffer = await htUtils.convertFileForSharp(file)
  let base64File = await htUtils.downscaleIfApplicableAndBase64Encode(buffer);
  return base64File
}


/* =============================================================== */


describe('MicroTestLand', () => {
  it('AzureContentSafetyAPITest', async () => {

    let base64File = await setup()
    let response = await htUtils.checkImageAgainstContentModerationAPI(
      base64File, KEY1, ENDPOINT
    )

    expect(response).toBe('Pass')

  });
});
