import * as z from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';
import { confirmRequestFulfilled } from '~/services/azureFuncs';

async function createRequest (
  name: string,
  description: string
): Promise<[string, FormData]> {
  const key = await makeEncodedDeviceKey();
  const record = {
    blobType: 'deviceInitializer',
    deviceName: name,
    description: description,
    tags: [],
    children_key: '',
    hasParent: false,
    isPublicKey: false
  };

  const formData = new FormData();
  formData.append('provenanceRecord', JSON.stringify(record));
  return [key, formData];
}

function resetStashValues(): void {
  // reset the values in localStorage to avoid overlap between tests
  localStorage.setItem('stash_counter', '0');
  localStorage.setItem('gdt-stash-fulfilled', '');
  localStorage.setItem('gdt-stash-failed', '');
  localStorage.setItem('gdt-awaiting-conectivity', 'false');
}

  // Mock global fetch so a real network isn't made when fetch is called in functions to be tested
  const mockFetch = vi.fn();
  global.fetch = mockFetch

describe("Placeholder tests", () => {
    it("Future offline tests will go here", () => {
        expect(true).toBe(true);
    }),
    it("Test to confirmRequestFulfilled for new record and record entry created offline", async () => {
      const mockRecord = [{record: {description: 'mockRecord'}}];
      mockFetch.mockResolvedValue({ok: true, status: 200,json: () => Promise.resolve(mockRecord),})

      const resultEntryAddition = await confirmRequestFulfilled('123456789101112asdfghi', 'mockRecord')
      const resultNewRecord = await confirmRequestFulfilled('123456789101112asdfghi')

      expect(resultEntryAddition).toBe(true)
      expect(resultNewRecord).toBe(true)
    })
});