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

    <div class="record-container">
        <div class="my-4 mb-2 parent-container" v-if="!isLoading" :key="loadingKey">
            <div class="row justify-content-between main-container">
                <section id="device-details" class="details-container">
                    <div class="record-description">
                        <div class="my-4 fs-1">
                            <p class="h text-bold mb-0">Asset History Records</p>
                            <h1 class="mt-1 mb-1">
                                {{ deviceRecord?.deviceName }}
                            </h1>
                        </div>

                        <div class="h5">Record Key: {{ route.params.deviceKey }}</div>
                        <div class="mb-3" id="desc">
                            <span style="word-wrap: break-word;"
                                v-html="clickableLink(deviceRecord?.description)"></span>
                        </div>
                    </div>

                    <div class="qr-code-wrapper">
                        <QRCode :url="qrCodeUrl" ref="qrcode_component" style="overflow: hidden;" />
                    </div>
                </section>

                <div class="buttons-container">
                    <button class="btn px-3 device-btn view-history" @click="viewRecord">View History Records</button>
                    <button class="btn px-3 device-btn download-qr" @click="downloadQRCode">Download QR Code</button>

                    <!-- Share dropdown -->
                    <div class="share-container">
                        <button id="shareRecordBtn" class="btn share-btn device-btn" data-bs-toggle="collapse"
                            data-bs-target="#share-dropdown" @click="buttonFormat">
                            Share Record Link
                            <picture v-if="!shareDropdown">
                                <source srcset="../../assets/images/darkmode-dropdown.svg"
                                    media="(prefers-color-scheme: dark)">
                                <img src="../../assets/images/dropdown-icon.svg" class="dropdown-image">
                            </picture>
                            <picture v-else>
                                <source srcset="../../assets/images/darkmode-up-dropdown.svg"
                                    media="(prefers-color-scheme: dark)">
                                <img src="../../assets/images/up-dropdown-icon.svg" class="dropdown-image">
                            </picture>
                        </button>

                        <ul id="share-dropdown" class="collapse" style="padding: 5px 20px 15px 20px;">
                            <li class="dropdown-item" style="padding: 7px">
                                <a @click="copy()" class="drop-text item-link">Copy</a>
                            </li>
                            <li class="dropdown-item" style="padding: 7px">
                                <a @click="text()" class="drop-text item-link">Messages</a>
                            </li>
                            <li class="dropdown-item" style="padding: 7px">
                                <a @click="mail()" class="drop-text item-link">Email</a>
                            </li>
                            <li class="dropdown-item" style="padding: 7px">
                                <a @click="whatsApp()" class="drop-text item-link">WhatsApp</a>
                            </li>
                            <li class="dropdown-item" style="padding: 7px">
                                <a @click="telegram()" class="drop-text item-link">Telegram</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- QR -->
                <div class="col-sm-6 col-lg-3 mt-2">
                    <QRCode :url="qrCodeUrl" ref="qrcode_component" />
                </div>
            </div>
        </div>


        <div v-if="hasReportingKey"> Reporting Key:
            <div> <a :href="`/history/${deviceRecord?.reportingKey}`">{{ deviceRecord?.reportingKey }}</a></div>
        </div>
        <div v-if="(childKeys?.length > 0) || hasReportingKey">
            <div> Child Keys:
                <div>
                    <KeyList v-bind:keys="childKeys" />
                </div>
            </div>
            <CsvFile :recordKey="_recordKey"></CsvFile>
        </div>
        <ProvenanceCSV :recordKey="_recordKey"></ProvenanceCSV>
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
        // This method helps rerendering the site
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
        getDescription() {
            return encodeURIComponent(`Device Name: "${deviceRecord.deviceName}"\nDescription: "${deviceRecord.description}"\nClick Link & View Records: ${window.location.href}`);
        },
        copy() {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    alert('Record Link copied to clipboard!');
                })
                .catch((error) => {
                    console.error('Failed to copy text: ', error);
                    alert('Failed to copy Record Link. Please try again.');
                });
        },
        mail() {
            var shareDescr = this.getDescription();
            window.location = "mailto:?subject=GOSQAS%20Asset%20History%20Record%20Link&body=" + shareDescr;
        },
        text() {
            var shareDescr = this.getDescription();
            window.location = "sms:?&body=Record Link: " + shareDescr;
        },
        whatsApp() {
            var shareDescr = this.getDescription();
            window.location = "https://wa.me/send?text=" + shareDescr;
        },
        telegram() {
            var shareLink = encodeURIComponent(window.location.href);
            var shareDescr = encodeURIComponent(`Device Name: "${deviceRecord.deviceName}"\nDescription: "${deviceRecord.description}"`);
            window.location = "https://t.me/share?url=" + shareLink + "&text=" + shareDescr;
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
.record-container {
    padding: 5px 5px 5px 5px
}

.btn {
    padding: 16px 20px;
    border-radius: 10px;
    margin-right: 30px;
    margin-top: 20px;
    max-height: 61px;
}

.share-btn {
    margin-right: 0px;
}

#share-dropdown {
    border-radius: 0px 0px 10px 10px;
    margin-left: auto;
    margin-right: 0;
    list-style-type: none;
    padding-left: 10px;
    padding-right: 10px;
}

