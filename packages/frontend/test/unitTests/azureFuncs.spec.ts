import * as z from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';
import { confirmRequestFulfilled, stashOfflineRequest, removeOfflineRequest, postProvenance, getProvenance, offlineGetProvenance } from '~/services/azureFuncs';

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
  localStorage.removeItem('gdt-stash-queued');
  localStorage.removeItem('gdt-stash-failed');
  localStorage.removeItem('gdt-stash-fulfilled');
  localStorage.removeItem('gdt-stash-provenance')
}

// Mock global fetch so a real network request isn't made when fetch is called in functions to be tested
const mockFetch = vi.fn();
global.fetch = mockFetch

describe("Offline Function Tests", () => {
    it("Test to confirmRequestFulfilled for new record and record entry created offline", async () => {
      const mockRecord = [{record: {description: 'mockRecord'}}];
      mockFetch.mockResolvedValue({ok: true, status: 200,json: () => Promise.resolve(mockRecord)})

      const record = {description : 'mockRecord'}
      const resultEntryAddition = await confirmRequestFulfilled('123456789101112asdfghi', record)
      const resultNewRecord = await confirmRequestFulfilled('123456789101112asdfghi')

      expect(resultEntryAddition).toBe(true)
      expect(resultNewRecord).toBe(true)
    })
});

describe("Stash and Remove Offline Requests", () => {
  it("Stash and Remove from Queue Stash", async () => {
    resetStashValues();
    let [queuedKey, queuedData] = await createRequest(
      'Queued Record',
      'Test for queue stash'
    );
    let provenanceRecord = JSON.parse(queuedData.get('provenanceRecord') as string);

    // Stash the request and confirm it was successful
    stashOfflineRequest(queuedKey, "gdt-stash-queued", provenanceRecord);

    let requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '{}');
    let queuedRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(1);
    expect(queuedRequest["key"]).toEqual(queuedKey);
    expect(queuedRequest["data"]).toStrictEqual(provenanceRecord);

    // Try to add the same record twice and confirm it wasn't added
    stashOfflineRequest(queuedKey, "gdt-stash-queued", provenanceRecord);

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '{}');
    queuedRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(1);
    expect(queuedRequest["key"]).toEqual(queuedKey);
    expect(queuedRequest["data"]).toStrictEqual(provenanceRecord);

    // Remove the request and confirm it was successful
    removeOfflineRequest(queuedKey, "gdt-stash-queued");

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '{}');
    queuedRequest = requestFromStash[0];
    expect(requestFromStash).toEqual([]);
    expect(queuedRequest).toBeUndefined();
  });

  it("Stash and Remove 2 Requests from Failed Stash", async () => {
    resetStashValues();
    let [failedKey, failedData] = await createRequest(
      'Failed Record',
      'Test for failed stash'
    );
    let [failedKey2, failedData2] = await createRequest(
      'Failed Record 2',
      'Second test for failed stash'
    );
    let provenanceRecord = JSON.parse(failedData.get('provenanceRecord') as string);
    let provenanceRecord2 = JSON.parse(failedData2.get('provenanceRecord') as string);

    // Stash 2 failed requests and confirm both were successfully stored
    stashOfflineRequest(failedKey, "gdt-stash-failed", provenanceRecord);
    stashOfflineRequest(failedKey2, "gdt-stash-failed", provenanceRecord2);

    let requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-failed') || '{}');
    let failedRequest = requestFromStash[0];
    let failedRequest2 = requestFromStash[1];
    expect(requestFromStash.length).toEqual(2);
    expect(failedRequest["key"]).toEqual(failedKey);
    expect(failedRequest2["key"]).toEqual(failedKey2);
    expect(failedRequest["data"]).toStrictEqual(provenanceRecord);
    expect(failedRequest2["data"]).toStrictEqual(provenanceRecord2);

    // Remove both failed requests and confirm they were successfully removed
    removeOfflineRequest(failedKey, "gdt-stash-failed");

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-failed') || '{}');
    failedRequest = requestFromStash[0];
    // First request was removed, so the new first request should be failedKey2/failedData2
    expect(requestFromStash.length).toEqual(1);
    expect(failedRequest["key"]).toEqual(failedKey2);
    expect(failedRequest["data"]).toStrictEqual(provenanceRecord2);

    removeOfflineRequest(failedKey2, "gdt-stash-failed");

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-failed') || '{}');
    failedRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(0);
    expect(failedRequest).toBeUndefined();
  });

  it("Stash and Remove from Fulfilled Stash", async () => {
    resetStashValues();
    let [fulfilledKey, fulfilledData] = await createRequest(
      'Fulfilled Record',
      'Test for fulfilled stash'
    );

    // Stash the request and confirm it was successful
    stashOfflineRequest(fulfilledKey, "gdt-stash-fulfilled");

    let requestFromStash = localStorage.getItem('gdt-stash-fulfilled') || '';
    let fulfilledKeys = requestFromStash.split(",");
    let returnedKey = fulfilledKeys[0];
    expect(fulfilledKeys.length).toEqual(1);
    expect(returnedKey).toEqual(fulfilledKey);

    // Try to add the same record twice and confirm it wasn't added
    stashOfflineRequest(fulfilledKey, "gdt-stash-fulfilled");

    requestFromStash = localStorage.getItem('gdt-stash-fulfilled') || '';
    fulfilledKeys = requestFromStash.split(",");
    returnedKey = fulfilledKeys[0];
    expect(fulfilledKeys.length).toEqual(1);
    expect(returnedKey).toEqual(fulfilledKey);

    // Remove the request and confirm it was successful
    removeOfflineRequest(fulfilledKey, "gdt-stash-fulfilled");

    requestFromStash = localStorage.getItem('gdt-stash-fulfilled') || '';
    fulfilledKeys = requestFromStash.split(",");
    returnedKey = fulfilledKeys[0];
    expect(requestFromStash).toEqual('');
    expect(returnedKey).toEqual('');
  });
});

