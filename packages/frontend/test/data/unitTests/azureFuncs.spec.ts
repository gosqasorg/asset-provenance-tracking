import { describe, expect, it } from 'vitest';
import { cacheRequest } from '~/services/azureFuncs';

describe('Tests to see if requests can be cached', () => {
  it('Test to see if request was successfully cached', async () => {
    // Create mock formUrl/formData
    // Cache the above using cacheRequest()
    // Check to make sure items exist in the cache
  });

  it('Test to see if data types are correct', async () => {
    // Create mock formUrl/formData
    // Check the datatypes are correct for both (formUrl = string, formData = FormData)
    // Cache and retreive the request
    // Confirm that the datatypes are the same as they started
  });

  // TODO: ref delete
  // it('Test to see if data types are correct', async () => {
  //     let result = await offlineTestFetch('https://www.fakeurl.com');
  //     expect(result).toBe(false);
  // });
});
