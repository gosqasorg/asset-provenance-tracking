import { describe, expect, it } from 'vitest';
// TODO: remove unusued functions
import { emptyCache, offlineTestFetch, getProvenance, postProvenance } from '~/services/azureFuncs';
import { cacheRequest } from '~/services/azureFuncs';
import { makeEncodedDeviceKey } from '~/utils/keyFuncs';
import * as z from 'zod';

describe('Tests to see if user is online and offline', () => {
  it('Test to see if user is online', async () => {
    let result = await offlineTestFetch();
    expect(result).toBe(true);
  });

  it('Test to see if user is offline', async () => {
    let result = await offlineTestFetch('https://www.fakeurl.com');
    expect(result).toBe(false);
  });
});

describe('Tests to see if requests can be cached', () => {
  it('Test to see if returned data types are correct', async () => {
    // Reset the naming counter (for testing purposes)
    localStorage.setItem('cache_counter', '0');

    const baseUrl = useRuntimeConfig().public.baseUrl;
    const deviceKey = await makeEncodedDeviceKey();
    const formUrl = baseUrl + '/provenance/' + deviceKey;
    const record = {
      blobType: 'deviceInitializer',
      deviceName: 'name',
      description: 'description',
      tags: [],
      children_key: '',
      hasParent: false,
      isReportingKey: false
    };
    const formData = new FormData();
    formData.append('provenanceRecord', JSON.stringify(record));

    cacheRequest(formUrl, formData);
    let requestFromCache = JSON.parse(localStorage.getItem('gosqas_offline_cache_1'));

    // Confirm that the datatypes are the same as they started
    const returnedFormUrl = requestFromCache[0][1];
    const returnedFormData = JSON.parse(requestFromCache[1][1]);
    expect(typeof returnedFormUrl).toEqual(typeof formUrl);
    expect(returnedFormUrl).toEqual(formUrl);

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
  });

  it('Test to see if we can store multiple requests', async () => {
    localStorage.setItem('cache_counter', '0');

    const baseUrl = useRuntimeConfig().public.baseUrl;
    const deviceKey = await makeEncodedDeviceKey();
    const formUrl = baseUrl + '/provenance/' + deviceKey;
    const record = {
      blobType: 'deviceInitializer',
      deviceName: 'name',
      description: 'description',
      tags: [],
      children_key: '',
      hasParent: false,
      isReportingKey: false
    };
    const record2 = {
      blobType: 'deviceInitializer',
      deviceName: 'name2',
      description: 'slightly longer description',
      tags: [],
      children_key: '',
      hasParent: false,
      isReportingKey: false
    };

    // Store two records in localStorage and confirm that they were stored correctly
    const formData = new FormData();
    const formData2 = new FormData();
    formData.append('provenanceRecord', JSON.stringify(record));
    formData2.append('provenanceRecord', JSON.stringify(record2));

    cacheRequest(formUrl, formData);
    cacheRequest(formUrl, formData2);

    let requestFromCache = JSON.parse(localStorage.getItem('gosqas_offline_cache_1'));
    const returnedFormUrl = requestFromCache[0][1];
    const returnedFormData = JSON.parse(requestFromCache[1][1]);
    expect(returnedFormUrl).toEqual(formUrl);

    let requestFromCache2 = JSON.parse(localStorage.getItem('gosqas_offline_cache_2'));
    const returnedFormUrl2 = requestFromCache2[0][1];
    const returnedFormData2 = JSON.parse(requestFromCache2[1][1]);
    expect(returnedFormUrl2).toEqual(formUrl);

    // Check that the correct record was stored at each request
    expect(returnedFormData.deviceName).toEqual('name');
    expect(returnedFormData2.deviceName).toEqual('name2');
    expect(returnedFormData.description).toEqual('description');
    expect(returnedFormData2.description).toEqual('slightly longer description');
  });
});

// TODO: add tests for removing from cache (can maybe combine with above..? nah probably better to be separate)
describe('Tests to see if we can remove from the cache', () => {
  // Create 1 record and cache without posting, then try to post from emptyCache()
  it('Create and remove a request', async () => {
    // Reset the naming counter (for testing purposes)
    localStorage.setItem('cache_counter', '0');

    // Create a record
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const deviceKey = await makeEncodedDeviceKey();
    const formUrl = baseUrl + '/provenance/' + deviceKey;
    const record = {
      blobType: 'deviceInitializer',
      deviceName: 'name',
      description: 'description',
      tags: [],
      children_key: '',
      hasParent: false,
      isReportingKey: false
    };
    const formData = new FormData();
    formData.append('provenanceRecord', JSON.stringify(record));

    console.log('***Url: ' + formUrl);
    console.log('***Device Key: ' + deviceKey);
    console.log('***Record Added to FormData: ' + JSON.stringify(record));

    // currently fetching: http://localhost:7071/api/provenance/5gZXB9xGN1yGdY1VuLgPL5
    // post fetching: http://localhost:7071/api/provenance/Lx5SiZMkifAVCtrFYS5iiF

    // TODO: Below code works in backend but failing here!!!! (typeError can't parse formData)
    // const childFormData = new FormData();
    // childFormData.append("provenanceRecord", JSON.stringify({
    //     blobType: "deviceInitializer",
    //     deviceName: "customTitles[i]",
    //     description: `Child record with custom title`,
    //     tags: [],
    //     children_key: "",
    //     hasParent: false,
    //     isReportingKey: false
    // }));

    // let response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
    //     method: "POST",
    //     body: childFormData,
    // });

    // Cache then fulfill the request
    // cacheRequest(formUrl, formData);
    let statusCode = await emptyCache();

    // Confirm that the record was created
    // expect(response.status).toEqual(200);
    expect(statusCode).toEqual(200);

    // TODO: should return [{"record":{"blobType":"deviceInitializer","deviceName":"a","description":"test","tags":[],"children_key":"","hasParent":false,"isReportingKey":false},"attachments":[],"deviceID":"c8bcb73ea747db912ce893d8192d3b43c59c5e45caa4cf6727f99e9221b5dd59","timestamp":1772061768553}]
    console.log('getProvenance returns: ' + JSON.stringify(await getProvenance(deviceKey)));
  });

  // TODO: Add 2 requests and remove them, is the cache emptied and does cache_counter accurately track requests?
  // TODO: try and emptyCache when no records exist, does it just return? Is cache_counter still 0?
});
