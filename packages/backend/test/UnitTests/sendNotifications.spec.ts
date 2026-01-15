import { describe, it, expect, vi } from 'vitest';
import { postNotificationEmail } from '../../src/functions/sendNotifications';
import { json } from 'stream/consumers';

describe('PostNotificationEmail', () => {
    it("should return the email and record key", async() => {
        const mockRequest = {
            async json(){
               return {
                email:"test@test.com",
                recordKey:'123'
               }
            }
        
        } as any;

        const mockContext = {
            log: vi.fn(),
            error: vi.fn()
        } as any;

        const response = await postNotificationEmail(mockRequest, mockContext);
        expect(response.status).toBe(201);


    });
});