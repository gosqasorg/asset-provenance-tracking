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
            <div class="mb-3 rec">
                <span style="word-break: break-word;">This page allows you to add new record entries to existing keys while offline. Create entries here and they will be stored until you are back online, at which point they will be created automatically.</span>
            </div>
        </div>
        </section>
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
            this.isCreating = false;
        }
    }
}
};
</script>

<style scoped>
    @import '../../assets/css/history-form.css';
</style>