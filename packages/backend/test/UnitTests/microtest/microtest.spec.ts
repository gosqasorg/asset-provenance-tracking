import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as httpTrigger from '../../../src/functions/httpTrigger';

/*
Intended for cyclically running individual tests for rapid development before
relocating developed tests into the suite. 

Code is not to be kept here. This is a whiteboard. Erase and add your own
as needed. 

*/

const createGroup = async (title, description) => {
  let cg_url = 'http://localhost:7071/api/createGroup'

  let groupSpec = JSON.stringify({
    deviceName: title,
    description: description
  })

  let response = await (await fetch(cg_url, {
      method: "POST",
      body: groupSpec,
  })).json()

  console.log(response.url)
  return response.url
}

describe('MicroTestLand', () => {
  it('APIv2GroupCreationIntegrationTest', async () => {

    let url = await createGroup('Group Title', 'Group Description')

    console.log(url)

    //console.log(await response.json())
    expect(true).toBe(true)
  });
});

function makeHttpRequest(overrides: any = {}) {
  return {
    method: 'GET',
    url: '/',
    headers: new Headers(),
    query: {},
    params: {},
    user: undefined,
    body: undefined,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    text: async () => '',
    json: async () => ({}),
    formData: async () => ({}),
    ...overrides,
  };
}