import * as z from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';
import { stashRequest, emptyStash, onlineTestFetch, periodicChecker } from '~/services/azureFuncs';

async function createRequest (
  name: string,
  description: string
): Promise<[string, FormData]> {
  const key = await makeEncodedDeviceKey();
  const record = {
    blobType: 'deviceInitializer',
    deviceName: name,
    description: description,
    tags: [],
    children_key: '',
    hasParent: false,
    isPublicKey: false
  };

  const formData = new FormData();
  formData.append('provenanceRecord', JSON.stringify(record));
  return [key, formData];
}

function resetStashValues(): void {
  // reset the values in localStorage to avoid overlap between tests
  localStorage.setItem('stash_counter', '0');
  localStorage.setItem('gdt-stash-fulfilled', '');
  localStorage.setItem('gdt-stash-failed', '');
  localStorage.setItem('gdt-awaiting-conectivity', 'false');
}

describe('Tests to see if user is online and offline', () => {
  it('Test to see if user is online', async () => {
    let result = await onlineTestFetch();
    expect(result).toBe(true);
  });

  it('Test to see if user is offline', async () => {
    let result = await onlineTestFetch('https://www.fakeurl.com');
    expect(result).toBe(false);
  });
});

describe('Tests to see if requests can be stashed', () => {
  it('Test to see if returned data types are correct', async () => {
    resetStashValues();

    let [recordKey, formData] = await createRequest(
      'Stored Record',
      'Test record stored in localStorage then created from emptyStash()'
    );

    stashRequest(recordKey, formData);
    let requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');

    // Confirm that the datatypes are the same as they started
    const returnedKey = requestFromStash[0][1];
    const returnedFormData = JSON.parse(requestFromStash[1][1]);
    expect(typeof returnedKey).toEqual(typeof recordKey);
    expect(returnedKey).toEqual(recordKey);
    expect(JSON.stringify(returnedFormData)).toStrictEqual(formData.get('provenanceRecord'));

    // Convert returned request back to FormData (stored in localStorage as string)
    const formData2 = new FormData();
    formData2.append('provenanceRecord', JSON.stringify(returnedFormData));
    expect(formData2).toStrictEqual(formData);

    // Validate that the formData has the correct format
    const ValidFormData = z.object({
      blobType: z.string(),
      deviceName: z.string().optional(),
      description: z.string(),
      tags: z.array(z.string()),
      children_key: z.union([z.string(), z.array(z.string())]),
      hasParent: z.boolean().optional(),
      isPublicKey: z.boolean().optional()
    });
    ValidFormData.parse(returnedFormData);

    // Remove item from stash
    localStorage.removeItem('gosqas_offline_stash_1');
  });

  it('Test to see if we can store multiple requests', async () => {
    resetStashValues();

    let [recordKey1, formData1] = await createRequest('name', 'description');
    let [recordKey2, formData2] = await createRequest('name2', 'slightly longer description');

    stashRequest(recordKey1, formData1);
    stashRequest(recordKey2, formData2);

    let requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    const returnedKey = requestFromStash[0][1];
    const returnedFormData = JSON.parse(requestFromStash[1][1]);
    expect(returnedKey).toEqual(recordKey1);
    expect(JSON.stringify(returnedFormData)).toStrictEqual(formData1.get('provenanceRecord'));

    let requestFromStash2 = JSON.parse(localStorage.getItem('gosqas_offline_stash_2') || '{}');
    const returnedKey2 = requestFromStash2[0][1];
    const returnedFormData2 = JSON.parse(requestFromStash2[1][1]);
    expect(returnedKey2).toEqual(recordKey2);
    expect(JSON.stringify(returnedFormData2)).toStrictEqual(formData2.get('provenanceRecord'));

    // Check that the correct record was stored at each request
    expect(returnedFormData.deviceName).toEqual('name');
    expect(returnedFormData2.deviceName).toEqual('name2');
    expect(returnedFormData.description).toEqual('description');
    expect(returnedFormData2.description).toEqual('slightly longer description');

    // Remove items from stash
    localStorage.removeItem('gosqas_offline_stash_1');
    localStorage.removeItem('gosqas_offline_stash_2');
  });
});

