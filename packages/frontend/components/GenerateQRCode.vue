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

            

            :download="false"
            downloadButton="new-button"
            :downloadOptions="{ name: 'vqr', extension: 'png' }"

            :image= "packages/frontend/public/favicon.ico"
            
            
            :corners-square-options="{ type: 'extra-rounded', color: '#000000' }"
            :corners-dot-options="{
                type: 'square',
                color: '#4F3399'
            }"
            :dots-options="{
                type: 'dots',
                color: '#3A3842',

            }"
            :background-options="{
                color: '#ffffff'
            }"
            
            @rendered="setQrCodeDataUrl"
          />
    </div>
</template>
  
<script>
    import QRCodeVue3 from "qrcode-vue3";
    import {EventBus} from '~/utils/event-bus.ts';

  
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
                qrCodeDataUrl: '',// To store the base64 data URL of the QR code
                //iconUrl: require('../assets/images/square-icon.png'),
            };
        },
        mounted() {
        // Use mounted hook as a fallback to get the QR code data URL
        this.$nextTick(() => {
            this.setQrCodeDataUrl(this.qrCodeDataUrl);
        });
        },
        methods:{
            setQrCodeDataUrl(dataUrl) {
                this.qrCodeDataUrl = dataUrl;
                console.log('Emitting QR code URL:', dataUrl);
                EventBus.emit('qrCodeGenerated', dataUrl);
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

</script>


<style>
    #new-button {
        content: "Download QR Code";
        color: #000;
    }

</style>