<!-- 
    Generates a QR code for the device based on the device key.
    
    Learn more about the QR Code Library here: https://www.npmjs.com/package/qrcode-vue3 
-->

<template>
    <div>
  
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
            downloadButton="my-button"
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

          />
    </div>
</template>
  
<script>
    // import QRCodeVue3 from "qrcode-vue3";
    import QRCodeVue3 from "qrcode-vue3/src/QRCodeVue3.vue";
  
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
    }
</script>


<style>
    #downloadbutton{
        content: "Download QR Code";
        color: #fff;
    }

</style>