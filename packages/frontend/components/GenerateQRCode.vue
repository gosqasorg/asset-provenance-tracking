<!-- 
    Generates a QR code for the device based on the device key.
    
    Learn more about the QR Code Library here: https://www.npmjs.com/package/qrcode-vue3 
-->

<template>
    <div>
    <!-- Custom download button -->
    <button id="new-button" class="btn mt-1 bg-sky px-5" @click="downloadQRCode">Download QR Code</button>

    

    <QRCodeVue3
            :value="`http://localhost:3001/provenance/${deviceKey}`"
            :width="200"
            :height="200"
            :qr-options="{
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: 'H'
            }"
            
            :download="true"
            downloadButton="new-button"
            :downloadOptions="{ name: 'vqr', extension: 'png' }"
            :image-options="{ hideBackgroundDots: true, imageSize: 0.4, margin: 10, crossOrigin: 'Anonymous' }"
            :corners-square-options="{ type: 'extra-rounded', color: '#4e3681' }"
            :corners-dot-options="{
                type: 'square',
                color: '#4e3681'
            }"
            :dots-options="{
                type: 'square',
                color: '#000000',

            }"
            @rendered="setQrCodeDataUrl"
          />
    </div>
</template>
  
<script>
    import QRCodeVue3 from "qrcode-vue3";
  
    export default {
        components: {
            QRCodeVue3
        },

        props: {
            deviceKey: {
            type: String,
            required: true,
            },
        },
        data() {
            return {
                qrCodeDataUrl: '' // To store the base64 data URL of the QR code
            };
        },
        methods:{
            setQrCodeDataUrl(dataUrl) {
                this.qrCodeDataUrl = dataUrl;
            },
            downloadQRCode() {
                const link = document.createElement('a');
                link.href = this.qrCodeDataUrl;
                link.download = 'vqr.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }    

export function setQrCodeDataUrl(dataUrl) {
    this.qrCodeDataUrl = dataUrl;
}

export function downloadQRCode() {
    const link = document.createElement('a');
    link.href = this.qrCodeDataUrl;
    link.download = 'vqr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
</script>


<style>
    #new-button {
        content: "Download QR Code";
        color: #000;
    }

</style>