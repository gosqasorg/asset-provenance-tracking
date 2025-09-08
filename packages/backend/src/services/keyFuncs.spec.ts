// keyFuncs.spec.ts
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

import { describe, it, expect } from 'vitest';
import { validateKey, makeEncodedDeviceKey } from './keyFuncs';

describe('validateDeviceKey', () => {
    it('should return true when given a valid device key', () => {
        expect(validateKey("SsxFac4pPz4Rs7jFwSt2mp")).toEqual(true);

        const key = makeEncodedDeviceKey();
        expect(validateKey(key)).toEqual(true);
    });

    it('should return false when given an invalid string', () => {
      expect(validateKey("abc123")).toEqual(false); // Too short
      expect(validateKey("SsxFac4pPz4Rs7jFwSt2mp1")).toEqual(false); // Too long
      expect(validateKey("!@#$%^&*#z4R!7jFwSt2mp")).toEqual(false); // Invalid characters
    });
    
    it('should return false when not given a string', () => {
      // @ts-ignore
      expect(validateKey(5)).toEqual(false);    
      // @ts-ignore
      expect(validateKey([])).toEqual(false);
      // @ts-ignore
      expect(validateKey(null)).toEqual(false);
      // @ts-ignore
      expect(validateKey(undefined)).toEqual(false);
      // @ts-ignore
      expect(validateKey({})).toEqual(false);
    });
});
