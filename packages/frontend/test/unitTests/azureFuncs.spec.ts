import { describe, expect, it } from 'vitest'
import { offlineTestFetch } from '~/services/azureFuncs'

describe('Tests to see if user is online and offline', () => {
    it('Test to see if user is online', async () => {
        let result = await offlineTestFetch();
        expect(result).toBe(true);
    });

    it('Test to see if user is offline', async () => {
        let result = await offlineTestFetch('https://www.fakeurl.com');
        expect(result).toBe(false);
    });

})