.dropdown-item {
    text-align: center;
    border-radius: 10px;
    padding: 7px;
}

.item-link {
    text-decoration: none;
    cursor: pointer;
}

.record-description {
    width: 60%;
    word-wrap: break-word;
}

.qr-container {
    width: 30%;
}

.main-container {
    justify-content: space-between;
}

.parent-container {
    margin-left: 4%;
    margin-right: 4%;
}

.details-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.record-description {
    margin-right: 15px;
    max-width: 60%;
}

.qr-code-wrapper {
    background-color: #4e3681;
    /* Purple outline */
    padding: 13px;
    padding-bottom: 7px;
    border-radius: 15px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transform: scale(0.775);
    margin: -20px;
    margin-left: -40px;
    height: min-content;
}

.buttons-container {
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
}


/* Switches to mobile sizing */
@media (max-width: 991px) {
    .record-description {
        width: 100%;
    }

    .share-container {
        width: 100%;
    }

    .buttons-container {
        width: 100%;
        margin-right: 40px;
    }

    .qr-container {
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

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    .record-container {
        background-color: #1E2019
    }

    h1,
    .h {
        color: #CCECFD;
    }

    .h5 {
        color: #FFFFFF;
    }

    #desc {
        color: #FFFFFF;
    }

    .view-history {
        background-color: #CCECFD;
        border: 2px solid #CCECFD !important;
        color: black;
    }

    .download-qr {
        background-color: #1E2019;
        border: 2px solid #FFFFFF;
        color: white;
    }

    .share-btn {
        background-color: #1E2019;
        border: 2px solid #FFFFFF;
        color: white;
    }

    #dropdown-item {
        background-color: #1E2019;
    }

    #share-dropdown {
        border: 2px solid #FFFFFF;
    }

    .drop-text {
        color: white;
    }

    .dropdown-item:hover {
        background-color: #4E3681;
    }
}

/* Light mode version*/
@media (prefers-color-scheme: light) {
    .record-container {
        background-color: #FFFFFF;
    }

    h1,
    .h {
        color: #4E3681;
    }

    .h5 {
        color: #1E2019;
    }

    #desc {
        color: #1E2019;
    }

    .view-history {
        background-color: #4e3681;
        border: #4e3681;
        color: white;
    }

    .download-qr {
        background-color: #CCECFD;
        border: #CCECFD;
        color: black;
    }

    .share-btn {
        background-color: #CCECFD;
        border: #CCECFD;
        color: black;
    }

    #share-dropdown {
        background-color: #CCECFD;
    }

    .drop-text {
        color: black;
    }

    .dropdown-item:hover {
        background-color: #e6f6ff;
    }
}
</style>
