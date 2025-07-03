import { describe, it, expect, vi, beforeEach } from 'vitest';

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
    getRandomValues: (arr: Uint8Array) => { arr.fill(1); return arr; }
  }
}));

import * as httpTrigger from '../../src/functions/httpTrigger';

beforeEach(() => {
  // Patch TextDecoder to just decode to a string
  globalThis.TextDecoder = class {
    decode(buf: ArrayBuffer | Uint8Array) {
      if (buf instanceof Uint8Array) {
        return Buffer.from(buf).toString('utf-8');
      } else {
        return Buffer.from(new Uint8Array(buf)).toString('utf-8');
      }
    }
  } as any;
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

  it('getVersion returns version info', async () => {
    const req = makeHttpRequest();
    const res = await httpTrigger.getVersion(req, context);
    expect(res).toHaveProperty('jsonBody');
    expect(res).toHaveProperty('headers');
  });
}); 