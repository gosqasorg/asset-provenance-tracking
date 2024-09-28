import { describe, it, expect } from 'vitest';
import clickableLink from './clickableLink';

describe('clickableLink', () => {
    it('should return a clickable link', async () => {
        const description = clickableLink('Check out https://gosqas.org it is amazing');
        expect(description).toEqual('Check out <a href="https://gosqas.org" target="_blank">https://gosqas.org</a> it is amazing');
    });
});
