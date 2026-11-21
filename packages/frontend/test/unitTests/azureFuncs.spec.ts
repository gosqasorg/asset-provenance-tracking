import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';
import { getAttachment, getProvenanceOffline, confirmRequestFulfilled, stashOfflineRequest, removeOfflineRequest, getFirstQueueItem, removeFirstQueueItem, postProvenance, getProvenance, updateOfflineFeatureFlag, offlineQueueConsumerWorker } from '~/services/azureFuncs';
import OfflineEdits from '~/pages/offline-edits.vue';
import Index from '~/pages/index.vue';
import CreateDevice from '~/components/Forms/CreateDevice.vue';

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

async function createGroupRequest (
  name: string,
  description: string
): Promise<[string, FormData]> {
  const key = await makeEncodedDeviceKey();
  const record = {
    blobType: 'deviceInitializer',
    deviceName: name,
    description: description,
    tags: [],
    children_key: [],
    children_name: [],
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

describe("Button Click Experiment", () => {
  // Note: These test use the vue test utils to interact with page elements
  it("Click Button and Detect Page Change", async () => {
    // Mock and spy on the router's push function
    const mockPush = vi.fn();

    // Mount the component with the mocked router (wrapper lets us interact with the page)
    const wrapper = mount(Index, {
      global: {
        stubs: ['RouterLink'], // Replaces RouterLink with a dummy so it doesn't attempt to load
        mocks: {
          $router: { push: mockPush },
          $route: { path: '/' }
        }
      }
    });

    // Grab the 'view our pilot program' button and click it
    await wrapper.find('#latest-news-button').trigger('click');

    // Confirm the button attempted to navigate to the correct page
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/dmdm');
  });

  it("Click Checkbox and Detect Visual Change", async () => {
    // Mock and spy on the router's push function
    const mockPush = vi.fn();
    const wrapper = mount(CreateDevice, {
      global: {
        stubs: ['RouterLink'],
        mocks: {
          $router: { push: mockPush },
          $route: { path: '/gdt' }
        }
      }
    });

    // Confirm the email input section is hidden
    expect(wrapper.find('#feedback-email-input').exists()).toBe(false);

    // 'Click' on the checkbox
    await wrapper.find('#notify-all').setValue(true);

    // Confirm the email input section appears
    expect(wrapper.find('#feedback-email-input').exists()).toBe(true);
  });
});

// Mock global fetch so a real network request isn't made when fetch is called in functions to be tested
// And disable the feature flag
const mockFetch = vi.fn();
global.fetch = mockFetch
updateOfflineFeatureFlag(true);

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

// test for the getAttachment function
describe("getAttachment decoding", () => {
    it('decodes encoded attachment header correctly', async () => {
    const originalName = '🎲.png';
    mockFetch.mockResolvedValue({
      headers: new Headers({'Attachment-Name': encodeURIComponent(originalName)}),
      blob: () => Promise.resolve(new Blob(['data'], { type: 'image/png' }))
    });

    const key = await makeEncodedDeviceKey();
    const result = await getAttachment('http://test', key, 'testid');

    expect(result.fileName).toBe(originalName);
    
  });

})

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

    let requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '[]');
    let queuedRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(1);
    expect(queuedRequest["key"]).toEqual(queuedKey);
    expect(queuedRequest["data"]).toStrictEqual(provenanceRecord);

    // Try to add the same record twice and confirm it wasn't added
    stashOfflineRequest(queuedKey, "gdt-stash-queued", provenanceRecord);

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '[]');
    queuedRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(1);
    expect(queuedRequest["key"]).toEqual(queuedKey);
    expect(queuedRequest["data"]).toStrictEqual(provenanceRecord);

    // Remove the request and confirm it was successful
    removeOfflineRequest(queuedRequest, "gdt-stash-queued");

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '[]');
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

    let requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-failed') || '[]');
    let failedRequest = requestFromStash[0];
    let failedRequest2 = requestFromStash[1];
    expect(requestFromStash.length).toEqual(2);
    expect(failedRequest["key"]).toEqual(failedKey);
    expect(failedRequest2["key"]).toEqual(failedKey2);
    expect(failedRequest["data"]).toStrictEqual(provenanceRecord);
    expect(failedRequest2["data"]).toStrictEqual(provenanceRecord2);

    // Remove both failed requests and confirm they were successfully removed
    removeOfflineRequest(failedRequest, "gdt-stash-failed");

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-failed') || '[]');
    failedRequest = requestFromStash[0];
    // First request was removed, so the new first request should be failedKey2/failedData2
    expect(requestFromStash.length).toEqual(1);
    expect(failedRequest["key"]).toEqual(failedKey2);
    expect(failedRequest["data"]).toStrictEqual(provenanceRecord2);

    removeOfflineRequest(failedRequest2, "gdt-stash-failed");

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-failed') || '[]');
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

    let requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-fulfilled') || '[]');
    let fulfilledRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(1);
    expect(fulfilledRequest["key"]).toEqual(fulfilledKey);
    expect(fulfilledRequest["data"]).toStrictEqual(provenanceRecord);

    // Try to add the same record twice and confirm it wasn't added
    stashOfflineRequest(fulfilledKey, "gdt-stash-fulfilled", provenanceRecord);

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-fulfilled') || '[]');
    fulfilledRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(1);
    expect(fulfilledRequest["key"]).toEqual(fulfilledKey);
    expect(fulfilledRequest["data"]).toStrictEqual(provenanceRecord);

    // Remove the request and confirm it was successful
    removeOfflineRequest(fulfilledRequest, "gdt-stash-fulfilled");

    requestFromStash = JSON.parse(localStorage.getItem('gdt-stash-fulfilled') || '{}');
    fulfilledRequest = requestFromStash[0];
    expect(requestFromStash.length).toEqual(0);
    expect(requestFromStash).toEqual([]);
    expect(fulfilledRequest).toBeUndefined();
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
    let provenanceRecord = JSON.parse(queuedData.get('provenanceRecord') as string);
    let provenanceRecord2 = JSON.parse(queuedData2.get('provenanceRecord') as string);

    stashOfflineRequest(queuedKey, "gdt-stash-queued", provenanceRecord);
    firstQueueItem = getFirstQueueItem();

    expect(firstQueueItem["key"]).toEqual(queuedKey);
    expect(firstQueueItem["data"]).toEqual(provenanceRecord);

    // Attempt to get the first request of multiple and confirm we got the correct one
    stashOfflineRequest(queuedKey2, "gdt-stash-queued", provenanceRecord2);
    firstQueueItem = getFirstQueueItem();

    expect(firstQueueItem["key"]).toEqual(queuedKey);
    expect(firstQueueItem["data"]).toEqual(provenanceRecord);
    expect(firstQueueItem["key"]).not.toEqual(queuedKey2);
    expect(firstQueueItem["data"]).not.toEqual(provenanceRecord2);
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
    let requestsFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '[]');
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
    let requestsFromStash = JSON.parse(localStorage.getItem('gdt-stash-queued') || '[]');
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

