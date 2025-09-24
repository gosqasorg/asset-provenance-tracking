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


async function makeDeviceKey() {
  const key = await crypto.subtle.generateKey({
    name: "AES-CBC",
    length: 128
  }, true, ['encrypt', 'decrypt']);
  const buffer = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(buffer)//.slice();
}

function encodeDeviceKey(key: Uint8Array): string {
  return base58encode(key);
}

export async function makeEncodedDeviceKey(): Promise<string> {
  // Try a few times to make sure the key is valid (length == 22)
  let newEncodedKey;
  for (let count = 0; count < 10; count++) {
    newEncodedKey = encodeDeviceKey(await makeDeviceKey());
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
