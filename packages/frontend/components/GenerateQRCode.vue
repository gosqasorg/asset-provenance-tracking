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
    <button id="downloadbutton" class="btn my-3 bg-iris text-white" @click="downloadQRCode">Download QR Code</button>
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
            qrCodeDataUrl: ''
        };
    },
    methods: {
        
    }
}
</script>

<style>
#downloadbutton{
        content: "Download QR Code";
        color: #fff;
        background-color: #91c1f8; /* Match the blue color */
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
    border-radius: 5px;
    width: 100%;
    text-align: center;
    transition: background-color 0.3s ease;
    }
</style>
