import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as httpTrigger from '../../src/functions/httpTrigger';
import { TableClient } from '@azure/data-tables';
import { sendEmail } from '../../src/functions/sendEmail.js';


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

//  crypto mock
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

// https://learn.microsoft.com/en-us/azure/developer/javascript/sdk/test-sdk-integration?tabs=test-with-node-testrunner
vi.mock('@azure/data-tables', () => ({
    TableClient: vi.fn().mockImplementation(() => ({
        createTable: vi.fn().mockResolvedValue(undefined),
        upsertEntity: vi.fn().mockResolvedValue(undefined),
        listEntities: vi.fn().mockReturnValue((async function* () {})()),
        deleteEntity: vi.fn().mockResolvedValue(undefined),
    })),
    AzureNamedKeyCredential: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('../../src/functions/sendEmail.js', () => ({
    sendEmail: vi.fn().mockResolvedValue(undefined),
}));


// minimal Azure Functions HttpRequest shape
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

// smoke tests
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

// helper funcs for email subscrip tests
function makeMockTableInstance() {
    // makes the plain obj with the mocked methods
    return {
        createTable: vi.fn().mockResolvedValue(undefined),
        upsertEntity: vi.fn().mockResolvedValue(undefined),
        listEntities: vi.fn().mockReturnValue((async function* () {})()),
        deleteEntity: vi.fn().mockResolvedValue(undefined),
    };
}

// valid entity + overrides just in case different fields need tweaking
function makeValidEntity(overrides: Record<string, unknown> = {}) {
    return {
        partitionKey: 'PendingVerification',
        rowKey: 'test@example.com',
        code: '123456',
        token: 'validtoken',
        expiresAt: Date.now() + 600_000, // 10 min in the future
        recordKey: 'fakerecordkey',
        tags: '[]',
        ...overrides,
    };
}

// mock httpRequests with query params
function makeQueryRequest(params: Record<string, string>) {
    return {
        query: { get: (token: string) => params[token] ?? null },
    } as any;
}

// postNotificationEmail tests
describe('postNotificationEmail - validation', () => {
    let mockTable: ReturnType<typeof makeMockTableInstance>;
    const ctx = { log: vi.fn(), error: vi.fn() } as any;

    // all need a table mock and email mock since the function does both
    beforeEach(() => {
        mockTable = makeMockTableInstance();
        vi.mocked(TableClient).mockImplementation(() => mockTable as any); // make new TableClient() return our mock instance
        vi.mocked(sendEmail).mockResolvedValue(undefined);
    });

    // missing email
    it('returns 400 when email is missing', async () => {
        const req = { json: async () => ({ recordKey: 'fakekey', tags: [] }) } as any;
        const res = await httpTrigger.postNotificationEmail(req, ctx);
        expect(res.status).toBe(400);
    });

    // missing recordKey
    it('returns 400 when recordKey is missing', async () => {
        const req = { json: async () => ({ email: 'user@example.com', tags: [] }) } as any;
        const res = await httpTrigger.postNotificationEmail(req, ctx);
        expect(res.status).toBe(400);
    });

    // valid request
    it('returns 200 when all required fields are present', async () => {
        const email = 'user@example.com';
        const recordKey = 'key123';
        const tags = ['tag1'];
        const req = { json: async () => ({ email, recordKey, tags }) } as any;

        const res = await httpTrigger.postNotificationEmail(req, ctx);
        expect(res.status).toBe(200);

    });
});

// postVerifyCode tests
describe('postVerifyCode', () => {
    let mockTable: ReturnType<typeof makeMockTableInstance>;
    const ctx = { log: vi.fn(), error: vi.fn() } as any;

    // all tests need a table mock
    beforeEach(() => {
        mockTable = makeMockTableInstance();
        vi.mocked(TableClient).mockImplementation(() => mockTable as any);
    });

    // no token or code
    it('returns 400 when token or code are missing', async () => {
        const req = { json: async () => ({}) } as any;
        const res = await httpTrigger.postVerifyCode(req, ctx);
        expect(res.status).toBe(400);
    });

    // no matching entity
    it('returns 400 when no matching entity found', async () => {
        const req = { json: async () => ({ token: 'abc', code: '123456' }) } as any;
        const res = await httpTrigger.postVerifyCode(req, ctx);
        expect(res.status).toBe(400);
    });

    // expired code
    it('returns 400 when code is expired', async () => {
        const entity = makeValidEntity({ expiresAt: Date.now() - 1000 }); // already expired
        mockTable.listEntities.mockReturnValue((async function* () { yield entity; })());
        
        const req = { json: async () => ({ token: entity.token, code: entity.code }) } as any;
        const res = await httpTrigger.postVerifyCode(req, ctx);
        
        expect(res.status).toBe(400);
    });

    // incorrect code
    it('returns 400 when code is wrong', async () => {
        const entity = makeValidEntity({ code: '999999' });
        mockTable.listEntities.mockReturnValue((async function* () { yield entity; })());
        
        const req = { json: async () => ({ token: entity.token, code: '111111' }) } as any;
        const res = await httpTrigger.postVerifyCode(req, ctx);
        
        expect(res.status).toBe(400);
    });
});

// getPendingVerification tests
describe('getPendingVerification', () => {
    let mockTable: ReturnType<typeof makeMockTableInstance>;
    const ctx = { log: vi.fn(), error: vi.fn() } as any;

    beforeEach(() => {
        mockTable = makeMockTableInstance();
        vi.mocked(TableClient).mockImplementation(() => mockTable as any);
    });

    // missing token
    it('returns 400 when token query param is missing', async () => {
        const req = makeQueryRequest({});
        const res = await httpTrigger.getPendingVerification(req, ctx);
        expect(res.status).toBe(400);
    });

    // no token found
    it('returns 404 when token is not found', async () => {
        const req = makeQueryRequest({ token: 'unknowntoken' });
        const res = await httpTrigger.getPendingVerification(req, ctx);
        expect(res.status).toBe(404);
    });

    // should delete entity when expired token / code
    it('returns 404 and deletes entity when token is expired', async () => {
        const entity = makeValidEntity({ expiresAt: Date.now() - 1000 });
        mockTable.listEntities.mockReturnValue((async function* () { yield entity; })());
        const req = makeQueryRequest({ token: entity.token });

        const res = await httpTrigger.getPendingVerification(req, ctx);

        expect(res.status).toBe(404);
        expect(mockTable.deleteEntity).toHaveBeenCalledWith('PendingVerification', entity.rowKey);
    });

    // valid token
    it('returns 200 for a valid non-expired token', async () => {
        const entity = makeValidEntity();
        mockTable.listEntities.mockReturnValue((async function* () { yield entity; })());
        const req = makeQueryRequest({ token: entity.token });

        const res = await httpTrigger.getPendingVerification(req, ctx);

        expect(res.status).toBe(200);
    });
});

// postResendCode tests
describe('postResendCode', () => {
    let mockTable: ReturnType<typeof makeMockTableInstance>;
    const ctx = { log: vi.fn(), error: vi.fn() } as any;

    beforeEach(() => {
        mockTable = makeMockTableInstance();
        vi.mocked(TableClient).mockImplementation(() => mockTable as any);
        vi.mocked(sendEmail).mockResolvedValue(undefined);
    });

    // missing token
    it('returns 400 when token is missing', async () => {
        const req = { json: async () => ({}) } as any;
        const res = await httpTrigger.postResendCode(req, ctx);
        expect(res.status).toBe(400);
    });
 
    // invalid token
    it('returns 404 when token is not found', async () => {
        const req = { json: async () => ({ token: 'unknowntoken' }) } as any;
        const res = await httpTrigger.postResendCode(req, ctx);
        expect(res.status).toBe(404);
    });

}); 