describe("Create Records/Groups Offline", async () => {
  // Manually call the worker and wait for it to start (takes 15 seconds to start, rest of the time is in the tests)
  offlineQueueConsumerWorker();
  await new Promise((r) => setTimeout(r, 10000));

  it ("Create Multiple Records/Groups While Offline", async () => {
    resetStashValues();
    mockFetch.mockResolvedValue(undefined);

    // Create two records
    const offlineRequests = [];
    let [recordKey, recordData] = await createRequest(
      'Offline Records Test',
      '1: Test to see if we can create multiple records while offline'
    );
    let [recordKey2, recordData2] = await createRequest(
      'Offline Records Test 2',
      '2: Test to see if we can create multiple records while offline'
    );
    let provenanceRecord = JSON.parse(recordData.get('provenanceRecord') as string);
    let provenanceRecord2 = JSON.parse(recordData2.get('provenanceRecord') as string);
    offlineRequests.push({"key": recordKey, "data": provenanceRecord});
    offlineRequests.push({"key": recordKey2, "data": provenanceRecord2});

    // Create two groups
    let [groupKey, groupData] = await createGroupRequest(
      'Offline Groups Test',
      '1: Test to see if we can create multiple groups while offline'
    );
    let [groupKey2, groupData2] = await createGroupRequest(
      'Offline Groups Test 2',
      '2: Test to see if we can create multiple groups while offline'
    );
    let provenanceGroup = JSON.parse(groupData.get('provenanceRecord') as string);
    let provenanceGroup2 = JSON.parse(groupData2.get('provenanceRecord') as string);
    offlineRequests.push({"key": groupKey, "data": provenanceGroup});
    offlineRequests.push({"key": groupKey2, "data": provenanceGroup2});

    // Attempt to post the records and groups while offline
    for (let request of offlineRequests) {
      try {
        await postProvenance(request["key"], request["data"], []);
        expect.fail("Expected postProvenance to fail offline to test offline mode features");
      } catch (error) {
        expect(error).toEqual(new Error('Status 202: User is offline but the record has been stashed'));
      }
    }

    // Confirm the records and groups are now stored in the queue stash
    let requestsFromQueue = JSON.parse(localStorage.getItem('gdt-stash-queued') || '[]');
    expect(requestsFromQueue.length).toEqual(4);

    let stashedRecordRequest = requestsFromQueue[0];
    let stashedRecordRequest2 = requestsFromQueue[1];
    expect(stashedRecordRequest["key"]).toEqual(recordKey);
    expect(stashedRecordRequest["data"]).toStrictEqual(provenanceRecord);
    expect(stashedRecordRequest2["key"]).toEqual(recordKey2);
    expect(stashedRecordRequest2["data"]).toStrictEqual(provenanceRecord2);

    let stashedGroupRequest = requestsFromQueue[2];
    let stashedGroupRequest2 = requestsFromQueue[3];
    expect(stashedGroupRequest["key"]).toEqual(groupKey);
    expect(stashedGroupRequest["data"]).toStrictEqual(provenanceGroup);
    expect(stashedGroupRequest2["key"]).toEqual(groupKey2);
    expect(stashedGroupRequest2["data"]).toStrictEqual(provenanceGroup2);

    // Go back online and wait for the worker to create the records/groups
    mockFetch.mockResolvedValue({ok: true, status: 200, json: () => Promise.resolve(provenanceRecord)});
    await new Promise((r) => setTimeout(r, 6000));

    // Confirm the records/groups are no longer in the queue stash
    requestsFromQueue = JSON.parse(localStorage.getItem('gdt-stash-queued') || '[]');
    expect(requestsFromQueue.length).toEqual(0);

    // Confirm the records/groups are in the fulfilled stash
    let fulfilledKeys = JSON.parse(localStorage.getItem('gdt-stash-fulfilled'))
    expect(fulfilledKeys.length).toEqual(4);

    let fulfilledRecordKey = fulfilledKeys[0];
    let fulfilledRecordKey2 = fulfilledKeys[1];
    expect(fulfilledRecordKey.key).toEqual(recordKey);   // <<---- This line
    expect(fulfilledRecordKey2.key).toEqual(recordKey2);

    let fulfilledGroupKey = fulfilledKeys[2];
    let fulfilledGroupKey2 = fulfilledKeys[3];
    expect(fulfilledGroupKey.key).toEqual(groupKey);
    expect(fulfilledGroupKey2.key).toEqual(groupKey2);
  });

  it ("Fail To Create Records/Groups While Offline", async () => {
    resetStashValues();
    mockFetch.mockResolvedValue(undefined);

    // Create two records
    const offlineRequests = [];
    let [recordKey, recordData] = await createRequest(
      'Offline Failed Records Test',
      '1: Test to see if records that fail from the queue are moved to the failed stash'
    );
    let [recordKey2, recordData2] = await createRequest(
      'Offline Failed Records Test 2',
      '2: Test to see if records that fail from the queue are moved to the failed stash'
    );
    let provenanceRecord = JSON.parse(recordData.get('provenanceRecord') as string);
    let provenanceRecord2 = JSON.parse(recordData2.get('provenanceRecord') as string);
    offlineRequests.push({"key": recordKey, "data": provenanceRecord});
    offlineRequests.push({"key": recordKey2, "data": provenanceRecord2});

    // Create two groups
    let [groupKey, groupData] = await createGroupRequest(
      'Offline Failed Groups Test',
      '1: Test to see if groups that fail from the queue are moved to the failed stash'
    );
    let [groupKey2, groupData2] = await createGroupRequest(
      'Offline Failed Groups Test 2',
      '2: Test to see if groups that fail from the queue are moved to the failed stash'
    );
    let provenanceGroup = JSON.parse(groupData.get('provenanceRecord') as string);
    let provenanceGroup2 = JSON.parse(groupData2.get('provenanceRecord') as string);
    offlineRequests.push({"key": groupKey, "data": provenanceGroup});
    offlineRequests.push({"key": groupKey2, "data": provenanceGroup2});

    // Attempt to post the records and groups while offline
    for (let request of offlineRequests) {
      try {
        await postProvenance(request["key"], request["data"], []);
        expect.fail("Expected postProvenance to fail offline to test offline mode features");
      } catch (error) {
        expect(error).toEqual(new Error('Status 202: User is offline but the record has been stashed'));
      }
    }

    // Confirm the records and groups are now stored in the queue stash
    let requestsFromQueue = JSON.parse(localStorage.getItem('gdt-stash-queued') || '[]');
    expect(requestsFromQueue.length).toEqual(4);

    let stashedRecordRequest = requestsFromQueue[0];
    let stashedRecordRequest2 = requestsFromQueue[1];
    expect(stashedRecordRequest["key"]).toEqual(recordKey);
    expect(stashedRecordRequest["data"]).toStrictEqual(provenanceRecord);
    expect(stashedRecordRequest2["key"]).toEqual(recordKey2);
    expect(stashedRecordRequest2["data"]).toStrictEqual(provenanceRecord2);

    let stashedGroupRequest = requestsFromQueue[2];
    let stashedGroupRequest2 = requestsFromQueue[3];
    expect(stashedGroupRequest["key"]).toEqual(groupKey);
    expect(stashedGroupRequest["data"]).toStrictEqual(provenanceGroup);
    expect(stashedGroupRequest2["key"]).toEqual(groupKey2);
    expect(stashedGroupRequest2["data"]).toStrictEqual(provenanceGroup2);

    // Go back online, mock post failure, then wait for the worker to attempt to create the records/groups
    mockFetch.mockResolvedValue({ok: false, status: 500});
    await new Promise((r) => setTimeout(r, 6000));

    // Confirm the records/groups are no longer in the queue stash
    requestsFromQueue = JSON.parse(localStorage.getItem('gdt-stash-queued') || '[]');
    expect(requestsFromQueue.length).toEqual(0);

    // Confirm the records/groups are in the failed stash and not the fulfilled stash
    let fulfilledKeys = localStorage.getItem('gdt-stash-fulfilled');
    expect(fulfilledKeys).toBeNull();
    let failedRequests = JSON.parse(localStorage.getItem('gdt-stash-failed') || '[]');
    expect(failedRequests.length).toEqual(4);

    let failedRecord = failedRequests[0];
    let failedRecord2 = failedRequests[1];
    expect(failedRecord["key"]).toEqual(recordKey);
    expect(failedRecord["data"]).toStrictEqual(provenanceRecord);
    expect(failedRecord2["key"]).toEqual(recordKey2);
    expect(failedRecord2["data"]).toStrictEqual(provenanceRecord2);

    let failedGroup = failedRequests[2];
    let failedGroup2 = failedRequests[3];
    expect(failedGroup["key"]).toEqual(groupKey);
    expect(failedGroup["data"]).toStrictEqual(provenanceGroup);
    expect(failedGroup2["key"]).toEqual(groupKey2);
    expect(failedGroup2["data"]).toStrictEqual(provenanceGroup2);
  });
});

