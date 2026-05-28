<!-- offline.vue -- offline management of device
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

<!--
Page will be the forum where users can add to the provenance of
their items while offline.
-->

<script setup lang="ts">
    const route = useRoute()
</script>

<template>
<div v-if="isCreating">
	<p class="text-center pb-5 pt-5">Creating record(s)...</p>
</div>
<div v-else>
    <div class="deviceKey-history">
        <div class="row pt-3 pb-6 mx-4">
            <!-- Display record key -->
            <section id="device-details" class="details-container">
            <div class="record-description">
                <div class="my-4 text-iris fs-1">
                <p class="text-bold mb-0 device-name">Asset History Records</p>
                <h1 class="mt-1 mb-1" style="word-break: break-word;">
                    Offline Creation Page
                </h1>
                </div>
                <div class="rec">
                    <span style="word-break: break-word;">This page allows you to add new record entries to existing keys while offline. Create entries here and they will be stored until you are back online, at which point they will be created automatically. If you want to scan a QR while offline please use the button below.</span>
                </div>
            </div>
            </section>
        </div>

        <!-- Button to Scan QRs while offline -->
        <div style="padding-left: 40px">
            <video class="mt-3" id="qr-scan-video" ref="video" preload="auto" autoplay playsinline style="display:none"></video>
            <canvas ref="canvas" hidden ></canvas>
            <input class="btn record-button mt-3" value="Scan QR Offline" type="button" @click="qrCameraOffline" accept="image/*" capture="environment" />
        </div>

        <!-- Form to create a history record -->
        <section id="create-record">
        <form enctype="multipart/form-data" class='record-form mb-4' @submit.prevent="submitRecord">
            <h5>Create New Record Entry</h5>
            <div>
                <input type="text" class="form-control" v-model="recordKey" required placeholder="Record Key" maxlength="500" @keydown.enter.prevent>  
                <textarea id="provenance-description" v-model="description"
                    placeholder="Description" maxlength="5000" rows="3"></textarea>
                <div>
                    <h5>Image (optional)</h5>
                    <input type="file" class="form-control" accept="*" @change="onFileChange" capture="environment"
                        multiple />
                </div>
                <h5>Add Tags (optional)</h5>
                <ProvenanceTagInput id="provenanceTag" v-model="tags" @keydown.enter.prevent @updateTags="handleUpdateTags"
                    placeholder="Record Tag" />
                <div>
                    <span v-for="(tag, index) in tags" :key="tag">{{ tag }}{{ index !== tags.length - 1 ? ', ' : '' }}
                    </span>
                </div>
            </div>

            <!-- Offline Banner Bottom-->
            <Banner v-if="displayBanner" class="banner offline-banner" style="align-items: center; display: flex">
                <div class="danger-symbol" style="justify-content: left; font-size: 27px; margin-left: -10px;color: #fe9c9e;">&#9888;
                </div>
                <div style="margin-left: 10px;"><strong>You're offline:</strong> To post your changes, reopen this window when you're online again. Don't clear your cookies or your changes will be lost.
                </div> 
            </Banner>

            <!-- Back Online Banner -->
            <Banner v-if="onlineBannerToggle" class="banner online-banner" style="align-items: center; display: flex">
                <img src="../../assets/images/online-check-icon.svg" style="margin-left: -6px;">
                <div style="margin-left: 10px;"><strong>You're back online!</strong>  Click on the link to view the posted records >>Back Online Page Link Here (This feature is still in development)<<
                </div>
            </Banner>

            <div class="d-grid mt-3" id="submit-button">
                <button class="mb-0 record-button" type="submit" style="
                    border-width: 2px;
                    border-style: solid;
                    border-radius: 10px;
                    padding: 10px 20px;
                    margin: 0px;
                    font-size: 20px;
                    font-weight: 400;
                    line-height: 30px;
                    ">
                    Create Record Entry
                </button>
            </div>
        </form>
        </section>
    </div>
</div>
</template>

<script lang="ts">
import { postProvenance, displayOfflineBanner, displayOnlineBanner } from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
import { validateFileSize } from '~/utils/fileSizeValidation';
import jsQR from 'jsqr';
import { ref } from 'vue';

const video = ref()
const canvas = ref()
let qrdata = null
let cameraOn = false
let listenerMade = false

