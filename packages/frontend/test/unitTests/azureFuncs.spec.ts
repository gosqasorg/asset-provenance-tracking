import * as z from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';
import { confirmRequestFulfilled, stashOfflineRequest, removeOfflineRequest, postProvenance, getProvenance, getProvenanceOffline } from '~/services/azureFuncs';

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
    let provenanceRecord = JSON.parse(fulfilledData.get('provenanceRecord') as string);

    // Stash the request and confirm it was successful
    stashOfflineRequest(fulfilledKey, "gdt-stash-fulfilled", provenanceRecord);

    let requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-fulfilled') || '{}');
    let fulfilledRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(1);
    expect(fulfilledRequest["key"]).toEqual(fulfilledKey);
    expect(fulfilledRequest["data"]).toStrictEqual(provenanceRecord);

    // Try to add the same record twice and confirm it wasn't added
    stashOfflineRequest(fulfilledKey, "gdt-stash-fulfilled", provenanceRecord);

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-fulfilled') || '{}');
    fulfilledRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(1);
    expect(fulfilledRequest["key"]).toEqual(fulfilledKey);
    expect(fulfilledRequest["data"]).toStrictEqual(provenanceRecord);

    // Remove the request and confirm it was successful
    removeOfflineRequest(fulfilledKey, "gdt-stash-fulfilled");

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-fulfilled') || '{}');
    fulfilledRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(0);
    expect(requestFromStash).toEqual([]);
    expect(fulfilledRequest).toBeUndefined();
  });
});

describe("postProvenance, getProvenance, and getProvenanceOffline", () => {
  it("Test postProvenance Offline Stashing", async () => {
    // Create a provenance to stash
    resetStashValues();
    let [key, data] = await createRequest(
      'postProvenance Offline Stashing Test',
      'Test to confirm postProv stashes records while offline'
    );
    let provenanceRecord = JSON.parse(data.get('provenanceRecord') as string);

    // Mock fetch to be offline and attempt to post the record
    mockFetch.mockResolvedValue(undefined);
    try {
      await postProvenance(key, provenanceRecord, []);
      expect.fail("Expected postProvenance to fail offline to test offline mode features");
    } catch (error) {
      expect(error).toEqual(new Error('Status 202: User is offline but the record has been stashed'));
    }

    // Confirm that the record was stashed and can be retreived by our other functions
    let provenance = (await getProvenance(key))[0] || {record: ""};
    let requestsFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '{}');
    let stashedProvenance = requestsFromStash[0];
    expect(requestsFromStash.length).toEqual(1);
    expect(stashedProvenance["key"]).toEqual(key);
    expect(provenance["record"]).toStrictEqual(provenanceRecord);
    expect(stashedProvenance["data"]).toStrictEqual(provenanceRecord);
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
      expect.fail("Expected getProvenance to fail offline to test offline mode features", provenance);
    } catch (error) {
      expect(error).toEqual(new Error('Could not connect to the server, check your internet connection and try again'));
    }
    
    // Stash the record and confirm getProvenance now returns it, even while offline
    stashOfflineRequest(key, "gdt-stash-queued", provenanceRecord);

    let provenance = (await getProvenance(key))[0] || {record: ""};
    let requestsFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '{}');
    let stashedProvenance = requestsFromStash[0];
    expect(requestsFromStash.length).toEqual(1);
    expect(stashedProvenance["key"]).toEqual(key);
    expect(provenance["record"]).toStrictEqual(provenanceRecord);
    expect(stashedProvenance["data"]).toStrictEqual(provenanceRecord);
  });

  it("Test getProvenanceOffline", async () => {
    // Create a provenance to stash
    resetStashValues();
    let [key, data] = await createRequest(
      'getProvenanceOffline Test',
      'Test for the getProvenanceOffline function'
    );
    let provenanceRecord = JSON.parse(data.get('provenanceRecord') as string);

    // Stash the provenance and confirm getProvenanceOffline can retreive it
    stashOfflineRequest(key, "gdt-stash-queued", provenanceRecord);
    let stashedProvenance = getProvenanceOffline(key);
    let stashedRecord = stashedProvenance[0] || {record: ""};
    expect(stashedProvenance.length).toBe(1);
    expect(stashedRecord["record"]).toStrictEqual(provenanceRecord);

    // Add a second record to the provenance (wait a few seconds so the timestamp isn't identical)
    await new Promise((r) => setTimeout(r, 1000));
    const provenanceRecord2 = {
      blobType: 'deviceInitializer',
      deviceName: 'getProvenanceOffline Test 2',
      description: 'Test for multiple records in the getProvenanceOffline function',
      tags: [],
      children_key: '',
      hasParent: false,
      isPublicKey: false
    };

    // Stash the new provenance and confirm getProvenanceOffline can retreive both of them
    stashOfflineRequest(key, "gdt-stash-queued", provenanceRecord2);
    stashedProvenance = getProvenanceOffline(key);
    stashedRecord = stashedProvenance[1] || {record: ""};
    let stashedRecord2 = stashedProvenance[0] || {record: ""};
    expect(stashedProvenance.length).toBe(2);
    expect(stashedRecord["record"]).toStrictEqual(provenanceRecord);
    expect(stashedRecord2["record"]).toStrictEqual(provenanceRecord2);

    // Attempt to get a provenance that was not stashed and confirm it returns nothing
    stashedProvenance = getProvenanceOffline("123456789101112asdfghi");
    expect(stashedProvenance).toEqual([]);

    stashedProvenance = getProvenanceOffline("invalidKey");
    expect(stashedProvenance).toEqual([]);
  });
});