describe("getProvenance and offlineGetProvenance", () => {
  it("Test getProvenance Stashing", async () => {
    // Create a provenance to stash
    resetStashValues();
    let [key, data] = await createRequest(
      'getProvenance Test',
      'Test for the getProvenance function\'s offline features'
    );
    let provenanceRecord = JSON.parse(data.get('provenanceRecord') as string);

    // Mock fetch, then "post" the record
    mockFetch.mockResolvedValue({ok: true, status: 200,json: () => Promise.resolve(provenanceRecord)})
    await postProvenance(key, provenanceRecord, []);
    
    // Call getProvenance on our new key and confirm it stashes the provenance records
    let provenance = await getProvenance(key);
    let requestsFromStash = JSON.parse(localStorage.getItem('gdt-stash-provenance') || '{}');
    let stashedProvenance = requestsFromStash[0];
    expect(requestsFromStash.length).toEqual(1);
    expect(stashedProvenance["key"]).toEqual(key);
    expect(provenance).toStrictEqual(provenanceRecord);
    expect(stashedProvenance["provenance"]).toStrictEqual(provenanceRecord);

    // Add a second record to the provenance
    let [key2, data2] = await createRequest(
      'getProvenance Test',
      'Test to confirm getProvenance correctly updates provenance history'
    );
    let provenanceRecord2 = JSON.parse(data2.get('provenanceRecord') as string);

    mockFetch.mockResolvedValue({ok: true, status: 200,json: () => Promise.resolve([provenanceRecord, provenanceRecord2])})
    await postProvenance(key, provenanceRecord2, []);
    
    // Call getProvenance on our key and confirm the stash has been updated
    provenance = await getProvenance(key);
    requestsFromStash = JSON.parse(localStorage.getItem('gdt-stash-provenance') || '{}');
    stashedProvenance = requestsFromStash[0];
    expect(requestsFromStash.length).toEqual(1); // length is still 1 since we're just replacing the provenance
    expect(stashedProvenance["key"]).toEqual(key);
    expect(provenance).toStrictEqual([provenanceRecord, provenanceRecord2]);
    expect(stashedProvenance["provenance"]).toStrictEqual([provenanceRecord, provenanceRecord2]);
  });

  it("Test getProvenance Offline Mode", async () => {
    // Create a provenance to stash
    resetStashValues();
    let [key, data] = await createRequest(
      'getProvenance Offline Mode Test',
      'Test for the getProvenance\'s offline mode'
    );
    let provenanceRecord = JSON.parse(data.get('provenanceRecord') as string);

    // Mock fetch, "post" the record, then mock offline
    mockFetch.mockResolvedValue({ok: true, status: 200,json: () => Promise.resolve(provenanceRecord)});
    await postProvenance(key, provenanceRecord, []);
    mockFetch.mockResolvedValue(undefined);

    // Call getProvenance without stashing and confirm it throws an error as usual
    try {
      let provenance = await getProvenance(key);
      expect.fail("Expected getProvenance to fail offline to test offline mode features");
    } catch (error) {
      expect(error).toEqual(new Error('Could not connect to the server, check your internet connection and try again'));
    }
    
    // Stash the record and confirm getProvenance now returns it, even while offline
    stashOfflineRequest(key, "gdt-stash-provenance", provenanceRecord);

    let provenance = await getProvenance(key);
    let requestsFromStash = JSON.parse(localStorage.getItem('gdt-stash-provenance') || '{}');
    let stashedProvenance = requestsFromStash[0];
    expect(requestsFromStash.length).toEqual(1);
    expect(stashedProvenance["key"]).toEqual(key);
    expect(provenance).toStrictEqual(provenanceRecord);
    expect(stashedProvenance["provenance"]).toStrictEqual(provenanceRecord);
  });

  it("Test offlineGetProvenance", async () => {
    // Create a provenance to stash
    resetStashValues();
    let [key, data] = await createRequest(
      'offlineGetProvenance Test',
      'Test for the offlineGetProvenance function'
    );
    let provenanceRecord = JSON.parse(data.get('provenanceRecord') as string);

    // Stash the provenance and confirm offlineGetProvenance can retreive it
    stashOfflineRequest(key, "gdt-stash-provenance", provenanceRecord);
    let stashedProvenance = await offlineGetProvenance(key);
    expect(stashedProvenance).toStrictEqual(provenanceRecord);

    // Attempt to get a provenance that was not stashed and confirm it returns nothing
    stashedProvenance = await offlineGetProvenance("123456789101112asdfghi");
    expect(stashedProvenance).toBeUndefined();

    stashedProvenance = await offlineGetProvenance("invalidKey");
    expect(stashedProvenance).toBeUndefined();
  });
});