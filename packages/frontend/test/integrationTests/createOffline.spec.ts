import { describe, expect, it, vi } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';
import { testOnlineTestUrl, postProvenance, offlineModeFeatureFlag } from '~/services/azureFuncs';

function resetStashValues(): void {
  // reset the values in localStorage to avoid overlap between tests
  localStorage.setItem('stash_counter', '0');
  localStorage.setItem('gdt-stash-fulfilled', '');
  localStorage.setItem('gdt-stash-failed', '');
  localStorage.setItem('gdt-awaiting-conectivity', 'false');
}

describe("Tests to see if we can create records while offline", async () => {
  it ("Create one record while offline", async () => {
    // Mock fetch POST requests to not use formData (fails to send from frontend test files)
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const modifiedInit = { ...init };
        
        // If we're posting then convert requests to use urlencoded data rather than formData
        if (modifiedInit.method == "POST") {
          const headers = new Headers(modifiedInit.headers);
          headers.set('Content-Type', 'application/x-www-form-urlencoded');
          modifiedInit.headers = headers;

          const params = new URLSearchParams();
          params.append("provenanceRecord", JSON.stringify(record));
          modifiedInit.body = params.toString()
        }
        
        return originalFetch(input, modifiedInit);
      }
    )

    const record = {
      blobType: 'deviceInitializer',
      deviceName: 'Offline Test Record',
      description: 'A record created while offline',
      tags: [],
      children_key: '',
      hasParent: false,
      isReportingKey: false,
    }

    // Go "offline"
    offlineModeFeatureFlag.flag = true  // turn the featureflag on for the duration of the test
    testOnlineTestUrl.url = "https://fakeurltosimulateoffline.org"

    // Create record, confirm it stashed and that periodicChecker is running
    const key = await makeEncodedDeviceKey();
    resetStashValues();

    try {
      await postProvenance(key, record, []);
      expect.fail("Create Record Offline: postProvenance failed to stash the record")
    } catch (error) {
      expect(error).toEqual(new Error('Status 202: User is offline but the record has been stashed'))
    }

    expect(localStorage.getItem('stash_counter')).toEqual('1');
    let requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    expect(requestFromStash).not.toEqual({});
    expect(localStorage.getItem('gdt-awaiting-conectivity')).toEqual("true");

    // Go "online" and wait for the record to create
    testOnlineTestUrl.url = useRuntimeConfig().public.frontendUrl
    const baseUrl = useRuntimeConfig().public.baseUrl 
    const fullUrl = `${baseUrl}/provenance/${key}`

    await new Promise((r) => setTimeout(r, 6000));

    // Confirm that the record was removed from stash, added to fulfilled stash, and that periodicChecker stopped running
    expect(localStorage.getItem('stash_counter')).toEqual('0');
    requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1') || '{}');
    expect(requestFromStash).toEqual({});
    expect(localStorage.getItem('gdt-awaiting-conectivity')).toEqual("false");

    let existingKeys = (localStorage.getItem('gdt-stash-fulfilled') || '{}').split(',');
    expect(existingKeys).not.toEqual(['{}']);
    expect(existingKeys.length).toBe(1);
    expect(existingKeys[0]).toEqual(key);

    // Confirm that the record was actually created
    try {
      let response = await (await fetch(fullUrl)).json();
      let responseString = JSON.parse(JSON.stringify(response[0]));

			expect(JSON.stringify(response)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Offline Test Record');
			expect(responseString.record.description).toBe('A record created while offline');
			expect(responseString.record.children_key).toBe('');
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isReportingKey).toBe(false);
    } catch(error) {
      expect.fail("Create Record Offline: postProvenance failed to stash the record: " + error)
    }

    offlineModeFeatureFlag.flag = false
    fetchMock.mockRestore();
  })
});