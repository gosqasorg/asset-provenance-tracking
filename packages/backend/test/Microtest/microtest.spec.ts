/*
Intended for cyclically running individual tests for rapid development before
relocating developed tests into the suite. 

Code is not to be kept here. This is a whiteboard. Erase and add your own
as needed. 
*/

// Do not remove. Vitest Requirement
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Do not remove. Vitest Requirement

/* ------ Actual Imports -------- */

import { readFile } from 'node:fs/promises';
import * as htUtils from '../../src/functions/httpTriggerUtils';


/* ================= Utility Functions ======================== */

async function readTheFile(inputFileName: String) {
  const buffer = await readFile(inputFileName)
  let theFileObject = await new File([buffer], inputFileName)
  if(! (theFileObject instanceof File) ){ throw new Error('not made File') }
  return theFileObject
}

async function setup() {
  let inputFileName = 'test/Microtest/oversize-g-rated.jpeg'
  let fileObject = await readTheFile(inputFileName)
  return fileObject
}

export async function convertFileForSharp(inputFileObject: File) {
  if (! (inputFileObject instanceof File) ){ throw new Error('Not got: File') }

  console.log(inputFileObject.constructor.name, Object.keys(inputFileObject))
  console.log(inputFileObject.constructor.name, Object.keys(inputFileObject), inputFileObject.size)
  let theBuffer = await Buffer.from(await inputFileObject.arrayBuffer())
  if(! (theBuffer instanceof Buffer) ){ throw new Error('not made: buffer') }
  return theBuffer
}

/* ========================= The Test ============================ */

describe('MicroTestLand', () => {
  it('AzureContentSafetyAPITest', async () => {

    let fileObject = await setup()
    let response = await htUtils.imageIsNotPermitted(fileObject, console)
    expect(response).toBe(false)

  });

  it('Determine whether file is image', async () => {
    let fileObject, classification;

    // Real image
    fileObject = await readTheFile('test/Microtest/oversize-g-rated.jpeg')
    classification = await htUtils.isImage(fileObject, console)
    expect(classification).toBe(true)

    // PDF
    fileObject = await readTheFile('test/Microtest/Powerset-lattice-3.pdf')
    classification = await htUtils.isImage(fileObject, console)
    expect(classification).toBe(false)
  })
});
