/*
Intended for cyclically running individual tests for rapid development before
relocating developed tests into the suite. 

Code is not to be kept here. This is a whiteboard. Erase and add your own
as needed. 
*/


// Do not remove. Vitest Requirement
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
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



/* ================= Utility Functions Supporting The Test ======== */



/* ================== Function Under Development ================= */

const context = console

function errorHandler(functionName, error) {

  context.error(`Returning unsuccessfully from ${functionName}`)

  context.error(`Cause: ${error.cause}`)
  if(error.cause == 404) {
    return {
      status: 404,
      body: "Not found",
      headers: { "Content-Type": "text/plain" }
    } 
  }
}

/* ========================= The Test ============================ */

// Note: no need to delete the enclosing describe block
describe('MicroTestLand', () => {

  // Mock console.error to confirm we're getting the right log messages
  const consoleMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  afterAll(() => {
    consoleMock.mockReset();
  });


   // This will be a unit test
  // Group Creation test with 2 child keys + send_to_all_children
  it("Develop", async () => {
    const returned = errorHandler('foobar', new Error('404 test', { cause: 404 }))
    console.dir(returned)
    expect(returned).toEqual({
      status: 404,
      body: "Not found",
      headers: { "Content-Type": "text/plain" }
    })
    expect(consoleMock).toHaveBeenCalledWith('Returning unsuccessfully from ' + 'foobar');
    expect(consoleMock).toHaveBeenCalledWith('Cause: 404');
  })
});












