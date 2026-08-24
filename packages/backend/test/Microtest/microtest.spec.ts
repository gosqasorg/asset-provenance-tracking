/*
Intended for cyclically running individual tests for rapid development before
relocating developed tests into the suite. 

Code is not to be kept here. This is a whiteboard. Erase and add your own
as needed. 
*/


// Do not remove. Vitest Requirement
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Do not remove. Vitest Requirement

/* ================================================================= * 
   README: If you are reading this, you may delete what's here.
   That being said, I used what was here previously as an example.
   It was useful. What's left here was done in the hopes it may be.

   This working "development-driven testing" environment is, I find,
   massively useful for dev.

   To run it, ./cycle-microtest.sh to initiate the test loop. Once 
   the loop is active, vitest tests this directory every 5 seconds.

   To use it, detach the terminal and leave it running where it's at
   least partially in view.

   To stop it, simply hit ctrl + c. 

   Then, code away. 
   If you hit an error, you know immediately. 
   Once it's solved, you know immediately. 

   Code tends to originate here, and migrate elsewhere in two types:
   * Utilities / functions / non-test code, and
   * You get at least one test out of it for free. That test is
     set up and ready to be slotted into place. 
 * ================================================================= */


/* ------ Actual Imports -------- */

// These came right along into the test file
import { readFile } from 'node:fs/promises';
import * as htUtils from '../../src/functions/httpTriggerUtils';


/* ================= Utility Functions Supporting The Test ======== */

async function readTheFile(inputFileName: String) {
  const buffer = await readFile(inputFileName)
  let theFileObject = await new File([buffer], inputFileName)
  if(! (theFileObject instanceof File) ){ throw new Error('not made File') }
  return theFileObject
}


/* ================== Function Under Development ================= */

// Relocated to httpTriggerUtils.ts
export async function convertFileForSharp(inputFileObject: File) {
  if (! (inputFileObject instanceof File) ){ throw new Error('Not got: File') }

  console.log(inputFileObject.constructor.name, Object.keys(inputFileObject))
  console.log(inputFileObject.constructor.name, Object.keys(inputFileObject), inputFileObject.size)
  let theBuffer = await Buffer.from(await inputFileObject.arrayBuffer())
  if(! (theBuffer instanceof Buffer) ){ throw new Error('not made: buffer') }
  return theBuffer
}


/* ========================= The Test ============================ */

// Note: no need to delete the enclosing describe block
describe('MicroTestLand', () => {

  // Relocated to tests/UnitTests/httpTriggerUtils.spec.ts
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

// closing brace of describe block
});
