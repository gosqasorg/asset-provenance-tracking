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
    <div class="popup" v-if="annotatePopUp">
        <div class="popup-inner">
            <h2 class="text-iris">Annotate all children</h2>
            <p>You've selected “Annotate all children” for this record entry. If you proceed, this message will be posted to all child records.</p>
            
            <div>
                <!-- Cancels the record creation (close pop up) -->
                <button-component @click="closePopUp()" class="learn-more confirmBtn" id="goBackBtn" buttonText="Go back" backgroundColor="#ffffff00"
                    borderColor="#4E3681" color="#322253" margin="0px 15px 0px 0px"></button-component>

                <!-- Continues the record creation (call submit function) -->
                <button-component class="learn-more confirmBtn" id="continueBtn" buttonText="Create entry" @click="submitRecord()"></button-component>
            </div>

        </div>
    </div>
    
    <form enctype="multipart/form-data" class='bg-frost mb-5' @submit.prevent="trackingForm">
      <h5 class="text-iris">Create New Record Entry</h5>
      <div>
        <input type="text" class="form-control" name="description" id="provenance-description" v-model="description" placeholder="Description" maxlength="5000" required/>
        <div v-if="isGroup">           
            <input type="text" class="form-control" name="children-key" id="children-key" v-model="childKeyText" placeholder="Group Record Keys (optional, separated with a comma)"/>
        </div>
        <div v-else>
            <input type="text" class="form-control" name="container-key" id="container-key" v-model="groupKey" placeholder="Group Key (optional)"/>
        </div>
 
        <div>
            <span v-for="(childkey1, index) in newChildKeys" :key="childkey1">
                {{ childkey1 }}{{ index !== newChildKeys.length - 1 && childkey1.endsWith(',') ? ' ' : ''}}
            </span>
        </div>
        <div>
            <h5 class="text-iris">Image (optional)</h5>
            <input type="file" class="form-control" accept="*" @change="onFileChange" capture="environment" multiple />
        </div>
        <h5 class="text-iris">Add Tags (optional)</h5>
        <ProvenanceTagInput id="provenanceTag" v-model="tags" @updateTags="handleUpdateTags" placeholder="Record Tag"/>
        <div>
            <span v-for="(tag, index) in tags" :key="tag">{{ tag }}{{ index !== tags.length - 1 ? ', ' : '' }} </span>
        </div>

        <h5 class="text-iris p-1 mt-3" v-if="isGroup">
            <input type="checkbox" class="form-check-input" id="annotate-all" v-model="annotateAll"/> Annotate all children
        </h5>
        <h5 class="text-iris p-1 mt-0" v-if="isGroup">
            <input type="checkbox" class="form-check-input" id="recall-all" v-model="recallAll"/> Recall all children
        </h5>
    </div>
    <div class="d-grid" id="submit-button">
        <button-component buttonText="Create Record Entry" type="submit" />
    </div>
    </form>
 </template>
 
 <script lang="ts">
 import { postProvenance, getProvenance } from '~/services/azureFuncs';
 import { EventBus } from '~/utils/event-bus';
 import { addChildKeys, addToGroup, notifyChildren, recallChildren } from '~/utils/descendantList';
 import { validateKey } from '~/utils/keyFuncs';

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
            annotatePopUp: false
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
    },
    methods: {
        closePopUp() {
            this.annotatePopUp = false
        },
        async trackingForm() {
            const annotateCheckBox = document.getElementById("annotate-all");
            const recallCheckBox = document.getElementById("recall-all");

            if (Object.is(annotateCheckBox, null) || Object.is(recallCheckBox, null)) {
                // Check for null (in case this is a child node)
                this.submitRecord()
            } else if (annotateCheckBox.checked == true) {
                this.annotatePopUp = true
            } else if (recallCheckBox.checked == true) {
                // TODO: differentiate wording from annotate!!
                this.annotatePopUp = true
            } else {
                this.submitRecord()
            }
        },
        handleUpdateTags(tags: string[]) {
            this.tags = tags;
        },
        onFileChange(e: Event) {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            if (files) {
                this.pictures = Array.from(files);
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
        },
        async submitRecord() {
            // Get a refreshed copy of the records
            const records = await getProvenance(this.recordKey);
           
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
                        await addToGroup(this.groupKey, records);
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
                        console.log("Adding child keys...", this.newChildKeys);
                        await addChildKeys(records, this.newChildKeys, []);
                    } else {
                        this.$snackbar.add({
                            type: 'warning',
                            text: `No valid child keys to add.`
                        });
                    }
                }
            } catch (error) {
                this.$snackbar.add({
                    type: 'error',
                    text: `Error adding child keys: ${error}`
                });
            }
 
            // Notify children (update their records w/ tags)
            if (this.annotateAll) {
                this.tags.push("annotate");
                notifyChildren(records, this.tags);
            }
 
            // Recall children (update their records w/ tags AND description), move to top of record
            if (this.recallAll) {
                this.tags.push("recall");
                recallChildren(records, this.tags, this.description);
            }
 
            // TODO: if a record has a recall tag (which you can add above) then put it permanently at the top of the feed!
            // Append the record to the records.
            try {
                const record = {
                    blobType: 'deviceRecord',
                    description: this.description,
                    tags: this.tags,
                    children_key: this.newChildKeys.length > 0 ? this.newChildKeys : '',
                };
 
                await postProvenance(this.recordKey, record, this.pictures || []);
               
                // Refresh CreateRecord component
                this.refresh();
 
                // Emit an event to notify the Feed.vue component
                EventBus.emit('feedRefresh');
            } catch (error) {       
                this.$snackbar.add({
                    type: 'error',
                    text: `Error creating record: ${error}`
                });
            }
        },
    }
 };

 </script>
 
 <style scoped>
  form {
      border-radius: 6px;
      display: block;
      margin-bottom: 30px;
  }
  /* Style for the placeholder text */
    .form-control::placeholder {
    color: gray;
    font-size: 18px;
 }

  #submit-button {
      margin-top: 24px;
  }
 
  input {
    border: 0;
  }
 
  input[type=text] {
    height: 36px;
    font-size:18px;
  }
 
  input[type=file] {
    height:36px;
    font-size: 18px;
    line-height: 27px;
  }
 
  input[type=checkbox] {
    margin-right: 10px;
  }
 
  #provenanceTag{
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
    height: 300px;
    border-radius: 20px;
  }

  .confirmBtn {
    display: inline-block;
    width: 48%;
  }

  /* For screens smaller than 768px */
  @media (max-width: 768px) {
    h5{
        margin-top: 20px;
    }
    input[type=text] {
        margin-top: 12px;
    }
    form {
        padding: 2px 17px 17px 17px;
    }
  }

  /* For screens larger than 768px */
  @media (min-width: 768px) {
    h5{
        margin-top: 24px;
    }
    input[type=text] {
        margin-top: 16px;
    }
    form {
        padding: 2px 20px 20px 20px;
    }
  }

 </style>
