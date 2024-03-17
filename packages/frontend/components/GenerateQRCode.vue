<!-- 
    Generates a QR code for the device based on the device key.
    
    Learn more about the QR Code Library here: https://www.npmjs.com/package/qrcode-vue3 
-->

<template>
    <div>
  
     <QRCodeVue3
            :value="`http://localhost:3001/provenance/${deviceKey}`"
            :download="true"
            downloadButton="my-button"
            :downloadOptions="{ name: 'vqr', extension: 'png' }"
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
    }
</script>