import { describe, it, expect, vi, afterEach } from 'vitest';
import { postNotificationEmail } from '~/services/azureFuncs';
import EmailNotification from '~/components/Modals/EmailNotification.vue';
import { parseNotificationEmails } from '~/utils/notificationEmails';

const emailNotificationMethods = (EmailNotification as any).methods;

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
        const result = parseNotificationEmails(
            ' First@Example.com, second@example.com, first@example.com '
        );

        expect(result).toEqual(['first@example.com', 'second@example.com']);
    });

    it('rejects the notification email list when an address is invalid', () => {
        const result = parseNotificationEmails(
            'valid@example.com, invalid-email'
        );

        expect(result).toBeNull();
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
        const emails = parseNotificationEmails(
            'first@example.com, second@example.com, FIRST@example.com'
        );
        if (!emails) throw new Error('Expected valid notification emails');

        await Promise.all(
            emails.map(email => postNotificationEmail(email, recordKey))
        );

        const requestBodies = mockFetch.mock.calls.map(call => JSON.parse(call[1].body));
        expect(requestBodies).toEqual([
            { email: 'first@example.com', recordKey },
            { email: 'second@example.com', recordKey }
        ]);
    });

    it('normalizes and removes duplicate addresses entered in the notification modal', () => {
        const component = {
            email: ' First@Example.com, second@example.com, first@example.com ',
            emailError: null
        };

        const emails = emailNotificationMethods.validateNotificationEmails.call(component);

        expect(emails).toEqual(['first@example.com', 'second@example.com']);
        expect(component.emailError).toBeNull();
    });

    it('prepares the next modal email for verification', () => {
        const component = {
            verificationIndex: 0,
            pendingVerifications: [
                { email: 'first@example.com', token: 'first-token' },
                { email: 'second@example.com', token: 'second-token' }
            ],
            token: 'first-token',
            code: '123456',
            invalidAttempts: 1,
            resendCount: 1,
            verifyCooldownUntil: 100,
            verifyCooldownRemaining: 10,
            resendCooldownUntil: 100,
            resendCooldownRemaining: 10
        };

        const advanced = emailNotificationMethods.advanceToNextEmailVerification.call(component);

        expect(advanced).toBe(true);
        expect(component.verificationIndex).toBe(1);
        expect(component.token).toBe('second-token');
        expect(component.code).toBe('');
        expect(component.verifyCooldownRemaining).toBe(0);
        expect(component.resendCooldownRemaining).toBe(0);
    });

});
