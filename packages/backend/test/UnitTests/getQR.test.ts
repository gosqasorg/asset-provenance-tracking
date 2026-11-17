import { describe, it, expect, vi } from 'vitest';
import { InvocationContext } from '@azure/functions';
import { getQR } from '/src/functions/httpTrigger';
import jsQR from 'jsqr';

describe('getQR', () => {
    it('Create a GDT QR code with a deviceKey from a created record', async () => {
        // Create a fake request with param
        const req = {
            params: { deviceKey: 'GEkQuAcRzfueE8Z4gckTzc'}
        }
    
    // Generate GDT QR code
    const qrData = await getQR(req);

    // Extract the MIME Type from QR code data
    const [header, base64Data] = qrData.body.split(',');
    const mimeType = header.split(':')[1].split(';')[0];

    // Test to confirm that a png is created and handed back
    expect(mimeType).toBe('image/png');
    
    })
})