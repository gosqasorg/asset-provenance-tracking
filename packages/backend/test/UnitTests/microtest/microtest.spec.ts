import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as httpTrigger from '../../../src/functions/httpTrigger';

/*
Intended for cyclically running individual tests for rapid development before
relocating developed tests into the suite. 

Code is not to be kept here. This is a whiteboard. Erase and add your own
as needed. 

*/

const createGroup = async (title, description, number_of_children?) => {
  let cg_url = 'http://localhost:7071/api/createGroup'

  let groupSpec = JSON.stringify({
    deviceName: title,
    description: description,
    number_of_children: number_of_children
  })

  let response = await fetch(cg_url, {
      method: "POST",
      body: groupSpec,
  }); response = await response.json()

  // TODO: handle 400; should be separate test
  return response.groupUrl
}

describe('MicroTestLand', () => {
  it('APIv2GroupCreationIntegrationTest', async () => {

    let url = await createGroup('Group Title', 'Group Description', 5)

    console.log(url)

    expect(true).toBe(true)
  });
});
