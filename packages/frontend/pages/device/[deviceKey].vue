<!-- deviceKey.vue -- Adjustment for Device
Copyright (C) 2024 GOSQAS
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
<script setup lang="ts">
const route = useRoute()
const deviceKey = route.params.deviceKey;
</script>

<template>
  <div class="container-md my-4" v-if="!isLoading" :key="loadingKey">
    <div class="row justify-content-between">
        <div class="col-sm-6 col-lg-9">

            <h1 class="mt-4 mb-2 text-iris">{{deviceRecord.deviceName}}</h1>
            <!-- TODO: We might want to call this an Admin key if it has a reporting key -->
        
            <h5>Device Key: {{ route.params.deviceKey }}</h5>
            <div class="my-2"><span v-html="clickableLink(deviceRecord.description)"></span></div>
        
            <div> 

                <!-- Didn't use button componenet here, couldn't get the link to work with it -->

                <button class="btn mt-1 bg-iris text-white me-4 px-4"><a :href="`/provenance/${route.params.deviceKey}`" style="color: white; text-decoration: none">View Provenance Records</a></button>
                <button class="btn mt-1 bg-sky px-5" @click="getQRCode">Download QR Code</button>

            </div>

        </div>
        <div class="col-sm-6 col-lg-3 mt-2">

            <div><GenerateQRCode :deviceKey="route.params.deviceKey"></GenerateQRCode></div>

        </div>

    </div>

    <!--Put the Reporting Key here if there is one -->
    <div>
        <div v-if="hasReportingKey" class="mt-4 mb-2 text-iris fs-2">
        Reporting Key:
        </div>
            <div>
                <a :href="`/provenance/${deviceRecord.reportingKey}`">{{deviceRecord.reportingKey}}</a>
            </div>
    </div>

    <!--Put the Child List key here if there are any -->
    <div v-if="childKeys.length > 0 " class="mt-4 mb-2 text-iris fs-3"> ChildKeys: 
    <KeyList v-bind:keys="childKeys"/> </div>
    <div v-if="(childKeys.length > 0) || hasReportingKey "> 
    <br> <CsvChildren :deviceKey="route.params.deviceKey"></CsvChildren>
    </div>
  </div>
</template>
<script lang="ts">
import GenerateQRCode from '~/components/GenerateQRCode.vue';
import KeyList from '~/components/KeyList.vue';
import { getProvenance } from '~/services/azureFuncs';
import QRCodeStyling from "~/qrcode/src/core/QRCodeStyling";
import clickableLink from '~/utils/clickableLink';



let deviceRecord: any;

 // Here we are are going to want to read the device,
 //    but not all the provenance. We will use this to load
 //    the two components above, the reporting key component and
 //    the child list component.
 //    At present, get Provenance is our only function;
 //    we do not have a function for returning only the first
//    record of a device, but we probably should.

export default {
    components: {
        GenerateQRCode,
        KeyList,
    },
    data() {
        return {
            isLoading: true,
            hasReportingKey: false,
            childKeys: [],
            loadingKey: 0,
        }
    },
    computed: {
            qrCodeValue() {
                return `http://localhost:3001/provenance/${this.deviceKey}`;
            }
    },
    methods: {
        //This method helps rerendering the site
        forceRerender() { 
            this.loadingKey += 1;
        }, 
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
    },
    async mounted() {
        try {
            const route = useRoute();
            const deviceKey = route.params.deviceKey;
            const response = await getProvenance(deviceKey);
            deviceRecord = response[response.length - 1].record;
            console.log(deviceRecord);
            this.isLoading = false;
            this.hasReportingKey = (deviceRecord.reportingKey ? true : false);
            // We will remove the reportingKey, because although it is a child,
            // we have already rendered it.
            if (this.hasReportingKey) {
                const index = deviceRecord.children_key.indexOf(deviceRecord.reportingKey, 0);
                if (index > -1) {
                    deviceRecord.children_key.splice(index, 1);
                }
            }
            this.childKeys = deviceRecord.children_key;
        } catch (error) {
            console.log(error)
        }
    }
};


</script>
