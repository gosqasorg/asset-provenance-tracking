// keyFuncs.ts -- Creation and Function of Key
// Copyright (C) 2024 GOSQAS Team
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import {encode as base58encode } from '@urlpack/base58'
import {randomBytes} from 'crypto';

export function makeDeviceKey(): Uint8Array{
  // Generates 16 bytes ( i.e., 128 bits) of random data.
  // This is the same as AES-128 key length from the frontend
  const key = randomBytes(16);
  return new Uint8Array(key);
}

function encodeDeviceKey(key: Uint8Array): string {
  return base58encode(key);
}

export function makeEncodedDeviceKey(): string {
  let newEncodedKey = encodeDeviceKey(makeDeviceKey());
  // Try a few times to make sure the key is valid (length == 22)
  for (let count = 0; count < 10; count++) {
    newEncodedKey = encodeDeviceKey(makeDeviceKey());
    if (newEncodedKey.length == 22) {
      break;
    }
  }
  return newEncodedKey;
}

export function validateKey(key: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return typeof key === 'string' && key.length === 22 && alphanumericRegex.test(key);
}
