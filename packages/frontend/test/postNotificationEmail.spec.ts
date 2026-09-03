
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';


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
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: vi.fn().mockResolvedValue({ token: 'test-token' }),
        });
        // @ts-ignore
        (globalThis as any).fetch = mockFetch;

        const testDeviceKey = '9mYGN9CpKs5cz42mZhaFuk';
        const testEmail = 'test@example.com';

        const token = await postNotificationEmail(testEmail, testDeviceKey);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const calledUrl = mockFetch.mock.calls[0][0] as string;
        const calledOptions = mockFetch.mock.calls[0][1];

        expect(calledUrl).toContain('/notificationSubscription');
        expect(calledOptions.method).toBe('POST');
        expect(calledOptions.headers['Content-Type']).toBe('application/json');

        // Verify JSON body contents
        const body = JSON.parse(calledOptions.body);
        
        expect(body.recordKey).toBe(testDeviceKey);
        expect(body.email).toBe(testEmail);
        expect(token).toBe('test-token');
        // expect(body.tags).toEqual([]);
    });

    // Running the same test for different status codes and expected error messages. 
    it.each([
        {
            status: 429,
            expectedMessage: 'We are experiencing a high volume of requests. Please try again later.',
        },
        {
            status: 500,
            expectedMessage: 'We could not send the verification email. Please try again later.',
        },
    ])('throws the configured error message for status $status', async (testCase) => {
        // @ts-ignore
        (globalThis as any).useRuntimeConfig = () => ({ public: { baseUrl: 'https://api.test' }});

        const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: testCase.status,
        });
        // @ts-ignore
        (globalThis as any).fetch = mockFetch; // replaces the real fetch() with the test’s mock

        await expect(postNotificationEmail('test@example.com', 'record-key'))
            .rejects.toThrow(testCase.expectedMessage);
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

});
