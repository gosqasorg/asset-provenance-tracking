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
        <input type="text" class="form-control" name="container-key" id="container-key" v-model="containerKey" placeholder="Group Key (optional)"/>
        <input type="text" class="form-control" name="children-key" id="children-key" v-model="childrenKey" placeholder="Contained Record Keys (optional, separated with a coma)"/>
        <div>
            <span v-for="(childkey1, index) in childrenKey" :key="childkey1">
                {{ childkey1 }}{{ index !== childrenKey.length - 1 && childkey1.endsWith(',') ? ' ' : ''}}
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
        <h5 class="text-iris">
            <input type="checkbox" class="form-check-input" id="notify-all"/> Notify all Children?
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
import { getAllDescendants } from '~/utils/descendantList';


export default {

    data() {
        return {
            description: '',
            pictures: [] as File[] | null,
            tags: [] as string[],
            containerKey: '',
            childrenKey: [] as string[],
            hasParent: false,
            isReportingKey: false,
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
        const uniqueValues = [...new Set(this.childrenKey)];
        return uniqueValues.filter(childKey => childKey); // Filter out empty strings if any
    }
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
            this.containerKey = '';
            this.childrenKey = [];
            this.hasParent = false;
            this.isReportingKey = false;
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

            const response = await getProvenance(this.recordKey);
            let local_deviceRecord = response[0].record;
            this.hasParent = local_deviceRecord.hasParent;
            this.isReportingKey = local_deviceRecord.isReportingKey;
            let descendantsList = await getAllDescendants(this.recordKey);

            //here we post provenance if a container (parent) key was entered
            if (this.containerKey != '') {

                if (this.hasParent) {
                    console.log("This record already has a group.");
                    this.description = this.description + "\nError: Container could not be added.";

                } else {
                    // need to check if this parent is NOT a descendant of the record already
                    if (descendantsList.indexOf(this.containerKey, 0) > -1) { //check if container key is among descendants
                        // container is INDEED a descendant of this record
                        // therefore, this relationship shouldn't be created
                        console.log("This group is a descendant of this record.");
                        this.description = this.description + `\nError: Group could not be added.`;
                    } else{
                        postProvenance(this.containerKey, {
                            blobType: 'deviceRecord',
                            description: this.description, // keep the same description?
                            tags: [],
                            children_key: [this.recordKey],
                            hasParent: true,
                        }, this.pictures || [])
    
                        this.hasParent = true;
                    }
                }
            }

            if (this.childrenKey.length > 1) { // if user want to add children keys 
                let string_children = this.childrenKey.toString();
                let entered_children = string_children.split(",");
                entered_children = [...new Set(entered_children)]; //removing any duplicates
                let new_children_list = entered_children.slice(0); //copy this exact array
                let childExists, child_prov;
                for (let i of entered_children) {
                    let index = new_children_list.lastIndexOf(i);

                    //First, check if entered child exists
                    try { 
                        await getProvenance(i).then((response) => {
                            child_prov = response;
                            childExists = true;
                        });
                    } catch(error) {
                        new_children_list.splice(index, 1);
                        this.description = this.description + `\nError: Entered child key does not exist.`;
                        childExists = false;
                    }

                    // If entered child exist, check if it has a parent or is already a descendant of this device
                    if(childExists) {
                        const child_record = child_prov[0].record;
                        
                        if (child_record.hasParent) { // Child has a parent, cannot be added
                            this.description = this.description + `\nError: Entered child key already has a container.`;
                            new_children_list.splice(index, 1);
                        } else {
                            let descendants = await getAllDescendants(i);
                            if (descendants.includes(this.recordKey)) { // Device is a descendant of entered child, cannot be added
                                this.description = this.description + `\nError: Child device could not be added.`;
                                new_children_list.splice(index, 1);
                            } else {
                                postProvenance(i, {
                                blobType: 'deviceRecord',
                                description: "Added parent", // need to discuss whether we want to have a unique description
                                tags: [],
                                children_key: [],
                                hasParent: true,  // make sure the child has parent = true
                                }, this.pictures || [])
    
                            }
                        }
                    }                        
                }
                this.childrenKey = new_children_list;
            } 

        const recall = this.tags.indexOf("recall", 0);        

        // "recall" is being added....
        if (recall > -1 || (<HTMLInputElement>document.getElementById("notify-all")).checked) {
            let reason = ""
            if (recall > -1) { 
                reason = "Recalled by Admin Key";
            } else { 
                reason = this.description; 
                this.tags = (this.tags).concat(['notify_all']);
            }

            if (this.isReportingKey) {
                // reporting keys do not have the ability to recall
                console.log("Action failed. This is a reporting key.");
            } else {
                await this.messageChildren(descendantsList, reason, this.tags)
                .then(response => {
                    console.log("Finished recalling/informing");
                })
            }
            
        }
                       
        // Here we post the povenance itself...
        postProvenance(this.deviceKey, {
                blobType: 'deviceRecord',
                description: this.description,
                tags: this.tags,
                children_key: [this.childrenKey],
                hasParent: this.hasParent,
        }, this.pictures || [])
        .then(response => {
                // Refresh CreateRecord component
                this.refresh();

                // Emit an event to notify the Feed.vue component
                EventBus.emit('feedRefresh');
                
            })
            .catch(error => {
                // Handle error here
                console.error('Error occurred during post request:', error);
            });
        },

        async submitForm() {
            this.submitRecord()
            .then(response=> {
                window.location.reload(); //once they submit it just reloads the entire page.
            }); 
        },
    }

};
</script>

<style scoped>
  form {
      border-radius: 6px;
      display: block;
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