export default {
data() {
	return {
        isCreating: false,
        description: "",

        recordKey: "",
        pictures: [] as File[] | null,
        tags: [] as string[],
	}
},
computed: {
    // Controls the visibility of offline banner based on global variable displayOfflineBanner
	displayBanner() {
		if (displayOfflineBanner === true) {
			return true;
		} else {
			return false;
		}
		},
    // Controls the visibility of online banner based on global variable displayOnlineBanner
    onlineBannerToggle() {
        if (displayOnlineBanner === true) {
            return true;
        } else {
            return false;
        }
    },
},
async mounted() {
	try {
        const route = useRoute();
        this.recordKey = route.query.key as string;
        
        EventBus.on('feedRefresh', this.refreshFeed);

        await this.refreshFeed();
        
	} catch (error) {
        this.isCreating = false;
        setTimeout(() => {
        }, 1000); // logs after 1 second
        console.log(error)
	}
},
beforeDestroy() {
	EventBus.off('feedRefresh', this.refreshFeed);
},
methods: {
	async refreshFeed() {
        console.log("Refreshing feed...");

        if (this.isCreating) {
            this.$snackbar.add({
            type: 'success',
            text: 'Successfully created the record'
            })
        }

        this.isCreating = false;
	},
    handleUpdateTags(tags: string[]) {
        this.tags = tags;
    },
    async onFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const files = target.files;

        if (!files || files.length === 0) return;

        const maxFileSize = 2097152;

        let validFileSize = true;

        for (const file of Array.from(files)) {
            const validResults = await validateFileSize(file, maxFileSize);
            if (!validResults.valid) {
                validFileSize = false;
                break;
            }
        }

        if (validFileSize) {
            // All files are valid, set this.pictures to the selected files
            this.pictures = Array.from(files);
        } else {
            this.$snackbar.add({
                type: 'error',
                text: `File is too large, please choose a file less than ${maxFileSize / 1048576}MB in size`
            })
            target.value = '';
            this.pictures = null;
        }
    },
    refresh() {
        this.description = '';
        this.pictures = null;
        this.tags = [];
    },
    async submitRecord() {
        // Display loading screen
        if (!this.isCreating) {
            this.isCreating = true;
        } else {
            this.isCreating = false;
        }
        
        // Append the record to the records.
        try {
            const record = {
                blobType: 'deviceRecord',
                description: this.description,
                tags: this.tags,
                children_key: '',
            };

            await postProvenance(this.recordKey, record, this.pictures || []);

            // Refresh CreateRecord component
            this.refresh();
            this.refreshFeed();

        } catch (error) {
            this.$snackbar.add({
                type: 'error',
                text: `Error creating record: ${error}`
            });
            this.refresh()
            this.isCreating = false;
        }
    },
    async qrCameraOffline () {
        // Prevent spam clicking/reloading of the camera
        if (!cameraOn) {
            cameraOn = true;
        } else {
            return;
        }

        // Constraints of video screen to fit on most mobile devices
        const constraints = {
            video: {
                width: {ideal: 1280},
                height: {ideal: 720},
                facingMode: "environment",
                aspectRatio: {ideal: 1.777777778}
            }
        }
        try {
            var videoDisplay = document.getElementById("qr-scan-video");
            if (videoDisplay && videoDisplay.style.display === "none") {
                videoDisplay.style.display = "block";
            }
            
            // Get user permission to use camera then display camera view once readyState is 4 or 'loadedmetadata'
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                video.value.srcObject = stream;
                video.value.load();

                // Make sure we only ever create one event listener
                if (!listenerMade) {
                    video.value.addEventListener('loadedmetadata', () => {
                        listenerMade = true;
                        video.value.play()
                        requestAnimationFrame(this.tick)
                    })
                }
            })
        } 
        catch (error) {
            alert(error);
        }
    },
    tick () {
        // Draw video elements onto canvas to get image data
        canvas.value.width = video.value.videoWidth;
        canvas.value.height = video.value.videoHeight;
        var ctx = canvas.value.getContext('2d' , { willReadFrequently: true })
        ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
        var imageData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);

        // Parse ImageData using jsQR to extract deviceKey
        qrdata = jsQR(imageData.data, imageData.width, imageData.height);
        var toRegEx = qrdata?.data;

        // Use RegEx to extract the deviceKey to display to user
        if (toRegEx) {
            var deviceKey = toRegEx.match('([^/]*)$');
            if (deviceKey) {
                this.recordKey = deviceKey[1] || "";
            }
            alert('QR Code Scanned');

            // Close the video stream when done
            const stream = video.value.srcObject;
            if (stream) {
                const tracks = stream.getTracks();

                tracks.forEach((track: any) => {
                    track.stop()
                })
                video.value.srcObject = null
            }

            // Hide the video element
            var videoDisplay = document.getElementById("qr-scan-video");
            if (videoDisplay && videoDisplay.style.display === "block") {
                videoDisplay.style.display = "none";
            }
            cameraOn = false;
        }
        // Loop to keep scanning for qr code
        if (cameraOn) {
            requestAnimationFrame(this.tick);
        }
        }
    }
};
</script>

<style scoped>
    @import '../../assets/css/history-form.css';

    /* Make video rescale dynamically */
    #qr-scan-video {
        width: 95% !important;
        height: auto !important;
    }
</style>