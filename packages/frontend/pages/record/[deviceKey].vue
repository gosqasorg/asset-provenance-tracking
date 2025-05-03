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
import { useRoute } from 'vue-router';

const route = useRoute();
const recordKey = route.params.deviceKey;
const qrCodeUrl = `${useRuntimeConfig().public.frontendUrl}/history/${recordKey}`;

</script>

<template>
  <div class="container-md my-4 mb-2" v-if="!isLoading" :key="loadingKey">
    <div class="row justify-content-between">
        <!-- DESCR -->
        <div class="col-sm-6 col-lg-9 descr-container">
            <h1 class="mt-4 mb-2 text-iris">{{deviceRecord?.deviceName}}</h1>
            <h5>Record Key: {{ route.params.deviceKey }}</h5>
            <div class="my-2 mb-2"><span v-html="clickableLink(deviceRecord?.description)"></span></div>

            <div>
                <button class="btn bg-iris text-white px-3 device-btn" @click="viewRecord">View History Records</button>
                <button class="btn bg-sky px-3 device-btn" @click="downloadQRCode">Download QR Code</button>
                
                <!-- Share dropdown -->
                <button id="shareRecordBtn" class="btn bg-sky share-btn device-btn" data-bs-toggle="collapse" data-bs-target="#share-dropdown" @click="buttonFormat">
                    Share Record Link
                    <img v-if="!shareDropdown" src="../../assets/images/dropdown-icon.svg" class="dropdown-image">
                    <img v-else src="../../assets/images/up-dropdown-icon.svg" class="dropdown-image">
                </button>

                <!-- TODO: fix share button formatting on Device Page -->
                <ul id="share-dropdown" class="collapse border-0" style="padding: 5px 0px 15px 0px; background-color:#ccecfd;">
                    <li class="dropdown-item" style="padding: 7px">
                        <a @click="copy()" class="text-slate item-link">Copy</a>
                    </li>
                    <li class="dropdown-item" style="padding: 7px">
                        <a @click="text()" class="text-slate item-link">Messages</a>
                    </li>
                    <li class="dropdown-item" style="padding: 7px">
                        <a @click="mail()" class="text-slate item-link">Email</a>
                    </li>
                    <li class="dropdown-item" style="padding: 7px">
                        <a @click="whatsApp()" class="text-slate item-link">WhatsApp</a>
                    </li>
                    <li class="dropdown-item" style="padding: 7px">
                        <a @click="telegram()" class="text-slate item-link">Telegram</a>
                    </li>
                </ul>
            </div>
        </div>

        <!-- QR -->
        <div class="col-sm-6 col-lg-3 mt-2">
            <QRCode :url="qrCodeUrl" ref="qrcode_component"/>
        </div>
    </div>

    <div v-if="hasReportingKey"> Reporting Key:
        <div> <a :href="`/history/${deviceRecord?.reportingKey}`">{{deviceRecord?.reportingKey}}</a></div>
    </div>
    <div v-if="(childKeys?.length > 0) || hasReportingKey ">
        <div> Child Keys:
            <div> <KeyList v-bind:keys="childKeys"/> </div>
        </div>
        <CsvFile :recordKey="_recordKey"></CsvFile>
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
let dropdownVisible = false;

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
            _recordKey: "",
            shareDropdown: false
        }
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
        viewRecord() {
            const route = useRouter().currentRoute.value; // Bug workaround: https://stackoverflow.com/questions/76127659/route-params-are-undefined-in-layouts-components-in-nuxt-3
            navigateTo(`/history/${route.params.deviceKey}`);
        },
        buttonFormat() {
            let shareBtn = <HTMLDivElement>document.getElementById("shareRecordBtn");

            if (!dropdownVisible) { // button clicked, dropdown now visible
                dropdownVisible = true; 
                this.shareDropdown = true;
                shareBtn.style.borderRadius = "10px 10px 0px 0px";
            } else {
                dropdownVisible = false;
                this.shareDropdown = false;
                shareBtn.style.borderRadius = "10px";
            }
        },
      getURL() {
        var currLink = encodeURIComponent(window.location.href);
        return currLink;
      },
      copy() {
        navigator.clipboard.writeText(window.location.href);
      },
      mail() {
        var shareLink = this.getURL();
        window.location = "mailto:?subject=GOSQAS%20Asset%20History%20Record%20Link&body=Record%20Link:%20" + shareLink;
      },
      text() {
        var shareLink = this.getURL();
        window.location = "sms:?&body=Record Link: " + shareLink;
      },
      whatsApp() {
        var shareLink = this.getURL();
        window.location = "https://wa.me/send?text=Record Link: " + shareLink;
      },
      telegram() {
        var shareLink = this.getURL();
        var message = encodeURIComponent("Link to Asset History Records");
        window.location = "https://t.me/share?url=" + shareLink + "&text=" + message;
      },
    },
    async mounted() {
        try {
            const route = useRoute();
            this._recordKey = route.params.deviceKey as string; 
            const response = await getProvenance(this._recordKey);
            deviceRecord = response[response.length - 1].record;
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
            this.$snackbar.add({
                type: 'error',
                text: 'No record found'
            });
        }
    }
};
</script>

<style scoped>
.device-btn {
    padding: 16px 20px;
    border-radius: 10px;
    margin-right: 30px;
    margin-top: 20px;
}
.share-btn {
    margin-right: 0px;
}
#share-dropdown {
    width: 218px;
    border-radius: 0px 0px 10px 10px;
    margin-left: auto;
    margin-right: 0;
    list-style-type: none;
}
.dropdown-item {
  text-align: center;
  border-radius: 10px;
  padding: 7px;
}
.dropdown-item:hover {
  background-color: #e6f6ff;
}
.item-link {
  text-decoration: none;
  cursor: pointer;
}
.descr-container {
    width: fit-content;
}
.container-md {
    box-sizing: content-box;
}

/* Switches to mobile sizing */
@media (max-width: 767px) {
    .descr-container {
        width: 100%;
    }
    .device-btn {
        width: 100%;
        margin-right: 0px;
    }
    #share-dropdown {
        width: 100%;
    }
    .container-md {
        margin-top: 0px !important;
        box-sizing: border-box;
    }
}
</style>