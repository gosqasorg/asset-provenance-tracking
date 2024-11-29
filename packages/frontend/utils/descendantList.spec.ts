import { describe, it, expect } from 'vitest';
import { getChildKeys } from './descendantList';
import { fakeProvenanceNoChildren, fakeProvenanceWithChildren } from '~/test/data/provenance';

describe('descendantList', () => {
    it('should return an empty list of keys', async () => {
        const keys = getChildKeys(fakeProvenanceNoChildren)
        expect(keys).toEqual([]);
    });

    it('should return an list of child keys', async () => {
        const keys = getChildKeys(fakeProvenanceWithChildren)
        const expected = ["childkey1", "childkey2", "childkey3"];
        expect(keys).toEqual(expected);
    });
});
