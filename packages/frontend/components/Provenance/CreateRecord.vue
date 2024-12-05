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
    <form enctype="multipart/form-data" class='bg-frost' @submit.prevent="submitForm">
      <h5 class="text-iris">Create New Record Entry</h5>
      <div>
        <input type="text" class="form-control" name="description" id="provenance-description" v-model="description" placeholder="Description" />
        <div v-if="isGroup">            
            <input type="text" class="form-control" name="children-key" id="children-key" v-model="childKeys" placeholder="Group Record Keys (optional, separated with a comma)"/>
        </div>
        <div v-else>
            <input type="text" class="form-control" name="container-key" id="container-key" v-model="groupKey" placeholder="Group Key (optional)"/>
        </div>

        <div>
            <span v-for="(childkey1, index) in childKeys" :key="childkey1">
                {{ childkey1 }}{{ index !== childKeys.length - 1 && childkey1.endsWith(',') ? ' ' : ''}}
            </span>
        </div>
        <div>
            <h5 class="text-iris">Image (optional)</h5>
            <input type="file" class="form-control" accept="*" @change="onFileChange" capture="environment" multiple />
        </div>
        <h5 class="text-iris">Add Tags (optional)</h5>
        <ProvenanceTagInput class="form-control" id="provenanceTag" v-model="tags" @updateTags="handleUpdateTags" placeholder="Record Tag"/>
        <div>
            <span v-for="(tag, index) in tags" :key="tag">{{ tag }}{{ index !== tags.length - 1 ? ', ' : '' }} </span>
        </div>
        <h5 class="text-iris p-1 mt-0" v-if="isGroup">
            <input type="checkbox" class="form-check-input" id="notify-all" v-model="notifyAll"/> Notify all Children?
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
import { addChildKeys } from '~/utils/descendantList';


export default {

    data() {
        return {
            description: '',
            pictures: [] as File[] | null,
            tags: [] as string[],
            groupKey: '',
            childKeys: [] as string[],
            isReportingKey: false,
            notifyAll: false,
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
            const uniqueValues = [...new Set(this.childKeys)];
            return uniqueValues.filter(childKey => childKey); // Filter out empty strings if any
        },
        isGroup(): boolean {
            // children_key is "" if it is created as a record or [] if it is created as a group
            // The Boolean constructor returns false for "" and true for []
            return Boolean(this.deviceRecord?.children_key);
        },
    },
    methods: {
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
            this.childKeys = [];
            this.isReportingKey = false;
            this.notifyAll = false;
        },

        async messageChildren(childrenkeys: string[],recallReason: string, tags: string[]) {

            for (const key of childrenkeys) {
                if (key != "" && key != "undefined") {
                    postProvenance(key, {
                        blobType: 'deviceRecord',
                        description: recallReason,
                        children_key: '',
                        tags: tags,
                    }, this.pictures || [])
                }
            }


        },
        async submitRecord() {
            // Get a refreshed copy of the record
            const response = await getProvenance(this.recordKey);
            
            if (!response) {
                this.$snackbar.add({
                    type: 'error',
                    text: 'No provenance record found'
                })
                return;
            }

            let local_deviceRecord = response[0].record;
            const hasParent = local_deviceRecord.hasParent as boolean;
            this.isReportingKey = local_deviceRecord.isReportingKey;
            let descendantsList = await getChildrenKeys(this.recordKey);

            //here we post provenance if a container (parent) key was entered
            if (this.groupKey !== '') {
                if (hasParent) {
                    this.$snackbar.add({
                        type: 'error',
                        text: "Can't add group because this record already belongs to a group"
                    });
                    this.description = this.description + "\nError: Container could not be added.";

                } else {
                    // Check if the key is a child of the record.
                    if (descendantsList.indexOf(this.groupKey, 0) > -1) {
                        this.$snackbar.add({
                            type: 'error',
                            text: "Can't add group because it is a child of the record"
                        })
                        this.description = this.description + `\nError: Group could not be added.`;
                    } else{
                        await postProvenance(this.groupKey, {
                            blobType: 'deviceRecord',
                            description: this.description, // keep the same description?
                            tags: [],
                            children_key: [this.recordKey],
                            hasParent: true,
                        }, this.pictures || [])
                    }
                }
            }

            if (this.childKeys) {
                await addChildKeys(this.recordKey, this.childKeys, this.description || '', []);
            }

            const recall = this.tags.indexOf("recall", 0);        

            // "recall" is being added....
            if (recall > -1 || this.notifyAll) {
                let reason = ""
                if (recall > -1) { 
                    reason = "Recalled by Admin Key";
                } else { 
                    reason = this.description; 
                    this.tags = (this.tags).concat(['notify_all']);
                }

                if (this.isReportingKey) {
                    // reporting keys do not have the ability to recall
                    this.$snackbar.add({
                        type: 'error',
                        text: "Reporting keys cannot issue recalls"
                    })
                } else {
                    await this.messageChildren(descendantsList, reason, this.tags)                    
                    this.$snackbar.add({
                        type: 'success',
                        text: "Successfully issued recall to child records"
                    })
                }
                
            }
                        
            // Here we post the povenance itself... 
            try {
                await postProvenance(this.recordKey, {
                        blobType: 'deviceRecord',
                        description: this.description,
                        tags: this.tags,
                        children_key: this.childKeys,
                        hasParent: hasParent,
                }, this.pictures || []);
                
                // Refresh CreateRecord component
                this.refresh();

                // Emit an event to notify the Feed.vue component
                EventBus.emit('feedRefresh');
            } catch (error) {        
                this.$snackbar.add({
                    type: 'error',
                    text: `Error creating record: ${error}`
                })
            }
        },
        async submitForm() {
            await this.submitRecord()
            window.location.reload();
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
    height: 36px;
    border-radius: 6px;
    width: 100%;
    font-size: 18px;
  }

  /*  For screens smaller than 768px */
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

  /*  For screens larger than 768px */
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
