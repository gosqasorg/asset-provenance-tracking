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

import { containerClient } from '../../src/functions/httpTrigger'
import { subscribeToNotifications } from '../../src/functions/emailNotificationUtils'

/* ========================= The Test ============================ */

// TODO: Test for nonexistent key, ie, getprov before

// Note: no need to delete the enclosing describe block
// Note: it("", async () => {})
describe('MicroTestLand', () => {

  const context = console

  it("400 invalid key + malformed email + valid key but no record attached to it", async () => {

    // containerClient, deviceKey, email, tags, context
    let testCases = [
      [400, ['0OIL',                   'invalid email', []]],     // Invalid email
      [400, ['0OIL',                   'foo@bar.com', []]],      // Non-base58 chars
      [400, ['1',                      'foo@bar.com', []]],     // Invalid key length 
      [404, ['1234567891123456789112', 'foo@bar.com', []]],    // 404: No record for this key
    ]

    let response, testCase, testResult
    for(let [testResult, testCase] of testCases) { 
      console.log(testResult, testCase)
      response = await subscribeToNotifications(containerClient, ...testCase, console)
      expect(response.status).toBe(testResult)
    }

  })

});   // End of describe()












