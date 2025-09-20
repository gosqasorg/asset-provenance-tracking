import { describe, it, expect } from 'vitest';
import { validateKey, makeEncodedDeviceKey } from '../../src/services/keyFuncs';

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
