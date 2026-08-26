import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import * as htUtils from '../../src/functions/httpTriggerUtils';


// Utility function
async function setup() {
  let inputFileName = 'test/Microtest/oversize-g-rated.jpeg'
  let fileObject = await readTheFile(inputFileName)
  return fileObject
}

// Utility function
async function readTheFile(inputFileName: String) {
  const buffer = await readFile(inputFileName)
  let theFileObject = await new File([buffer], inputFileName)
  if(! (theFileObject instanceof File) ){ throw new Error('not made File') }
  return theFileObject
}


describe('Tests for Azure Content Moderation API', () => {
  
  // Note: Cannot run locally. Can run on GitHub workflow runners
  it('AzureContentSafetyAPITest: Oversize image', async () => {
    // Implicitly tests that image resizing succeeds

    let fileObject = await setup()
    let response = await htUtils.imageIsNotPermitted(fileObject)
    expect(response).toBe(false)

  })
})