describe('Tests to see if we can remove from the stash', () => {
  it('Create and remove a request', async () => {
    resetStashValues();

    // Mock fetch calls from emptyStash (since formData doesn't work from this file)
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ record: "mockRecord" }),
    } as Response);

    let [recordKey, formData] = await createRequest('stored record', 'testing emptyStash');
    stashRequest(recordKey, formData);
    expect(localStorage.getItem('stash_counter')).toEqual('1');

    // Confirm records were stored
    let requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    expect(requestFromStash).not.toEqual({});

    // Empty the stash and confirm it ran successfully
    let statusCode = await emptyStash();
    expect(statusCode).toEqual(200);

    // Make sure the record was removed from the stash and the new key was stored to display later
    expect(localStorage.getItem('stash_counter')).toEqual('0');
    expect(localStorage.getItem('gosqas_offline_stash_1')).toEqual(null);

    let existingKeys = (localStorage.getItem('gdt-stash-fulfilled') || '{}').split(',');
    expect(existingKeys).not.toEqual(['{}']);
    expect(existingKeys.length).toBe(1);
    expect(existingKeys[0]).toEqual(recordKey);

    // Remove mock
    fetchMock.mockRestore();
  });

  it('Create and remove two requests', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ record: "mockRecord" }),
    } as Response);

    resetStashValues();

    let [recordKey1, formData1] = await createRequest('first stored record', 'this is a test');
    let [recordKey2, formData2] = await createRequest('second stored record', 'this is the same test');

    stashRequest(recordKey1, formData1);
    stashRequest(recordKey2, formData2);
    expect(localStorage.getItem('stash_counter')).toEqual('2');

    // Confirm records were stored
    let requestFromStash1 = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    let requestFromStash2 = JSON.parse(localStorage.getItem('gosqas_offline_stash_2') || '{}');
    expect(requestFromStash1).not.toEqual({});
    expect(requestFromStash2).not.toEqual({});

    // Empty the stash and confirm it ran successfully
    let statusCode = await emptyStash();
    expect(statusCode).toEqual(200);

    // Confirm records were removed
    expect(localStorage.getItem('stash_counter')).toEqual('0');
    expect(localStorage.getItem('gosqas_offline_stash_1')).toEqual(null);
    expect(localStorage.getItem('gosqas_offline_stash_2')).toEqual(null);

    // Make sure all three keys (including the one from the previous test) are stored
    let existingKeys = (localStorage.getItem('gdt-stash-fulfilled') || '{}').split(',');
    expect(existingKeys).not.toEqual(['{}']);
    expect(existingKeys.length).toBe(2);
    expect(existingKeys[1]).toEqual(recordKey1);
    expect(existingKeys[0]).toEqual(recordKey2);

    fetchMock.mockRestore();
  });

  it('Try to emptyStash when nothing is stashed', async () => {
    resetStashValues();

    // Should just return when stash_counter = 0
    expect(localStorage.getItem('stash_counter')).toEqual('0');
    let statusCode = await emptyStash();
    expect(statusCode).toEqual(200);

    // Same thing should happen when stash_counter = null
    localStorage.removeItem('stash_counter');
    expect(localStorage.getItem('stash_counter')).toEqual(null);
    statusCode = await emptyStash();
    expect(statusCode).toEqual(200);
  });

  it("Make sure record is added to failed stash when post fails", async () => {
    resetStashValues();
    
    let [recordKey, formData] = await createRequest('failed record', 'this should fail to post');
    stashRequest(recordKey, formData);
    expect(localStorage.getItem('stash_counter')).toEqual('1');

    // Empty the stash without mocking (so it will fail to post since formData cannot be posted from this file)
    console.log('Attempting a failed fetch to check error handling...');
    let statusCode = await emptyStash();
    expect(statusCode).toEqual(200);

    // Make sure the record is still no longer in the stash
    const request = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    expect(request).toEqual({});
    expect(localStorage.getItem('stash_counter')).toEqual('0');

    // Confirm the failed key was added to list of failed requests
    let existingKeys = (localStorage.getItem('gdt-stash-failed') || '{}').split(',');
    expect(existingKeys).not.toEqual(['{}']);
    expect(existingKeys.length).toBe(1);
    expect(existingKeys[0]).toEqual(recordKey);

    // Confirm failed key was not added to list of successful requests
    existingKeys = (localStorage.getItem('gdt-stash-fulfilled') || '{}').split(',');
    expect(existingKeys).toEqual(['{}']);
  }, 200000);
});

describe("Tests to see if periodicChecker works", async () => {
  it ("Create a record from periodicChecker", async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ record: "mockRecord" }),
    } as Response);

    resetStashValues();

    let [recordKey, formData] = await createRequest('stored record', 'testing periodicChecker');
    stashRequest(recordKey, formData);
    expect(localStorage.getItem('stash_counter')).toEqual('1');

    // Confirm records were stored
    let requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    expect(requestFromStash).not.toEqual({});

    await periodicChecker();

    // Make sure the record was removed from the stash and the new key was stored to display later
    expect(localStorage.getItem('stash_counter')).toEqual('0');
    expect(localStorage.getItem('gosqas_offline_stash_1')).toEqual(null);
    expect(localStorage.getItem('gdt-awaiting-conectivity')).toEqual("false");

    let existingKeys = (localStorage.getItem('gdt-stash-fulfilled') || '{}').split(',');
    expect(existingKeys).not.toEqual(['{}']);
    expect(existingKeys.length).toBe(1);
    expect(existingKeys[0]).toEqual(recordKey);

    fetchMock.mockRestore();
  });

  it ("Make sure periodicChecker can run in the background", async () => {
    // Mock offline since otherwise periodicChecker will instantly return
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 500,
    } as Response);

    resetStashValues();
    
    periodicChecker();
    await new Promise((r) => setTimeout(r, 5000));

    // Confirm that the checker is still running, even after a few seconds
    expect(localStorage.getItem('gdt-awaiting-conectivity')).toEqual("true");

    fetchMock.mockRestore();
  });

  it ("Make sure only one instance of periodicChecker can run at a time", async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 500,
    } as Response);
    const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    resetStashValues();
    
    periodicChecker();
    periodicChecker();
    await new Promise((r) => setTimeout(r, 1000));

    // Confirm the "already running" message was sent and that the first call is still running
    expect(consoleMock).toHaveBeenCalledWith('Instance of periodicChecker is already running, returning');
    expect(localStorage.getItem('gdt-awaiting-conectivity')).toEqual("true");

    consoleMock.mockRestore();
    fetchMock.mockRestore();
  });
});