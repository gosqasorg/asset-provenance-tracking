import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as httpTrigger from '../../src/functions/httpTrigger';
import { http } from '@azure/functions/types/app';


// Minimal Azure SDK mocks
vi.mock('@azure/storage-blob', () => {

  class MockBlockBlobClient {
    async getProperties() {
      return { metadata: { gdtsalt: '0102030405060708090a0b0c0d0e0f10', gdttimestamp: '123', gdtcontenttype: 'application/octet-stream', gdtname: '' } };
    }
    async downloadToBuffer() { return new Uint8Array(16); }
    async exists() { return true; }
  }

  class MockContainerClient {
    async exists() { return true; }
    async createIfNotExists() { return true; }
    async uploadBlockBlob() { return true; }
    listBlobsFlat(opts?: any) {
      let called = false;
      return {
        async next() {
          if (!called) {
            called = true;
            return { value: { name: (opts && opts.prefix) ? opts.prefix + '/blobid' : 'prov/deviceid/blobid' }, done: false };
          } else {
            return { value: undefined, done: true };
          }
        },
        async *[Symbol.asyncIterator]() {
          yield { name: (opts && opts.prefix) ? opts.prefix + '/blobid' : 'prov/deviceid/blobid' };
        }
      };
    }
    getBlockBlobClient() { return new MockBlockBlobClient(); }
  }

  return {
    BlockBlobClient: MockBlockBlobClient,
    ContainerClient: MockContainerClient,
    StorageSharedKeyCredential: class {},
  };
  
});

// Minimal crypto mock
vi.mock('node:crypto', () => ({
  webcrypto: {
    subtle: {
      digest: vi.fn(async () => new Uint8Array(4).buffer),
      importKey: vi.fn(async () => ({})),
      encrypt: vi.fn(async () => new Uint8Array(16).buffer),
      decrypt: vi.fn(async () => new TextEncoder().encode('{"record":1}').buffer),
    },
    getRandomValues: (arr: Uint8Array) => { arr.fill(1); return arr; },
  },
}));


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
  const context = {
    invocationId: 'test-invocation-id',
    functionName: 'test-function',
    extraInputs: { get: vi.fn(), set: vi.fn() },
    extraOutputs: { get: vi.fn(), set: vi.fn() },
    log: vi.fn(), trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(),
    options: { trigger: { type: 'http', name: 'req' }, extraInputs: [], extraOutputs: [] },
  };
  const deviceKey = '5LAtuNjm3iuAR3ohpjTMy7';
  const attachmentID = 'testattachid';

  it('getProvenance returns records', async () => {
    const req = makeHttpRequest({ params: { deviceKey } });
    const res = await httpTrigger.getProvenance(req, context);
    expect(res).toHaveProperty('jsonBody');
  });

  it('postProvenance returns a body', async () => {
    const formData = {
      get: vi.fn((key) => key === 'provenanceRecord' ? '{"foo":1}' : undefined),
      values: vi.fn(() => [].values()),
    };
    const req = makeHttpRequest({ method: 'POST', params: { deviceKey }, formData: async () => formData });
    const res = await httpTrigger.postProvenance(req, context);
    expect(res).toHaveProperty('jsonBody');
  });

  it('getAttachment returns a body and headers', async () => {
    const req = makeHttpRequest({ params: { deviceKey, attachmentID } });
    const res = await httpTrigger.getAttachment(req, context);
    expect(res).toHaveProperty('body');
    expect(res).toHaveProperty('headers');
  });

  it('getAttachmentName returns a body', async () => {
    const req = makeHttpRequest({ params: { deviceKey, attachmentID } });
    const res = await httpTrigger.getAttachmentName(req, context);
    expect(res).toHaveProperty('body');
  });

  it('getStatistics returns a jsonBody', async () => {
    const req = makeHttpRequest();
    const res = await httpTrigger.getStatistics(req, context);
    expect(res).toHaveProperty('jsonBody');
  });

  it('getNewDeviceKey returns key', async () =>{
    const req = makeHttpRequest();
    const res = await httpTrigger.getNewDeviceKey(req, context);
    expect(res).toHaveProperty('body');
    const pattern = /^[a-zA-Z0-9]+$/;
    const deviceKey = res['body'];
    expect(pattern.test(deviceKey)).toBe(true); 
    expect(deviceKey.length).toBe(22)
    expect(typeof deviceKey).toBe('string')
  });
  
  it('getVersion returns version info', async () => {
    const req = makeHttpRequest();
    const res = await httpTrigger.getVersion(req, context);
    expect(res.body).toBe('44444');
    expect(res.status).toBe(200);
  }, 7000);

  it('setVersion sets the server version', async () => {
    const req = makeHttpRequest();
    req.query = {version: '44444'};
    const res = await httpTrigger.setVersion(req, context);
    expect(res.status).toBe(200);
  }, 7000)
  it('validateJSON correctly validates record', async () => {
    const validRecord = {"blobType": "deviceInitializer","deviceName": "Name","description": "Description","children_key": "","tags": [],
      "hasParent": false,"isReportingKey": false};
    let valid = await httpTrigger.validateJSON(validRecord);
    expect(valid).toBe(true);

    const recordWithTags = {"blobType": "deviceInitializer","deviceName": "Name","description": "Description","children_key": "",
      "tags": ["peaches", "pears"],"hasParent": false,"isReportingKey": false};
    valid = await httpTrigger.validateJSON(recordWithTags);
    expect(valid).toBe(true);

    const recordWithoutOptional = {"blobType": "deviceInitializer","deviceName": "Name","description": "Description","children_key": "",
      "tags": ["apples", "plums"]};
    valid = await httpTrigger.validateJSON(recordWithoutOptional);
    expect(valid).toBe(true);
  });

  it('validateJSON correctly validates group', async () => {
    const validGroup = {"blobType": "deviceInitializer","deviceName": "Group w/ no children","description": "Description",
      "children_key":[],"children_name":[],"tags": [],"hasParent": false,"isReportingKey": false};
    let valid = await httpTrigger.validateJSON(validGroup);
    expect(valid).toBe(true);

    const groupWithChildren = {"blobType": "deviceInitializer","deviceName": "Group w/ children","description": "Description",
      "children_key":["4YAfNMTra2VMvXhFQvpQZw"],"children_name":["Child 1"],"tags": ["hasChild"],"hasParent": false,"isReportingKey": false,};
    valid = await httpTrigger.validateJSON(groupWithChildren);
    expect(valid).toBe(true);
  });

  it('validateJSON correctly catches invalid record/group', async () => {
    // Missing children_key, which should cause validateJSON to flag this record as invalid
    const invalidRecord = {"blobType":"deviceInitializer","deviceName":"JSON without children_key","description":"invalid JSON","tags":[],
      "hasParent":false,"isReportingKey":false};
    let valid = await httpTrigger.validateJSON(invalidRecord);
    expect(valid).toBe(false);

    // Missing description, which should cause validateJSON to flag this group as invalid
    const invalidGroup = {"blobType":"deviceInitializer","deviceName":"JSON without description","tags":["group"],"children_key":[],
      "children_name":[],"hasParent":false,"isReportingKey":false};
    valid = await httpTrigger.validateJSON(invalidGroup);
    expect(valid).toBe(false);
  });

});
 

