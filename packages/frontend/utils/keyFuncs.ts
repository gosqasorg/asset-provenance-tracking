import {encode as base58encode } from '@urlpack/base58'

export async function makeDeviceKey(): Promise<Uint8Array> {
  const key = await crypto.subtle.generateKey({
    name: "AES-CBC",
    length: 128
  }, true, ['encrypt', 'decrypt']);
  const buffer = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(buffer).slice();
}

function encodeDeviceKey(key: Uint8Array): string {
    return base58encode(key);
}

export async function makeEncodedDeviceKey(): Promise<string> {
        return encodeDeviceKey(await makeDeviceKey());
}
