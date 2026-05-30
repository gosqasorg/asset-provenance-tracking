import * as z from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';
import { stashRequest, emptyStash, onlineTestFetch, periodicChecker, testOnlineTestUrl, postProvenance, offlineModeFeatureFlag } from '~/services/azureFuncs';

async function createRequest (
  key: string,
  name: string,
  description: string
): Promise<[string, FormData]> {
  // TODO: backend_url stores /provenance/ as well, so do we want to just store the key??
  const formUrl = '/provenance/' + key;
  const record = {
    blobType: 'deviceInitializer',
    deviceName: name,
    description: description,
    tags: [],
    children_key: '',
    hasParent: false,
    isReportingKey: false
  };

  const formData = new FormData();
  formData.append('provenanceRecord', JSON.stringify(record));
  return [formUrl, formData];
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
    const key = await makeEncodedDeviceKey();
    let [formUrl, formData] = await createRequest(
      key,
      'Stored Record',
      'Test record stored in localStorage then created from emptyStash()'
    );

    localStorage.setItem('stash_counter', '0'); // need to reset counter to avoid overlap with other tests
    stashRequest(formUrl, formData);
    let requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');

    // Confirm that the datatypes are the same as they started
    const returnedFormUrl = requestFromStash[0][1];
    const returnedFormData = JSON.parse(requestFromStash[1][1]);
    expect(typeof returnedFormUrl).toEqual(typeof formUrl);
    expect(returnedFormUrl).toEqual(formUrl);
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
      isReportingKey: z.boolean().optional()
    });
    ValidFormData.parse(returnedFormData);

    // Remove item from stash
    localStorage.removeItem('gosqas_offline_stash_1');
  });

  it('Test to see if we can store multiple requests', async () => {
    const key1 = await makeEncodedDeviceKey();
    const key2 = await makeEncodedDeviceKey();
    let [formUrl1, formData1] = await createRequest(key1, 'name', 'description');
    let [formUrl2, formData2] = await createRequest(key2, 'name2', 'slightly longer description');

    localStorage.setItem('stash_counter', '0');
    stashRequest(formUrl1, formData1);
    stashRequest(formUrl2, formData2);

    let requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    const returnedFormUrl = requestFromStash[0][1];
    const returnedFormData = JSON.parse(requestFromStash[1][1]);
    expect(returnedFormUrl).toEqual(formUrl1);
    expect(JSON.stringify(returnedFormData)).toStrictEqual(formData1.get('provenanceRecord'));

    let requestFromStash2 = JSON.parse(localStorage.getItem('gosqas_offline_stash_2') || '{}');
    const returnedFormUrl2 = requestFromStash2[0][1];
    const returnedFormData2 = JSON.parse(requestFromStash2[1][1]);
    expect(returnedFormUrl2).toEqual(formUrl2);
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
    // Mock fetch calls from emptyStash (since formData doesn't work from this file)
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
    } as Response);

    const key = await makeEncodedDeviceKey();
    let [formUrl, formData] = await createRequest(key, 'stored record', 'testing emptyStash');

    localStorage.setItem('stash_counter', '0');  // reset the counter to avoid overlap with other tests
    localStorage.setItem('gdt-stash-fulfilled', '');
    stashRequest(formUrl, formData);
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
    expect(existingKeys[0]).toEqual(key);

    // Remove mock
    fetchMock.mockRestore();
  });

  it('Create and remove two requests', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
    } as Response);

    const key1 = await makeEncodedDeviceKey();
    const key2 = await makeEncodedDeviceKey();
    let [formUrl1, formData1] = await createRequest(key1, 'first stored record', 'this is a test');
    let [formUrl2, formData2] = await createRequest(key2, 'second stored record', 'this is the same test');

    localStorage.setItem('stash_counter', '0');
    stashRequest(formUrl1, formData1);
    stashRequest(formUrl2, formData2);
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
    expect(existingKeys.length).toBe(3);
    expect(existingKeys[2]).toEqual(key1);
    expect(existingKeys[1]).toEqual(key2);

    fetchMock.mockRestore();
  });

  it('Try to emptyStash when nothing is stashed', async () => {
    // Should just return when stash_counter = 0
    localStorage.setItem('stash_counter', '0');
    localStorage.setItem('gdt-stash-fulfilled', '');
    expect(localStorage.getItem('stash_counter')).toEqual('0');
    let statusCode = await emptyStash();
    expect(statusCode).toEqual(200);

    // Same thing should happen when stash_counter = null
    localStorage.removeItem('stash_counter');
    expect(localStorage.getItem('stash_counter')).toEqual(null);
    statusCode = await emptyStash();
    expect(statusCode).toEqual(200);
  });

  it("Make sure record isn't removed from localStorage when post fails", async () => {
    const key = await makeEncodedDeviceKey();
    let [formUrl, formData] = await createRequest(key, 'failed record', 'this should fail to post');

    localStorage.setItem('stash_counter', '0');
    localStorage.setItem('gdt-stash-fulfilled', '');
    stashRequest(formUrl, formData);
    expect(localStorage.getItem('stash_counter')).toEqual('1');

    // Empty the stash without mocking (so it will fail to post since formData cannot be posted from this file)
    console.log('Attempting a failed fetch to check error handling...');
    let statusCode = await emptyStash();
    expect(statusCode).toEqual(404);

    // Make sure the record is still in the stash and the counter still = 1
    const request = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    expect(request).not.toEqual(null);
    expect(request[0][1]).toEqual(formUrl);
    expect(JSON.parse(request[1][1]).deviceName).toEqual('failed record');
    expect(JSON.parse(request[1][1]).description).toEqual('this should fail to post');
    expect(request[1][1]).toStrictEqual(formData.get('provenanceRecord'));
    expect(localStorage.getItem('stash_counter')).toEqual('1');

    // Confirm failed key was not added to list of successful requests
    let existingKeys = (localStorage.getItem('gdt-stash-fulfilled') || '{}').split(',');
    expect(existingKeys).toEqual(['{}']);
  }, 200000);
});

