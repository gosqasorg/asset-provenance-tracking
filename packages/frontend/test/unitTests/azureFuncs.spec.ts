import * as z from 'zod';
import { describe, expect, it } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';
import { stashRequest, emptyStash, onlineTestFetch, getProvenance } from '~/services/azureFuncs';

const baseUrl = 'https://gosqasbe.azurewebsites.net/api/';

async function createRequest(
  key: string,
  name: string,
  description: string
): Promise<[string, FormData]> {
  const formUrl = baseUrl + 'provenance/' + key;
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
    const key = await makeEncodedDeviceKey();
    let [formUrl, formData] = await createRequest(
      key,
      'Stored Record',
      'Test record stored in localStorage then created from emptyStash()'
    );

    localStorage.setItem('stash_counter', '0');
    localStorage.setItem('gdt-stash-fulfilled', '');
    stashRequest(formUrl, formData);
    expect(localStorage.getItem('stash_counter')).toEqual('1');

    // Empty the stash and confirm it posted the new record
    let statusCode = await emptyStash(true);
    expect(statusCode).toEqual(200);

    // Make sure the record was removed from the stash and the counter = 0
    expect(localStorage.getItem('stash_counter')).toEqual('0');
    expect(localStorage.getItem('gosqas_offline_stash_1')).toEqual(null);

    const provenance = await (await fetch(`${baseUrl}provenance/${key}`)).json();
    expect(provenance).not.toEqual([]);
    expect(provenance[0].record.deviceName).toEqual('Stored Record');
    expect(provenance[0].record.description).toEqual(
      'Test record stored in localStorage then created from emptyStash()'
    );

    // Make sure the new key was stored to display to the frontend later
    let existingKeys = (localStorage.getItem('gdt-stash-fulfilled') || '{}').split(',');
    expect(existingKeys).not.toEqual(['{}']);
    expect(existingKeys[0]).toEqual(formUrl.split('/')[formUrl.split('/').length - 1]);
  });

  it('Add and remove two requests', async () => {
    const key1 = await makeEncodedDeviceKey();
    const key2 = await makeEncodedDeviceKey();
    let [formUrl1, formData1] = await createRequest(key1, 'first stored record', 'this is a test');
    let [formUrl2, formData2] = await createRequest(
      key2,
      'second stored record',
      'this is the same test'
    );

    localStorage.setItem('stash_counter', '0');
    localStorage.setItem('gdt-stash-fulfilled', '');
    stashRequest(formUrl1, formData1);
    stashRequest(formUrl2, formData2);

    expect(localStorage.getItem('stash_counter')).toEqual('2');

    // Empty stash and confirm both records were posted
    let statusCode = await emptyStash(true);
    expect(statusCode).toEqual(200);

    expect(localStorage.getItem('stash_counter')).toEqual('0');
    expect(localStorage.getItem('gosqas_offline_stash_1')).toEqual(null);
    expect(localStorage.getItem('gosqas_offline_stash_2')).toEqual(null);

    const provenance1 = await (await fetch(`${baseUrl}provenance/${key1}`)).json();
    expect(provenance1).not.toEqual([]);
    expect(provenance1[0].record.deviceName).toEqual('first stored record');
    expect(provenance1[0].record.description).toEqual('this is a test');

    const provenance2 = await (await fetch(`${baseUrl}provenance/${key2}`)).json();
    expect(provenance2).not.toEqual([]);
    expect(provenance2[0].record.deviceName).toEqual('second stored record');
    expect(provenance2[0].record.description).toEqual('this is the same test');

    // Make sure all three keys (including the one from the previous test) are stored
    let existingKeys = (localStorage.getItem('gdt-stash-fulfilled') || '{}').split(',');
    expect(existingKeys).not.toEqual(['{}']);
    expect(existingKeys.length).toBe(2);
    expect(existingKeys[1]).toEqual(formUrl1.split('/')[formUrl1.split('/').length - 1]);
    expect(existingKeys[0]).toEqual(formUrl2.split('/')[formUrl2.split('/').length - 1]);
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
    let [formUrl, formData] = await createRequest(
      key,
      'Failed Record',
      'A record that will fail to post'
    );

    localStorage.setItem('stash_counter', '0');
    localStorage.setItem('gdt-stash-fulfilled', '');
    stashRequest(formUrl, formData);
    expect(localStorage.getItem('stash_counter')).toEqual('1');

    // Empty the stash using the non-test version (so it will fail to post since formData cannot be posted from this file)
    console.log('Attempting a failed fetch to check error handling...');
    let statusCode = await emptyStash();
    expect(statusCode).toEqual(404);

    // Make sure the record is still in the stash and the counter still = 1
    const request = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    expect(request).not.toEqual(null);
    expect(request[0][1]).toEqual(formUrl);
    expect(JSON.parse(request[1][1]).deviceName).toEqual('Failed Record');
    expect(JSON.parse(request[1][1]).description).toEqual('A record that will fail to post');
    expect(request[1][1]).toStrictEqual(formData.get('provenanceRecord'));
    expect(localStorage.getItem('stash_counter')).toEqual('1');

    // Confirm failed key was not added to list of successful requests
    let existingKeys = (localStorage.getItem('gdt-stash-fulfilled') || '{}').split(',');
    expect(existingKeys).toEqual(['{}']);
  }, 200000);
});
