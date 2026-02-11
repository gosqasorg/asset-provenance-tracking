import { describe, expect, it } from 'vitest';
import { cacheRequest, fetchUrl } from '~/services/azureFuncs';
import * as z from 'zod';

describe('Tests to see if requests can be cached', () => {
  it('Test to see if request was successfully cached', async () => {
    // Create mock formUrl/formData
    const formUrl = 'http://fakeUrl.com';
    const formData = new FormData();
    formData.append(
      'provenanceRecord',
      '{"blobType":"deviceInitializer","deviceName":"name","description":"descr","tags":[],"children_key":"","hasParent":false,"isReportingKey":false}'
    );

    // Cache the request
    cacheRequest(formUrl, formData);

    // Check to make sure items exist in the cache
    let requestFromCache = localStorage.getItem('gosqas_offline_cache');
    expect(JSON.parse(requestFromCache)[0] == formUrl);
    expect(JSON.parse(requestFromCache)[1] == formData);
  });

  it('Test to see if data types are correct', async () => {
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
    let requestFromCache = localStorage.getItem('gosqas_offline_cache');

    // Confirm that the datatypes are the same as they started
    const returnedFormUrl = JSON.parse(requestFromCache)[0];
    const returnedFormData = JSON.parse(requestFromCache)[1];
    expect(typeof returnedFormUrl == typeof formUrl);
    expect(typeof returnedFormData == typeof formData);

    // Convert formData return back to FormData (stored in localStorage as string)
    const formData2 = new FormData();
    formData2.append('provenanceRecord', returnedFormData);

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
    ValidFormData.parse(JSON.parse(returnedFormData));
  });

  // TODO: combine first two tests
  // TODO: add another test for attachments..?
  //  TODO: test for storing multiple things

  //  TODO FINAL: merge hieu's branch into this one or at least fix the file paths
  // (currently have tests in test/data rather than test, move manually on desktop)
});