describe("Confirm offline edits page buttons do not interrupt the worker", async() => {
  // Clear localStorage mock data before each test
  beforeEach(() => {
    localStorage.clear()
  });

  it("Dismiss all edits, Dismiss published edits, and Dismiss edit buttons", async() => {

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Mock fetch once to post the record after a delay (so we have time to click buttons before the record is done creating)
    const mockRecord = [{record: {blobType: 'deviceInitializer'}}];
    mockFetch.mockImplementationOnce(async () => {
      await delay(3000);
      return {
        json: () => Promise.resolve(mockRecord)
      }
    })

    // Mock fetch to get the mocked record without a delay
    mockFetch.mockResolvedValue({ok: true, status: 200, json: () => Promise.resolve(mockRecord)});

    // Put fulfilled, failed, and queued keys into localStorage for the wrapper to mount
    localStorage.setItem("gdt-stash-fulfilled",
      JSON.stringify([
        {key: "fulfilledKey1",
        data:{
          deviceName: "Test Fulfilled Record",
          description: "Fulfilled record for testing offline edits buttons with worker"
        }},
        {key: "fulfilledKey2",
        data:{
          deviceName: "Test Fulfilled Record 2",
          description: "2nd fulfilled record for testing offline edits buttons with worker"
        }}
      ])
    );

    localStorage.setItem("gdt-stash-failed",
      JSON.stringify([{
        key: "failedKey1",
        data:{
          deviceName: "Test Failed Record",
          description: "Failed record for testing offline edits buttons with worker"
        }
      }])
    );

    localStorage.setItem("gdt-stash-queued",
      JSON.stringify([{
        key: "queuedKey1",
        data:{
          deviceName: "Test Record",
          description: "Record for testing offline edits buttons with worker"
        }
      }])
    );

    // Mount component so wrapper can render the component (Dismiss all edits button, dismiss published edits button, and dismiss edit button)
    const wrapper = mount(OfflineEdits);
    await delay(100)  // Wait for the page to load

    // Calling worker without await so it can run in the background, the wait after is to make sure the worker has started running
    offlineQueueConsumerWorker();
    await vi.waitFor(() => expect(mockFetch).toHaveBeenCalled(), { timeout: 10000, interval: 50 });

    // Click on all the dismiss buttons while the worker is in the process of creating our queued record
    // Click on 'Dismiss edit' button to clear that specific published edit
    await wrapper.find('#offline-edits-container > div:nth-of-type(3) > .key-box > button:nth-of-type(2)').trigger('click');

    // Click 'Dismiss edit' button again to confirm
    await wrapper.find('.confirm-dismiss').trigger('click');

    // Test to check if 'Dismiss one edit' button is working along with confirmation button after worker started
    expect(JSON.parse(localStorage.getItem('gdt-stash-fulfilled'))).toEqual([
      {
        key: "fulfilledKey2",
        data:{
          deviceName: "Test Fulfilled Record 2",
          description: "2nd fulfilled record for testing offline edits buttons with worker"
        }
      }
    ]);

    // Click on the 'Dismiss published edits' button
    await wrapper.find('button.dismiss:nth-child(4)').trigger('click');
    // Click 'Dismiss published edits' button again to confirm
    await wrapper.find('.confirm-dismiss').trigger('click');

    // Test to see if published edits stash is empty after 'Dismiss published edits' button was clicked
    expect(localStorage.getItem('gdt-stash-fulfilled')).toBe(null)

    // Click on the 'Dismiss all edits' button, then the confirmation button afterwards to clear all stashes
    await wrapper.find('button.dismiss:nth-child(3)').trigger('click');
    // Click on the 'Dismiss all edits' button again to confirm
    await wrapper.find('.confirm-dismiss').trigger('click');

    // Test to check if 'Dismiss all edits' button clears all keys in queued stash
    expect(localStorage.getItem('gdt-stash-queued')).toBe(null);

    // Test to see if failed stash is cleared after 'Dismiss all edits' button was clicked
    expect(localStorage.getItem('gdt-stash-failed')).toBe(null);

    // Wait for the worker to finish creating the queued record and confirm it wasn't lost
    await delay(30000);
    const fulfilledStash = JSON.parse(localStorage.getItem('gdt-stash-fulfilled') || '[]');
    expect(fulfilledStash.length).toBe(1);
    expect(fulfilledStash[0]["key"]).toBe('queuedKey1');

    expect(fulfilledStash[0]["data"]).toEqual({
      deviceName: "Test Record",
      description: "Record for testing offline edits buttons with worker"
    })  
  });
}, 40000);
