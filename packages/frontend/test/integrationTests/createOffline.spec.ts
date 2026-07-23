import { describe, expect, it, vi } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';
import { testOnlineTestUrl, postProvenance, emptyStashBaseUrl } from '~/services/azureFuncs';

// Functions to allow devs to easily switch between development and local backends
let frontendUrl = useRuntimeConfig().public.frontendUrl

function useDevEnvironment() {
  emptyStashBaseUrl.url = `https://gosqasbe.azurewebsites.net/api/provenance/`;
  frontendUrl = "https://dev.gosqas.org"
}
function useLocalEnvironment() {
  emptyStashBaseUrl.url = `http://localhost:7071/api`;
}

function resetStashValues(): void {
  // reset the values in localStorage to avoid overlap between tests
  localStorage.setItem('stash_counter', '0');
  localStorage.setItem('gdt-stash-fulfilled', '');
  localStorage.setItem('gdt-stash-failed', '');
  localStorage.setItem('gdt-awaiting-conectivity', 'false');
}

describe("Tests to see if we can create records while offline", async () => {
  // NOTE: Replace below function call with useLocalEnvironment() to test locally
  // useLocalEnvironment();
  useDevEnvironment();

  it ("Create one record while offline", async () => {
    // For testing we need to mock fetch to use urlencoded data rather than formData (which fails to send from test files)
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const modifiedInit = { ...init };
        
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

    resetStashValues();

    const record = {
      blobType: 'deviceInitializer',
      deviceName: 'Offline Test Record',
      description: 'A record created while offline',
      tags: [],
      children_key: '',
      hasParent: false,
      isPublicKey: false,
    }

    // Go "offline"
    testOnlineTestUrl.url = "https://fakeurltosimulateoffline.org"

    // Create record, confirm it stashed and that periodicChecker is running
    const key = await makeEncodedDeviceKey();
    console.log(`Creating record ${key} while offline...`)

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
    testOnlineTestUrl.url = frontendUrl

    await new Promise((r) => setTimeout(r, 8000));

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
      const baseUrl = emptyStashBaseUrl.url
      let fullUrl = `${baseUrl}${key}`;
      if (baseUrl.includes('localhost')) {
          fullUrl = `${baseUrl}/provenance/${key}`;
      }

      let response = await (await fetch(fullUrl)).json();
      let responseString = JSON.parse(JSON.stringify(response[0]));

			expect(JSON.stringify(response)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Offline Test Record');
			expect(responseString.record.description).toBe('A record created while offline');
			expect(responseString.record.children_key).toBe('');
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isPublicKey).toBe(false);
    } catch(error) {
      expect.fail("Create Record Offline: postProvenance failed to create the record: " + error)
    }

    fetchMock.mockRestore();
  })
});