describe("Tests to see if periodicChecker works", async () => {
  it ("Create a record from periodicChecker", async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
    } as Response);

    const key = await makeEncodedDeviceKey();
    let [formUrl, formData] = await createRequest(key, 'stored record', 'testing periodicChecker');

    localStorage.setItem('stash_counter', '0');  // reset the counter to avoid overlap with other tests
    localStorage.setItem('gdt-stash-fulfilled', '');
    stashRequest(formUrl, formData);
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
    expect(existingKeys[0]).toEqual(key);

    fetchMock.mockRestore();
  });

  it ("Make sure periodicChecker can run in the background", async () => {
    // Mock offline since otherwise periodicChecker will instantly return
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 500,
    } as Response);
    
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

// TODO: ...is this a unit test though..? (look at backend tests and reference that formatting)
describe("Tests to see if we can create records while offline", async () => {
  it ("Create one record while offline", async () => {
    // Go "offline"
    offlineModeFeatureFlag.flag = true  // turn the featureflag on for the duration of the test
    testOnlineTestUrl.url = "https://fakeurltosimulateoffline.org"

    // Create record, confirm it stashed and periodicChecker is running
    const key = await makeEncodedDeviceKey();

    // TODO: make a function for reseting counters and replace below repetitive code in all tests
    localStorage.setItem('stash_counter', '0');  // reset the counter to avoid overlap with other tests
    localStorage.setItem('gdt-stash-fulfilled', '');
    localStorage.setItem('gdt-stash-failed', '');
    localStorage.setItem('gdt-awaiting-conectivity', 'false');

    try {
      const response = await postProvenance(key, {
        blobType: 'deviceInitializer',
        deviceName: 'Offline Record',
        description: 'A record created while offline',
        tags: [],
        children_key: '',
        hasParent: false,
        isReportingKey: false,
      }, []);
      expect.fail("Create Record Offline: postProvenance failed to stash the record")
    } catch (error) {
      expect(error).toEqual(new Error('Status 202: User is offline but the record has been stashed'))
    }

    expect(localStorage.getItem('stash_counter')).toEqual('1');
    let requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    expect(requestFromStash).not.toEqual({});
    expect(localStorage.getItem('gdt-awaiting-conectivity')).toEqual("true");

    // Go "online"
    testOnlineTestUrl.url = useRuntimeConfig().public.frontendUrl

    
    // PROBLEM: formData doesn't work from this file and previously we'd mocked responses
      // Try making a new test.ts file or reworking to fix? See previous issue (emptyStash) and if you gave a reason why it doesn't work??

    // Mock fetch calls from emptyStash (since formData doesn't work from this file) NOTE: want to actually post the record though
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
    } as Response);


    const baseUrl = useRuntimeConfig().public.baseUrl
    const fullUrl = `${baseUrl}/provenance/${key}`

    // FIX FROM EMPTY STASH: FormData fails from test file (gets read as plaintext in fetch instead of multipart formdata), so we're using a different content type to get around that
      // TODO: could mock fetchUrl, could mock fetch but only when POSTing, could modify code to allow tests to use formdata
    // const params = new URLSearchParams();
    // params.append("provenanceRecord", JSON.stringify(record));
		// const response = await fetch(`${baseUrl}/provenance/${key}`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/x-www-form-urlencoded"
    //    },
    //   body: params.toString(),
    // });


    // Confirm record was created (w/ correct values), removed from stash, and periodicChecker stopped running
    await new Promise((r) => setTimeout(r, 5500));

    expect(localStorage.getItem('stash_counter')).toEqual('0');
    requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    expect(requestFromStash).toEqual({});
    expect(localStorage.getItem('gdt-awaiting-conectivity')).toEqual("false");

    let existingKeys = (localStorage.getItem('gdt-stash-fulfilled') || '{}').split(',');
    expect(existingKeys).not.toEqual(['{}']);
    expect(existingKeys.length).toBe(1);
    expect(existingKeys[0]).toEqual(key);


    // TODO: add checks to make sure name, descr, etc match (in progress, working on getting POST to work from tests)
    console.log("KEY = " + key)

    try {
			let response = await fetch(fullUrl);
      console.log(response)
			// response = await response.json();
		} catch(error) {
      expect.fail("Create Record Offline: postProvenance failed to stash the record: " + error)
		}

    offlineModeFeatureFlag.flag = false
    fetchMock.mockRestore()
  })
})