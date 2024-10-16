import QRCodeStyling, { Options } from 'qr-code-styling';

export default defineNuxtPlugin((nuxtApp) => {
    let qrCodeStyling: QRCodeStyling;
    return {
        provide: {
            // Provide a helper that returns an instance of QRCodeStyling
            qrCodeStyling: (options: Partial<Options>) : QRCodeStyling => {
                if (qrCodeStyling) return qrCodeStyling;
                qrCodeStyling = new QRCodeStyling(options);
                return qrCodeStyling;
            },
        }
    }
});