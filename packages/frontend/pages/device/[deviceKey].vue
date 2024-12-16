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
const qrCodeUrl = `${useRuntimeConfig().public.frontendUrl}/provenance/${deviceKey}`;
</script>

<template>
  <div class="container-md my-4" v-if="!isLoading" :key="loadingKey">
    <div class="row justify-content-between">
        <div class="col-sm-6 col-lg-9">

            <h1 class="mt-4 mb-2 text-iris">{{deviceRecord.deviceName}}</h1>
            <!-- TODO: We might want to call this an Admin key if it has a reporting key -->
        
            <h5>Record Key: {{ route.params.deviceKey }}</h5>
            <div class="my-2"><span v-html="clickableLink(deviceRecord.description)"></span></div>
        
            <div> 
                <button class="btn mt-1 bg-iris text-white me-4 px-4" @click="viewRecord">View Provenance Records</button>
                <button class="btn mt-1 bg-sky px-5" @click="downloadQRCode" style="border-top-right-radius: 0px; border-bottom-right-radius: 0px;">Download QR Code</button>
                <!--Add something similar to the screen size conditional code in https://vscode.dev/github/gosqasorg/asset-provenance-tracking/blob/main/packages/frontend/pages/provenance/%5BdeviceKey%5D.vue#L35-L68, because the share icon button is attached to the Download QR Code button-->
                <button class="btn mt-1 bg-frost px-2" style="border-top-left-radius: 0px; border-bottom-left-radius: 0px; text-align: center;" @click="shareQRCode"><img style="width: 30px;"src="../assets/images/share-icon.png"></button>
            </div>

        </div>
        <div class="col-sm-6 col-lg-3 mt-2">

            <QRCode :url="qrCodeUrl" ref="qrcode_component"/>

        </div>

    </div>

    <div v-if="hasReportingKey"> Reporting Key:
        <div> <a :href="`/provenance/${deviceRecord?.reportingKey}`">{{deviceRecord?.reportingKey}}</a></div>
    </div>
    <div v-if="(childKeys?.length > 0) || hasReportingKey ">
        <div> Child Keys:
            <div> <KeyList v-bind:keys="childKeys"/> </div>
        </div>    
        <CsvFile :deviceKey="deviceKey"></CsvFile>
    </div>
  </div>
</template>
<script lang="ts">
import GenerateQRCode from '~/components/GenerateQRCode.vue';
import KeyList from '~/components/KeyList.vue';
import { getProvenance } from '~/services/azureFuncs';
import clickableLink from '~/utils/clickableLink';
import QRCode from '@/components/QRCode.vue';

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
            childKeys: [] as string[],
            loadingKey: 0,
            deviceRecord: {
                deviceName: "${this.deviceRecord.deviceName}",
                description: "${this.deviceRecord.description}"
            }
        };
    },
    
    methods: {
        //This method helps rerendering the site
        forceRerender() { 
            this.loadingKey += 1;
        },
        downloadQRCode() {
            const qrCodeComponent = this.$refs.qrcode_component as any;
            qrCodeComponent?.downloadQRCode()
        },
        getDescription() {
            const route = useRoute();
            return `Device Name: "${deviceRecord.deviceName}"\nDescription: "${deviceRecord.description}"\nClick link & view records: ${useRuntimeConfig().public.frontendUrl}/provenance/${route.params.deviceKey}`;
        },
        shareQRCode() {
                    const textToCopy = this.getDescription();
            // Use the modern Clipboard API if available
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    alert('QR Code Data copied to clipboard!');
                })
                .catch((error) => {
                    console.error('Failed to copy text: ', error);
                    alert('Failed to copy QR Code Data. Please try again.');
                });
        },
        viewRecord() {
            const route = useRoute();
            this.$router.push(`/provenance/${route.params.deviceKey}`);
        }
    },
    async mounted() {
        try {
            const route = useRoute();
            const deviceKey = route.params.deviceKey as string;
            const response = await getProvenance(deviceKey);
            deviceRecord = response[response.length - 1].record;
            this.isLoading = false;
            this.hasReportingKey = (deviceRecord.reportingKey ? true : false);
            const qrCodeUrl = `${useRuntimeConfig().public.frontendUrl}/provenance/${deviceKey}`;
        this.deviceRecord.qrCodeImage = qrCodeUrl;  // Add the QR code URL to the deviceRecord
        
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
            this.$snackbar.add({
                type: 'error',
                text: 'No record found'
            });
        }
    }
};


</script>
