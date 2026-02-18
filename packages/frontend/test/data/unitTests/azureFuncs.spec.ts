import { describe, expect, it } from 'vitest';
import { cacheRequest, fetchUrl } from '~/services/azureFuncs';
import * as z from 'zod';

describe('Tests to see if requests can be cached', () => {
  it('Test to see if returned data types are correct', async () => {
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
    let requestFromCache = JSON.parse(localStorage.getItem('gosqas_offline_cache'));

    // Confirm that the datatypes are the same as they started
    const returnedFormUrl = requestFromCache[0][1];
    const returnedFormData = JSON.parse(requestFromCache[1][1]);
    expect(typeof returnedFormUrl == typeof formUrl);
    expect(returnedFormUrl == formUrl);

    // Convert formData return back to type FormData (stored in localStorage as string)
    const formData2 = new FormData();

    for (let i = 1; i < requestFromCache.length; i++) {
      formData2.append(requestFromCache[i][0], requestFromCache[i][1]);
    }
    expect(typeof formData2 == typeof formData);

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

  it('Test to see if attachments are also stored', async () => {
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
    const files = [new File(['file contents'], filename, { type: 'text/plain' })];
    let attachments = Array.from(files);
    for (const blob of attachments) {
      console.log('CACHED: ', blob.name, blob);
      formData.append(blob.name, blob);
    }

    cacheRequest(formUrl, formData);
    let requestFromCache = JSON.parse(localStorage.getItem('gosqas_offline_cache'));
    const returnedFileData = requestFromCache[2]; // [0] is str name, [1] is the file

    // Make sure attachment still exists and hasn't changed
    expect(returnedFileData[0] == filename);
    expect(typeof returnedFileData[1] == typeof files); // TODO: maybe change/remove this test? can we get the contents??

    // console.log("ATTACHMENTS TEST:")
    // console.dir(attachments, { depth: null });

    // TODO: confirm attachment still exists after caching (expect() tests)
    // WANT: provkey: value, filename: file

    // Recreate formData and confirm it's the same as the original
    console.log('Get returned values, do they match what we put in?');
    const formData2 = new FormData();
    for (let i = 1; i < requestFromCache.length; i++) {
      console.log('RETURNED: ', requestFromCache[i][0], requestFromCache[i][1]); // TODO: lost [Symbol(buffer)] from original
      formData2.append(requestFromCache[i][0], requestFromCache[i][1]);
    }
    expect(typeof formData2 == typeof formData);
    expect(formData2 == formData);
  });

  it('Test to see if we can store multiple requests', async () => {
    // TODO: We CAN'T with out current method (setItem overrides, maybe get item, append, then set again..?)
    // Could store with unique keys, but would be messy and hard to get later (get based on key's character length (key == deviceKey)?)
  });

  //  TODO FINAL: merge hieu's branch into this one or at least fix the file paths
  // (currently have tests in test/data rather than test, move manually on desktop)
});
