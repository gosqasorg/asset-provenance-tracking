
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
//TODO: take out validate key 
//TODO: get rid of Husky 

import { postNotificationEmail } from '~/services/azureFuncs';

describe('postNotificationEmail', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        // remove stubbed globals from other tests if any
        // @ts-ignore
        delete (globalThis as any).useRuntimeConfig;
        // @ts-ignore
        delete (globalThis as any).fetch;
    });

    it('calls backend notificationSubscription endpoint and sends deviceKey and email', async () => {
        // stub useRuntimeConfig
        // @ts-ignore
        (globalThis as any).useRuntimeConfig = () => ({ public: { baseUrl: 'https://api.test' }});

        // Mock fetch resolved with status 200
        const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
        // @ts-ignore
        (globalThis as any).fetch = mockFetch;

        const testDeviceKey = '9mYGN9CpKs5cz42mZhaFuk';
        const testEmail = 'test@example.com';

        await postNotificationEmail(testDeviceKey, testEmail);

        expect(mockFetch).toHaveBeenCalled();
        const calledUrl = mockFetch.mock.calls[0][0] as string;
        const calledOptions = mockFetch.mock.calls[0][1];

        expect(calledUrl).toContain('/notificationSubscription');
        expect(calledOptions.method).toBe('POST');
        expect(calledOptions.headers['Content-Type']).toBe('application/json');

        // Verify JSON body contents
        const body = JSON.parse(calledOptions.body);
        
        expect(body.recordKey).toBe(testDeviceKey);
        expect(body.email).toBe(testEmail);
        expect(body.tags).toEqual([]);
    });

});