import { describe, expect, it } from 'vitest';
import { cacheRequest, fetchUrl } from '~/services/azureFuncs';
import * as z from 'zod';

describe('Tests to see if requests can be cached', () => {
  it('Test to see if returned data types are correct', async () => {
    // Reset the naming counter (for testing purposes)
    localStorage.setItem('cache_counter', '0');

    const baseUrl = useRuntimeConfig().public.baseUrl;
    const deviceKey = await makeEncodedDeviceKey();
    const formUrl = baseUrl + '/record/' + deviceKey;
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
    for (let i = 1; i < requestFromCache.length; i++) {
      formData2.append(requestFromCache[i][0], requestFromCache[i][1]);
    }

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

  it('Test to see if attachments are being stored', async () => {
    localStorage.setItem('cache_counter', '0');

    const baseUrl = useRuntimeConfig().public.baseUrl;
    const deviceKey = await makeEncodedDeviceKey();
    const formUrl = baseUrl + '/record/' + deviceKey;
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

    // Add test attachment to formData
    const filename = 'filename.txt';
    let attachments = [new File(['file contents'], filename, { type: 'text/plain' })];
    for (const blob of attachments) {
      console.log('Cached Attachment: ', blob.name, blob);
      formData.append(blob.name, blob);
    }

    cacheRequest(formUrl, formData);
    let requestFromCache = JSON.parse(localStorage.getItem('gosqas_offline_cache_1'));
    const returnedFileData = requestFromCache[2]; // [2][0] is file name, [2][1] is the file

    // Make sure attachment still exists
    expect(returnedFileData[0]).toEqual(filename);
    expect(returnedFileData[1]).toBeDefined();

    // NOTE: this is just here for future reference, the attachment isn't being stored correctly
    // symbol(buffer) gets messed up when stored as a string (in azureFuncs.ts)
    // we can convert to base64 before caching, but it would be difficult and also there's a 5mb storage limit on localStorage
    let attachments2 = [
      new File([returnedFileData[1]], returnedFileData[0], { type: 'text/plain' })
    ];
    for (const blob of attachments2) {
      console.log('Returned Attachment: ', blob.name, blob);
    }

    // Throwing an error here just to show that attachments isn't working yet
    throw new Error('Attachments not fully implemented');
  });

  it('Test to see if we can store multiple requests', async () => {
    localStorage.setItem('cache_counter', '0');

    const baseUrl = useRuntimeConfig().public.baseUrl;
    const deviceKey = await makeEncodedDeviceKey();
    const formUrl = baseUrl + '/record/' + deviceKey;
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
    const formData = new FormData();
    const formData2 = new FormData();
    formData.append('provenanceRecord', JSON.stringify(record));
    formData2.append('provenanceRecord', JSON.stringify(record2));

    cacheRequest(formUrl, formData);
    cacheRequest(formUrl, formData2);

    // Confirm that both requests were stored
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

  //  TODO FINAL: merge hieu's branch into this one or at least fix the file paths?
  // (currently have tests in test/data rather than test, at least move manually on desktop)
});
