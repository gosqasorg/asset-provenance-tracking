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

async function readTheFile(inputFileName: String): File {
  const buffer = await readFile(inputFileName)
  let theFileObject = await new File([buffer], inputFileName)
  if(! (theFileObject instanceof File) ){ throw new Error('not made: File') }
  return theFileObject
}

async function setup() {
  let inputFileName = 'test/Microtest/oversize-g-rated.jpeg'
  let fileObject = await readTheFile(inputFileName)
  return fileObject
}


/* ========================= The Test ============================ */

describe('MicroTestLand', () => {
  it('AzureContentSafetyAPITest', async () => {

    let fileObject = await setup()
    let response = await htUtils.contentModerationImageCheck(fileObject)
    expect(response).toBe('Pass')

  });
});
