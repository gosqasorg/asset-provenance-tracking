<!-- GenerateQRCode.vue -- QR Code for the Record
Copyright (C) 2024 GOSQAS Team
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. -->
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
            
            :download="false"
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
    import QRCodeVue3 from  "../qrcode/src/QRCodeVue3.vue";
    import QRCodeStyling from "../qrcode/src/core/QRCodeStyling";

  
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
        computed: {
            qrCodeValue() {
                return `http://localhost:3001/provenance/${this.deviceKey}`;
            }
        },
    }
        
    
    
</script>


<style>
    #downloadbutton{
        content: "Download QR Code";
        color: #fff;
    }

</style>