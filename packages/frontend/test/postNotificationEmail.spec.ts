import { describe, it, expect, vi, afterEach } from 'vitest';
import { postNotificationEmail } from '~/services/azureFuncs';
import CreateRecord from '~/components/Provenance/CreateRecord.vue';

const parseNotificationEmails = (emailInput: string) => {
    const snackbar = { add: vi.fn() };
    const component = {
        emailInput,
        $snackbar: snackbar
    };
    const parseEmails = (CreateRecord as any).methods.parseNotificationEmails;
    if (!parseEmails) {
        throw new Error('CreateRecord.parseNotificationEmails method not found');
    }
    const result = parseEmails.call(component);

    return { result, snackbar };
};

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
            status: 200,
            json: vi.fn().mockResolvedValue({ token: 'test-token' }),
        });
        // @ts-ignore
        (globalThis as any).fetch = mockFetch;

        const testDeviceKey = '9mYGN9CpKs5cz42mZhaFuk';
        const testEmail = 'test@example.com';

        const token = await postNotificationEmail(testEmail, testDeviceKey);

        expect(mockFetch).toHaveBeenCalled();
        const calledUrl = mockFetch.mock.calls[0][0] as string;
        const calledOptions = mockFetch.mock.calls[0][1];

        expect(calledUrl).toContain('/notificationsubscription');
        expect(calledOptions.method).toBe('POST');
        expect(calledOptions.headers['Content-Type']).toBe('application/json');

        // Verify JSON body contents
        const body = JSON.parse(calledOptions.body);
        
        expect(body.recordKey).toBe(testDeviceKey);
        expect(body.email).toBe(testEmail);
        expect(token).toBe('test-token');
        // expect(body.tags).toEqual([]);
    });

    it('normalizes and removes duplicate notification email addresses', () => {
        const { result, snackbar } = parseNotificationEmails(
            ' First@Example.com, second@example.com, first@example.com '
        );

        expect(result).toEqual(['first@example.com', 'second@example.com']);
        expect(snackbar.add).not.toHaveBeenCalled();
    });

    it('rejects the notification email list when an address is invalid', () => {
        const { result, snackbar } = parseNotificationEmails(
            'valid@example.com, invalid-email'
        );

        expect(result).toBeNull();
        expect(snackbar.add).toHaveBeenCalledWith({
            type: 'error',
            text: 'Please enter valid email addresses separated by commas.'
        });
    });

    it('sends one subscription request per unique notification email address', async () => {
        // @ts-ignore
        (globalThis as any).useRuntimeConfig = () => ({ public: { baseUrl: 'https://api.test' }});
        const mockFetch = vi.fn().mockResolvedValue({
            status: 200,
            json: vi.fn().mockResolvedValue({ token: 'test-token' }),
        });
        // @ts-ignore
        (globalThis as any).fetch = mockFetch;

        const recordKey = '9mYGN9CpKs5cz42mZhaFuk';
        const { result: emails } = parseNotificationEmails(
            'first@example.com, second@example.com, FIRST@example.com'
        );

        await Promise.all(
            emails.map((email: string) => postNotificationEmail(email, recordKey))
        );

        const requestBodies = mockFetch.mock.calls.map(call => JSON.parse(call[1].body));
        expect(requestBodies).toEqual([
            { email: 'first@example.com', recordKey },
            { email: 'second@example.com', recordKey }
        ]);
    });

});
