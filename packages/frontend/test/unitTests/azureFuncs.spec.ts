import * as z from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';
import { stashOfflineRequest, removeOfflineRequest, getFirstQueueItem, removeFirstQueueItem } from '~/services/azureFuncs';

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
  localStorage.setItem('gdt-stash-queued', '');
  localStorage.setItem('gdt-stash-failed', '');
  localStorage.setItem('gdt-stash-fulfilled', '');
}

describe("Stash and Remove Offline Requests", () => {
  it("Stash and Remove from Queue Stash", async () => {
    resetStashValues();
    let [queuedKey, queuedData] = await createRequest(
      'Queued Record',
      'Test for queue stash'
    );

    // Stash the request and confirm it was successful
    stashOfflineRequest(queuedKey, "gdt-stash-queued", queuedData.get('provenanceRecord'));

    let requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '{}');
    let queuedRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(1);
    expect(queuedRequest["key"]).toEqual(queuedKey);
    expect(queuedRequest["data"]).toStrictEqual(queuedData.get('provenanceRecord'));

    // Try to add the same record twice and confirm it wasn't added
    stashOfflineRequest(queuedKey, "gdt-stash-queued", queuedData.get('provenanceRecord'));

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '{}');
    queuedRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(1);
    expect(queuedRequest["key"]).toEqual(queuedKey);
    expect(queuedRequest["data"]).toStrictEqual(queuedData.get('provenanceRecord'));

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

    // Stash 2 failed requests and confirm both were successfully stored
    stashOfflineRequest(failedKey, "gdt-stash-failed", failedData.get('provenanceRecord'));
    stashOfflineRequest(failedKey2, "gdt-stash-failed", failedData2.get('provenanceRecord'));

    let requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-failed') || '{}');
    let failedRequest = requestFromStash[0];
    let failedRequest2 = requestFromStash[1];
    expect(requestFromStash.length).toEqual(2);
    expect(failedRequest["key"]).toEqual(failedKey);
    expect(failedRequest2["key"]).toEqual(failedKey2);
    expect(failedRequest["data"]).toStrictEqual(failedData.get('provenanceRecord'));
    expect(failedRequest2["data"]).toStrictEqual(failedData2.get('provenanceRecord'));

    // Remove both failed requests and confirm they were successfully removed
    removeOfflineRequest(failedKey, "gdt-stash-failed");

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-failed') || '{}');
    failedRequest = requestFromStash[0];
    // First request was removed, so the new first request should be failedKey2/failedData2
    expect(requestFromStash.length).toEqual(1);
    expect(failedRequest["key"]).toEqual(failedKey2);
    expect(failedRequest["data"]).toStrictEqual(failedData2.get('provenanceRecord'));

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

describe("Get/Remove First Queued Request", async() => {
  it("Get First Queued Request", async() => {
    resetStashValues();

    // Attempt to get a request when none are in the queue and confirm there's no error
    let firstQueueItem = getFirstQueueItem();
    expect(firstQueueItem).toBeUndefined();

    // Attempt to get the only request in the queue
    let [queuedKey, queuedData] = await createRequest('Queued Record', 'Test record for getFirstQueueItem');
    let [queuedKey2, queuedData2] = await createRequest('Queued Record 2', 'Second test record for getFirstQueueItem');

    stashOfflineRequest(queuedKey, "gdt-stash-queued", queuedData.get('provenanceRecord'));
    firstQueueItem = getFirstQueueItem();

    expect(firstQueueItem["key"]).toEqual(queuedKey);
    expect(firstQueueItem["data"]).toEqual(queuedData.get('provenanceRecord'));

    // Attempt to get the first request of multiple and confirm we got the correct one
    stashOfflineRequest(queuedKey2, "gdt-stash-queued", queuedData2.get('provenanceRecord'));
    firstQueueItem = getFirstQueueItem();

    expect(firstQueueItem["key"]).toEqual(queuedKey);
    expect(firstQueueItem["data"]).toEqual(queuedData.get('provenanceRecord'));
    expect(firstQueueItem["key"]).not.toEqual(queuedKey2);
    expect(firstQueueItem["data"]).not.toEqual(queuedData2.get('provenanceRecord'));
  });

  it("Remove First Queued Request", async() => {
    resetStashValues();

    // Attempt to remove a request when none are in the queue and confirm there's no error
    removeFirstQueueItem();
    let firstQueueItem = getFirstQueueItem(); // todo is this how we want to test this one..?
    expect(firstQueueItem).toBeUndefined();

    // Attempt to remove the only request in the queue
    let [queuedKey, queuedData] = await createRequest('Queued Record', 'Test record for getFirstQueueItem');
    let [queuedKey2, queuedData2] = await createRequest('Queued Record 2', 'Second test record for getFirstQueueItem');

    stashOfflineRequest(queuedKey, "gdt-stash-queued", queuedData.get('provenanceRecord'));
    removeFirstQueueItem();
    firstQueueItem = getFirstQueueItem();
    expect(firstQueueItem).toBeUndefined();

    // Attempt to remove the first request of multiple and confirm we removed the correct one
    stashOfflineRequest(queuedKey, "gdt-stash-queued", queuedData.get('provenanceRecord'));
    stashOfflineRequest(queuedKey2, "gdt-stash-queued", queuedData2.get('provenanceRecord'));
    removeFirstQueueItem();
    firstQueueItem = getFirstQueueItem();

    expect(firstQueueItem["key"]).not.toEqual(queuedKey);
    expect(firstQueueItem["data"]).not.toEqual(queuedData.get('provenanceRecord'));
    expect(firstQueueItem["key"]).toEqual(queuedKey2);
    expect(firstQueueItem["data"]).toEqual(queuedData2.get('provenanceRecord'));
  });
})