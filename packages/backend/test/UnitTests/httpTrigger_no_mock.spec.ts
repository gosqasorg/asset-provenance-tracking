import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as httpTrigger from '../../src/functions/httpTrigger';


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


describe('httpTrigger endpoints (shallow mocks)', () => {

  // We need to pass the context to each invocation as part of simulating an incoming request
  const context = {
    invocationId: 'test-invocation-id',
    functionName: 'test-function',
    extraInputs: { get: vi.fn(), set: vi.fn() },
    extraOutputs: { get: vi.fn(), set: vi.fn() },
    log: vi.fn(), trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(),
    options: { trigger: { type: 'http', name: 'req' }, extraInputs: [], extraOutputs: [] },
  };
  
  
  // Some duplication of the key tests. Regardless, all endpoint functions need at least one test. 
  it('getNewDeviceKey returns key', async () =>{

    // Execute http interaction
    const req = makeHttpRequest();
    const res = await httpTrigger.getNewDeviceKey(req, context);

    // Ensure response has expected form
    expect(res).toHaveProperty('body');
    var deviceKey = await res['body'];

    // Ensure contents are of expected type
    var measuredType = typeof deviceKey;
    expect(measuredType).toBe('string')

    // Ensure key matches regex
    const pattern = /^[a-zA-Z0-9]+$/;
    var result = pattern.test(deviceKey)
    expect(result).toBe(true); 

    // Ensure key has correct length
    expect(deviceKey.length).toBe(22)
  });
 
});


describe('encodeAttachmentFilename', () => {
  // plain ASCII
  it ('leaves plain filenames unchanged', () => {
    const filename = 'plain-filename.jpg'
    const {fallback, encoded} = httpTrigger.encodeAttachmentFilename(filename);
    expect(fallback).toBe(filename);
    expect(decodeURIComponent(encoded)).toBe(filename)
  });

  //  macOS screenshot filenames
  it ('handles macOS special space character', () => {
    const filename = 'Screen Shot 2026-09-07 at 2\u202F30\u202F00\u202FPM.png'
    const {fallback, encoded} = httpTrigger.encodeAttachmentFilename(filename);

    expect(() => new Headers().append('Attachment-Name', encoded)).not.toThrow();
    expect(fallback).toBe('Screen_Shot_2026-09-07_at_2_30_00_PM.png');
    expect(decodeURIComponent(encoded)).toBe(filename);
    
  });
 
  // emoji file name
  it ('handles filenames that are emojis', () => {
    const filename = '🎲.png'
    const {fallback, encoded} = httpTrigger.encodeAttachmentFilename(filename);

    expect(() => new Headers().append('Attachment-Name', encoded)).not.toThrow();
    expect(fallback).toBe('_.png');
    expect(decodeURIComponent(encoded)).toBe(filename);
  });

})
