
import { describe, it, expect, vi, afterEach } from 'vitest';
import { postNotificationEmail } from '~/services/azureFuncs';

describe('postNotificationEmail', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        // Remove any stubbed globals to avoid cross-test contamination
        // @ts-ignore
        delete (globalThis as any).useRuntimeConfig;
        // @ts-ignore
        delete (globalThis as any).fetch;
    });

    it('calls backend notificationSubscription endpoint', async () => {
        // Stub useRuntimeConfig to return a predictable baseUrl
        // @ts-ignore
        (globalThis as any).useRuntimeConfig = () => ({ public: { baseUrl: 'https://api.test' }});

        // Mock fetch resolved with status 200
        const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
        // @ts-ignore
        (globalThis as any).fetch = mockFetch;

        await postNotificationEmail('test@example.com');

        //assertions to make sure the API call fired 
        expect(mockFetch).toHaveBeenCalled();

        const calledUrl = mockFetch.mock.calls[0][0] as string;
        const calledOptions = mockFetch.mock.calls[0][1];

        expect(calledUrl).toContain('/notificationSubscription');
        expect(calledOptions.method).toBe('POST');
        expect(calledOptions.body).toBeInstanceOf(FormData);
    });

    it('throws on non-200 responses', async () => {
        // @ts-ignore
        (globalThis as any).useRuntimeConfig = () => ({ public: { baseUrl: 'https://api.test' }});
        const mockFetch = vi.fn().mockResolvedValue({ status: 500, statusText: 'Server Error' });
        // @ts-ignore
        (globalThis as any).fetch = mockFetch;

        await expect(postNotificationEmail('test@example.com')).rejects.toThrow('postNotificationEmail: Failed to save email');
    });
});