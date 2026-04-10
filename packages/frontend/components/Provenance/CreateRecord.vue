<!--
CreateRecord.vue -- Creation of provenance record
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
   This component is a form. The form is used to create a new record that we will track the
   providence for.
   Resourses:
   https://test-utils.vuejs.org/guide/essentials/forms
-->

<template>
    <form enctype="multipart/form-data" class='record-form mb-4' @submit.prevent="trackingForm">
        <h5>Create New Record Entry</h5>
        <div>
            <textarea id="provenance-description" v-model="description"
                placeholder="Description" maxlength="5000" rows="3"></textarea>
            <div v-if="isGroup">
                <input type="text" class="form-control" name="children-key" id="children-key" v-model="childKeyText"
                    placeholder="Group Record Keys (optional, separated with a comma)" />
            </div>
            <div v-else>
                <input type="text" class="form-control" name="container-key" id="container-key" v-model="groupKey"
                    placeholder="Group Key (optional)" />
            </div>

            <div>
                <span v-for="(childkey1, index) in newChildKeys" :key="childkey1">
                    {{ childkey1 }}{{ index !== newChildKeys.length - 1 && childkey1.endsWith(',') ? ' ' : '' }}
                </span>
            </div>
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
            
            <h5 class="text-iris p-1 mt-3" v-if="isGroup">
                <input type="checkbox" class="form-check-input" id="annotate-all" v-model="annotateAll"/> Annotate all children
            </h5>
            <h5 class="text-iris p-1 mt-0" v-if="isGroup">
                <input type="checkbox" class="form-check-input" id="recall-all" v-model="recallAll"/> Recall all children
            </h5>
        </div>
        
        <!-- Offline Banner Bottom-->
        <Banner v-if="displayBanner" class="banner offline-banner" style="align-items: center; display: flex">
            <div class="danger-symbol" style="justify-content: left; font-size: 27px; margin-left: -10px; color: #fe9c9e;">&#9888;
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

    <div class="popup" v-if="recallPopUp">
        <div class="popup-inner recall-popup">
            <h2 class="text-iris">Recall all children</h2>
            <p>You've selected "Recall all children” for this record entry. If you proceed, this message will be recalled.</p>

            <div>
                <!-- Cancels the record creation (close pop up) -->
                <button-component @click="closePopUpR()" class="learn-more confirmBtn" id="goBackBtn" buttonText="Go back" backgroundColor="#ffffff00"
                    borderColor="#4E3681" color="#322253" margin="0px 15px 0px 0px"></button-component>

                <!-- Continues the record creation (call submit function) -->
                <button-component class="learn-more confirmBtn" id="continueBtn" buttonText="Create entry" @click="submitRecord()"></button-component>
            </div>

        </div>
    </div>
    <div class="popup" v-if="annotatePopUp">
        <div class="popup-inner">
            <h2 class="text-iris">Annotate all children</h2>
            <p>You've selected “Annotate all children” for this record entry. If you proceed, this message will be posted to all child records.</p>

            <div>
                <!-- Cancels the record creation (close pop up) -->
                <button-component @click="closePopUpA()" class="learn-more confirmBtn" id="goBackBtn" buttonText="Go back" backgroundColor="#ffffff00"
                    borderColor="#4E3681" color="#322253" margin="0px 15px 0px 0px"></button-component>

                <!-- Continues the record creation (call submit function) -->
                <button-component class="learn-more confirmBtn" id="continueBtn" buttonText="Create entry" @click="submitRecord()"></button-component>
            </div>

        </div>
    </div>
 </template>

 <script lang="ts">
 import { postProvenance, getProvenance, displayOfflineBanner, displayOnlineBanner } from '~/services/azureFuncs';
 import { EventBus } from '~/utils/event-bus';
 import { addChildKeys, addToGroup, notifyChildren, recallChildren } from '~/utils/descendantList';
 import { validateKey } from '~/utils/keyFuncs';
 import { validateFileSize } from '~/utils/fileSizeValidation';
 import Banner from '../Banner.vue';

 export default {
    data() {
        return {
            description: '',
            pictures: [] as File[] | null,
            tags: [] as string[],
            groupKey: '',
            childKeyText: '',
            newChildKeys: [] as string[],
            annotateAll: false,
            recallAll: false,
            annotatePopUp: false,
            recallPopUp: false
        }
    },
    props: {
        recordKey: {
            type: String,
            default: "",
            required: true,
        },
        deviceRecord: {
            // type: Any, // TODO: add type
            default: null,
            required: true,
        },
    },
    computed: {
        uniqueChildrenKeys() {
            const uniqueValues = [...new Set(this.newChildKeys)];
            return uniqueValues.filter(childKey => childKey); // Filter out empty strings if any
        },
        isGroup(): boolean {
            // children_key is "" if it is created as a record or [] if it is created as a group
            // The Boolean constructor returns false for "" and true for []
            return Boolean(this.deviceRecord?.children_key);
        },
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
    methods: {
        closePopUpA() {
            this.annotatePopUp = false
        },
        closePopUpR() {
            this.recallPopUp = false
        },
        async trackingForm() {

            if (Object.is(this.annotateAll, null) || Object.is(this.recallAll, null)) {
                // Check for null (in case this is a child node)
                this.submitRecord()
            } else if (this.recallAll) {
                this.recallPopUp = true
            } else if (this.annotateAll) {
                this.annotatePopUp = true
            } else {
                this.submitRecord()
            }
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
            this.groupKey = '';
            this.newChildKeys = [];
            this.annotateAll = false;
            this.recallAll = false;
            this.annotatePopUp = false;
            this.recallPopUp = false;
        },
        async submitRecord() {
            // Emit an event to notify the history/[deviceKey].vue page to display loading screen
            EventBus.emit('isCreating');

            // Get a refreshed copy of the records
            let records;
            try {
                records = await getProvenance(this.recordKey);
            } catch (e) {
                EventBus.emit('isCreating');
            }

            if (!records || records.length === 0) {
                this.$snackbar.add({
                    type: 'error',
                    text: 'No provenance record found'
                })
                return;
            }

            // User wants to add this record to an existing group.
            if (this.groupKey != '') {
                if (validateKey(this.groupKey)) {
                    try {
                        console.log("Adding to group...", this.groupKey);
                        const groupRecords = await getProvenance(this.groupKey);
                        await addToGroup(this.recordKey, this.groupKey, records, groupRecords);
                    } catch (error) {
                        console.error('Error adding to group:', error);
                        this.$snackbar.add({
                            type: 'error',
                            text: `Error adding to group: ${error}`
                        });
                    }
                } else {
                    this.$snackbar.add({
                        type: 'warning',
                        text: 'Group key is invalid. Not adding to group.'
                    });
                }
            }

            // The record already is a group - add the child keys.
            try {
                if (this.childKeyText.length > 0) {
                    this.newChildKeys = this.childKeyText.split(',').map(childKey => childKey.trim());
                    for (const childKey of this.newChildKeys) {
                        if (!validateKey(childKey)) {
                            this.$snackbar.add({
                                type: 'warning',
                                text: `Invalid child key: ${childKey}.`
                            });
                            // Remove the invalid key from the list
                            this.newChildKeys = this.newChildKeys.filter(key => key !== childKey);
                        }
                    }

                    if (this.newChildKeys.length > 0) {
                        await addChildKeys(this.recordKey, records, this.newChildKeys, []);
                    } else {
                        this.$snackbar.add({
                            type: 'warning',
                            text: `No valid child keys to add.`
                        });
                    }
                }
            } catch (error: any) {
                const badKeys = error.message.split(",");
                
                if (error.message.split(" ").length > badKeys.length) {
                    this.newChildKeys = [];
                    
                    this.$snackbar.add({
                        type: 'error',
                        text: `${error.message}`
                    });
                } else {
                    this.newChildKeys = this.newChildKeys.filter(key => !badKeys.includes(key));

                    for (const key of badKeys) {
                        this.$snackbar.add({
                            type: 'error',
                            text: `Child record ${key} already belongs to a group.`
                        });
                    }
                }
            }

            if (this.recallAll) {
                this.tags.push("recall");
            } else if (this.annotateAll) {
                this.tags.push("annotate");
            }

            // Append the record to the records.
            try {
                const record = {
                    blobType: 'deviceRecord',
                    description: this.description,
                    tags: this.tags,
                    children_key: this.newChildKeys.length > 0 ? this.newChildKeys : '',
                };

                await postProvenance(this.recordKey, record, this.pictures || []);

                if (this.recallAll) {
                    recallChildren(this.recordKey, this.tags, this.description);
                } else if (this.annotateAll) {
                    notifyChildren(this.recordKey, this.tags);
                }

                // Refresh CreateRecord component
                this.refresh();

                // Emit an event to notify history/[deviceKey].vue to refresh
                EventBus.emit('feedRefresh');

            } catch (error) {
                this.$snackbar.add({
                    type: 'error',
                    text: `Error creating record: ${error}`
                });
            }
        }
    }
};
</script>

<style scoped>
    @import '../../assets/css/history-form.css';
</style>
