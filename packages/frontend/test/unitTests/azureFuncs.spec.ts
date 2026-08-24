import * as z from 'zod';
import { describe, expect, it, vi } from 'vitest';
import { makeEncodedDeviceKey } from '../../../backend/src/utils/keyFuncs';

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