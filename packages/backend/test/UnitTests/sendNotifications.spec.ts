import { describe, it, expect, vi } from 'vitest';
import { postNotificationEmail } from '../../src/functions/sendNotifications';


describe('PostNotificationEmail', () => {
    it("should return the email and record key", async() => {
        const mockRequest = {
            async json(){
               return {
                email:"example@email.com",
                recordKey:"123"
               }
            }
        
        } as any;

        const mockContext = {
            log: vi.fn(),
            error: vi.fn()
        } as any;

        const response = await postNotificationEmail(mockRequest, mockContext);
        console.log(response)
        expect(response.status).toBe(201);


    });
});

// should i test for email format like .com
//should i also tests and make sure that the recordkey follows our rules...
