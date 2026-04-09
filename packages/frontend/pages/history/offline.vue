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
        <!-- Offline Banner Top-->
        <Banner v-if="displayBanner" class="banner" style="align-items: center; display: flex">
            <div class="danger-symbol" style="justify-content: left; font-size: 27px; margin-left: -10px;color: #fe9c9e;">&#9888;
            </div>
            <div style="margin-left: 10px;"><strong>You're offline:</strong> Connect to the internet to view the most recent version of this page. Your changes
            will not be posted until you revisit this page while online.
            </div> 
        </Banner>

        <!-- Back Online Banner -->
        <Banner v-if="onlineBannerToggle" class="banner" style="align-items: center; display: flex">
            <div style="margin-left: 10px;"><strong>You're back online!</strong>  Click on the link to view the posted records >>Back Online Page Link Here (This feature is still in development)<<
            </div>
        </Banner>

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
                <!-- <input type="text" class="form-control" name="container-key" id="container-key" v-model="groupKey"
                        placeholder="Group or Group Record Keys (optional, separated with a comma)" /> -->
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
        // TODO NOTE: it's the same page but includes key query in url, not sure if that's okay/will still work on the PWA (make a note to test w/ PWA when merged?)
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

<!-- TODO: move styling to reusable folder (see notes) -->
<style scoped>
#create-record {
    margin-top: 30px;
    padding: 0px 30px;
}

form {
    border-radius: 6px;
    display: block;
    margin-bottom: 70px;
}

#submit-button {
    margin-top: 24px;
}

#provenance-description {
    padding: 5px;
    margin: 5px;
    display: flex;
    margin-left: auto;
    margin-right:auto;
    border-radius: 5px;
    width: 100%;
    border-radius: 7px;
    width: 100%;
    outline: none;
    border: none;
    padding-left: 14px;
}

#provenance-description::placeholder{
        color: black;
}

input {
    border: 0;
}

input[type=text] {
    height: 36px;
    font-size: 18px;
}

input[type=checkbox] {
    margin-right: 10px;
}

#provenanceTag {
    /* height: 36px; */
    border-radius: 6px;
    width: 100%;
    font-size: 18px;
}

.popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    background-color: rgba(0, 0, 0, 0.2);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .popup-inner {
    background: white;
    padding: 32px 32px 32px 32px;
    width: 665px;
    height: auto;
    border-radius: 20px;
  }

  .confirmBtn {
    display: inline-block;
    width: 48%;
  }


/*  For screens smaller than 768px */
@media (max-width: 768px) {
    h5 {
        margin-top: 20px;
    }

    input[type=text] {
        margin-top: 12px;
    }

    form {
        padding: 2px 17px 17px 17px;
    }

    .popup-inner {
        width: auto;
        margin: 0px 20px 0px 20px;
    }
    .confirmBtn {
        width: 100%;
    }
    #continueBtn {
        margin-top: 10px !important;
    }
}

/* For screens larger than 768px */
@media (min-width: 768px) {
    h5 {
        margin-top: 24px;
    }

    input[type=text] {
        margin-top: 16px;
    }

    form {
        padding: 2px 20px 20px 20px;
    }
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    .record-form {
        background-color: #4B4D47;
    }

    h5 {
        color: #FFFFFF;
    }

    .record-button {
        background-color: #CCECFD;
        color: black;
        border-color: #CCECFD;
    }

    input[type="file"]::file-selector-button {
        background-color: #CCECFD;
        color: black;
    }

    input[type="file"]::file-selector-button-hover {
        background-color: #67b0d7 !important;
        color: black;
    }

    input[type="file"]::-webkit-file-upload-button:hover {
        background-color: #0056b3;
    }
    .record-button:hover { 
        background-color: #e6f6ff;
    }
    input[type="file"]:hover::file-selector-button {
        background-color: #e6f6ff !important;
    }
    .banner {
        background-color: #634a45;
        border-color: #fe9c9e;
        border-width: 2px;
        border-style: solid;
        border-radius: 10px;
        padding: 10px 20px;
        margin: 0px;
        font-size: 14px;
        color: white;
    }
}

/* Light mode version*/
@media (prefers-color-scheme: light) {
    .record-form {
        background-color: #E6F6FF;
    }

    h5 {
        color: #4E3681;
    }

    .record-button {
        background-color: #4E3681;
        color: white;
        border-color: #4E3681;
    }

    input[type="file"]::file-selector-button {
        background-color: #4E3681;
        color: white;
    }
    .record-button:hover { 
        background-color: #322253;
    }
    .banner {
        background-color: #ecdae1;
        border-color: #fe9c9e;
        border-width: 2px;
        border-style: solid;
        border-radius: 10px;
        padding: 10px 20px;
        margin: 0px;
        font-size: 14px;
        color: black;
    }
}
</style>