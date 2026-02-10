import { describe, expect, it } from 'vitest';
import { cacheRequest } from '~/services/azureFuncs';

describe('Tests to see if requests can be cached', () => {
  it('Test to see if request was successfully cached', async () => {
    // Create mock formUrl/formData
    const formUrl = 'http://fakeUrl.com';
    const formData = new FormData();
    formData.append('provenanceRecord', 'placeholder'); // TODO: Run code and get test string! (backend broke again sobs)

    // Cache the above using cacheRequest()
    cacheRequest(formUrl, formData);

    // Check to make sure items exist in the cache
    let requestFromCache = localStorage.getItem('gosqas_offline_cache');

    // Need FormData object for posting!!
    const formData2 = new FormData();
    console.log('string record ' + JSON.parse(requestFromCache)[1]); // delete: need type string
    formData2.append('provenanceRecord', JSON.parse(requestFromCache)[1]);

    expect(JSON.parse(requestFromCache)[0] == formUrl);
    expect(JSON.parse(requestFromCache)[1] == formData);
  });

  it('Test to see if data types are correct', async () => {
    // Create mock formUrl/formData
    // Check the datatypes are correct for both (formUrl = string, formData = FormData)
    // NOTE: to make FormData we take a string and append it to a new formData, so we need a string from localStorage for formData
    // that we then turn into a new FormData
    // Cache and retreive the request
    // Confirm that the datatypes are the same as they started
  });

  // TODO: ref delete
  // it('Test to see if data types are correct', async () => {
  //     let result = await offlineTestFetch('https://www.fakeurl.com');
  //     expect(result).toBe(false);
  // });
});
