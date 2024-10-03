<template>
    <button type="button" style="font-size: 18px;"class="btn mt-1 bg-sky px-5" v-on:click="downloadCSV">
        Download Children Keys as CSV
    </button>&nbsp
    <button style="font-size:18px;"class="btn mt-1 bg-sky px-5" @click="getQRCode">Download QR Code</button><br>
</template>

<script>
import GenerateQRCode from '~/components/GenerateQRCode.vue';
import KeyList from '~/components/KeyList.vue';
import QRCodeStyling from "~/qrcode/src/core/QRCodeStyling";
import { getChildrenKeys } from '~/utils/descendantList';
export default {
    components: {
        GenerateQRCode,
        KeyList,
    },
    props: {
        recordKey: {
        type: String,
        required: true,
        },
    },
    computed: {
            qrCodeValue() {
                return `http://localhost:3001/provenance/${this.deviceKey}`;
            }
    },
    methods: {
        getQRCode() {
                const qr = new QRCodeStyling({
                    width: 322, 
                    height: 361,
                    data: this.qrCodeValue,
                    imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: 0.2,  // Image size as a fraction of the QR code size
                    margin: 40,
                    crossOrigin: 'Anonymous'
                    },
                    dotsOptions: {
                    type: 'rounded',  // Rounded dots
                    color: '#000000'  // Color of the dots
                },
                cornersSquareOptions: {
                type: 'extra-rounded',  // Extra rounded corners for squares
                color: '#000000'        // Color of the square corners
                },
                cornersDotOptions: {
                type: 'extra-rounded',  // Extra rounded corners for dots
                color: '#4e3681'        // Color of the dot corners
                }
                });
            qr.download({ name: 'vqr', extension: 'png' });
            console.log("downloadQRcode")
        },
        async downloadCSV() {
            let keyList = await getChildrenKeys(this.recordKey);
            // Convert key to a link
            keyList = keyList.map(key => 'https://gosqas.org/provenance/' + key);
            // Replace comas with new lines
            keyList = String(keyList).replaceAll(",", "\n");

            const anchor = document.createElement('a');
            anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(keyList);
            anchor.target = '_blank';
            anchor.download = 'keys.csv';
            anchor.click();
        }
    }
}


</script>