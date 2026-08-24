import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import * as htUtils from '../../src/functions/httpTriggerUtils';

// Utility function
async function readTheFile(inputFileName: String) {
  const buffer = await readFile(inputFileName)
  let theFileObject = await new File([buffer], inputFileName)
  if(! (theFileObject instanceof File) ){ throw new Error('not made File') }
  return theFileObject
}

describe('MicroTestLand', () => {
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