import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as httpTrigger from '../../../src/functions/httpTrigger';

/*
Intended for cyclically running individual tests for rapid development before
relocating developed tests into the suite. 

Code is not to be kept here. This is a whiteboard. Erase and add your own
as needed. 

*/

describe('MicroTestLand', () => {
  it('APIv2GroupCreationIntegrationTest', async () => {
    let cg_url = 'http://localhost:7071/api/createGroup'

    let groupSpec = JSON.stringify({
      title: 'GroupTitle',
      description: 'GroupDescription'
    })

    let response = await fetch(cg_url, {
        method: "POST",
        body: groupSpec,
    })

    console.log(response)
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