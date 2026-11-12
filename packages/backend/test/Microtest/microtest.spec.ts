/*
Intended for cyclically running individual tests for rapid development before
relocating developed tests into the suite. 

Code is not to be kept here. This is a whiteboard. Erase and add your own
as needed. 
*/


// Do not remove. Vitest Requirement
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import * as z from "zod";
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
  context.error("Error zod?", JSON.stringify(error).includes("ZodError"))
  console.dir(error)

  if (JSON.stringify(error).includes("ZodError")) {
    let message = 'Error: Check argument format.'
    context.error(message)
    context.error(`${functionName}: returning 400 on zodError`)
    return {
        status: 400,
        jsonBody: { data: error.issues },
        headers: { "Content-Type": "text/plain" }
    }
  }

  // NOTE: This is where we're picking up next time
  // if (error instanceof SyntaxError) {
  //   let message = 'Error: Check json structure.'
  //   context.error(message)
  //   context.error(`${functionName}: returning 400 on syntaxError`)
  //   return {
  //       status: 400,
  //       jsonBody: { data: message },
  //       headers: { "Content-Type": "text/plain" }
  //   }
  // }

  // Uncategorizable errors
  // To be assessed + addressed in upcoming ticket
  // Validate the error itself
  if(!('cause' in error)) {
    const message = `${functionName} returning error without cause. Error: ${JSON.stringify(error)}`
    context.error(message)

    // During dev, crash everything so we can find errors that don't follow the format of always having a cause.
    throw Error(message)

    // During prod, log and return. We can't go down over one error
    // Note re: duplication: two instances is not a pattern
    return {
      status: 500,
      body: "Internal server error. Not to worry: we stay vigilant for these.",
      headers: { "Content-Type": "text/plain" }
    }
  }

  if(error.cause == 404) {
    context.error(`Cause: ${error.cause}`)
    context.error(error.message)
    return {
      status: 404,
      body: "Not found",
      headers: { "Content-Type": "text/plain" }
    } 
  }

  if (error.cause == 400) {
    context.error(`Cause: ${error.cause}`)
    context.error(error.message)
    return { 
      status: 400,
      body: error.message,
      headers: { "Content-Type": "text/plain" },
      jsonBody: { error: error.message }
    }
  }

  // Regarding the lack of conditional on the 500 case:
  // If the error is ours (500) or any other type we're not catching, which we'd like to highlight as a 500
  context.error(`${functionName}: experienced 500 internal server error or uncategorized error`)
  context.error(`Cause: ${error.cause}`)
  context.error(JSON.stringify(error))
  const message = "Internal server error. Not to worry: we stay vigilant for these.";
  return {
    status: 500,
    body: message,  // With Viz, we intend to show 500s as a time series + table, much like the first map. 
    headers: { "Content-Type": "text/plain" },
    jsonBody: { error: message }
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

  it("Develop Zod", async() => {
    const returned = errorHandler('foobar', z.array().safeParse(":D"))
    console.dir(returned)
    expect(returned).toEqual({
      status: 400,
      jsonBody: { data: z.array().safeParse(":)").issues },
      headers: { "Content-Type": "text/plain" }
    })
    expect(consoleMock).toHaveBeenCalledWith('Error: Check argument format.');
    expect(consoleMock).toHaveBeenCalledWith('foobar: returning 400 on zodError');
  })

  // This will be a unit test
  it("Develop", async () => {
    const returned = errorHandler('foobar', new Error('404 test', { cause: 404 }))
    console.dir(returned)
    expect(returned).toEqual({
      status: 404,
      body: "Not found",
      headers: { "Content-Type": "text/plain" }
    })
    expect(consoleMock).toHaveBeenCalledWith('404 test');
    expect(consoleMock).toHaveBeenCalledWith('Returning unsuccessfully from ' + 'foobar');
    expect(consoleMock).toHaveBeenCalledWith('Cause: 404');
  })

  it("Develop 400", async () => {
    const returned = errorHandler('foobar', new Error('400 test', { cause: 400 }))
    console.dir(returned)
    expect(returned).toEqual({ 
      status: 400,
      body: "400 test",
      headers: { "Content-Type": "text/plain" },
      jsonBody: { error: "400 test" }
    })
    expect(consoleMock).toHaveBeenCalledWith('400 test');
    expect(consoleMock).toHaveBeenCalledWith('Returning unsuccessfully from ' + 'foobar');
    expect(consoleMock).toHaveBeenCalledWith('Cause: 400');
  })

  it("Develop 500", async () => {
    const returned = errorHandler('foobar', new Error('500 test', { cause: 500 }))
    console.dir(returned)
    expect(returned).toEqual({ 
      status: 500,
      body: "Internal server error. Not to worry: we stay vigilant for these.",
      headers: { "Content-Type": "text/plain" },
      jsonBody: { error: "Internal server error. Not to worry: we stay vigilant for these." }
    })
    expect(consoleMock).toHaveBeenCalledWith('foobar: experienced 500 internal server error or uncategorized error');
    expect(consoleMock).toHaveBeenCalledWith('Cause: 500');
    expect(consoleMock).toHaveBeenCalledWith(JSON.stringify(new Error('500 test', { cause: 500 })));
  })
});












