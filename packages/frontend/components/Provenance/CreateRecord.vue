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
    This component is a form. The form is used to create a new device that we will track the
    providence for.
    Resourses:
    https://test-utils.vuejs.org/guide/essentials/forms
-->

<template>
    <form enctype="multipart/form-data" class='bg-frost' @submit.prevent="submitForm">
      <h5 class="text-iris">Create New History Record</h5>
      <div>
        <input type="text" class="form-control" name="description" id="provenance-description" v-model="description" placeholder="History Description" />
        <label>Tags (will be converted to lower case and duplicates removed)&nbsp&nbsp</label>
        <ProvenanceTagInput v-model="tags" @updateTags="handleUpdateTags"/>
        <div>
            <span v-for="(tag, index) in tags" :key="tag">
        {{ tag }}{{ index !== tags.length - 1 ? ', ' : '' }}
    </span>
        </div>
        <div style="display: block;">
            <label>Add Image (optional):    </label>
            <input type="file" class="form-control" accept="image/*" @change="onFileChange" capture="environment" multiple />
        </div>
        <label>Container Key (optional): </label>
        <input type="text" class="form-control" name="container-key" id="container-key" v-model="containerKey" />
        <label>Contained Devices Keys (optional, separated with a coma): </label>
        <input type="text" class="form-control" name="children-key" id="children-key" v-model="enteredChildKeys" />
        <div>
            <span v-for="(childkey1, index) in enteredChildKeys" :key="childkey1">
        {{ childkey1 }}{{ index !== enteredChildKeys.length - 1 && childkey1.endsWith(',') ? ' ' : ''}}
            </span>
        </div>
        <div>
            <h5 class="text-iris">Device Image (optional)    </h5>
            <input type="file" class="form-control" accept="*" @change="onFileChange" capture="environment" multiple />
        </div>
        <h5 class="text-iris">Add Tags (optional)</h5>
        <ProvenanceTagInput class="form-control" id="provenanceTag" v-model="tags" @updateTags="handleUpdateTags" placeholder="Device tag"/>
        <div>
            <span v-for="(tag, index) in tags" :key="tag">{{ tag }}{{ index !== tags.length - 1 ? ', ' : '' }} </span>
        </div>
        <h5 class="text-iris">
            <input type="checkbox" class="form-check-input" id="notify-all"/> Notify all Children?
        </h5>
    </div>
    <div class="d-grid" id="submit-button">
        <button-component buttonText="Create History Record" type="submit" />
    </div>
    </form>
</template>

<script lang="ts">
import { postProvenance, getProvenance } from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
import { getAllDescendants } from '~/utils/descendantList';
const baseUrl = 'https://gosqasbe.azurewebsites.net/api';


export default {

    data() {
        return {
            description: '',
            pictures: [] as File[] | null,
            tags: [] as string[],
            containerKey: '',
            enteredChildKeys: [] as string[],
            hasParent: false,
            isReportingKey: false,
        }
    },
    props: {
        deviceKey: {
            type: String,
            default: "",
            required: true,
        },
        deviceRecord: {
//            type: Any, // This needs to tighten up!
            default: null,
            required: true,
        },
    },
    computed: {
    uniqueChildrenKeys() {
        const uniqueValues = [...new Set(this.enteredChildKeys)];
        return uniqueValues.filter(childKey => childKey); // Filter out empty strings if any
    }
},
    methods: {
        handleUpdateTags(tags: string[]) {
            // console.log('handle Update Tags', tags);
            this.tags = tags;
        },
        onFileChange(e: Event) {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            if (files) {
                this.pictures = Array.from(files);
            }
            // console.log(deviceRecord);
        },
        refresh() {
            this.description = '';
            this.pictures = null;
            this.tags = [];
            this.containerKey = '';
            this.enteredChildKeys = [];
            this.hasParent = false;
            this.isReportingKey = false;
        },

        async messageChildren(childrenkeys: string[],recallReason: string, tags: string[]) {

            for (const key of childrenkeys) {
                // console.log("GOT KEY", key);

                if (key != "" && key != "undefined") {
                    postProvenance(key, {
                        blobType: 'deviceRecord',
                        description: recallReason,
                        children_key: [],
                        children_name: [],
                        tags: tags,
                    }, this.pictures || [])
                }
            }


        },
        async submitRecord() {

            const response = await getProvenance(this.deviceKey);
            let local_deviceRecord = response[0].record;
            this.hasParent = local_deviceRecord.hasParent;
            this.isReportingKey = local_deviceRecord.isReportingKey;
            let descendantsList = await getAllDescendants(this.deviceKey);
            let enteredChildNames:string[] = [];

            //here we post provenance if a container (parent) key was entered
            if (this.containerKey != '') {

                if (this.hasParent) {
                    console.log("This device already has a container.");
                    this.description = this.description + "\nError: Container could not be added.";

                } else {
                    // need to check if this parent is NOT a descendant of the device already
                    if (descendantsList.indexOf(this.containerKey, 0) > -1) { //check if container key is among descendants
                        // container is INDEED a descendant of this device
                        // therefore, this relationship shouldn't be created
                        console.log("This container is a descendant of this device.");
                        this.description = this.description + `\nError: Container could not be added.`;
                    } else{
                        postProvenance(this.containerKey, {
                            blobType: 'deviceRecord',
                            description: this.description, // keep the same description?
                            tags: [],
                            children_key: [this.deviceKey],
                            children_name: response[response.length - 1].record.deviceName,
                            hasParent: true,
                        }, this.pictures || [])
    
                        this.hasParent = true;
                    }
                }
            }

            if (this.enteredChildKeys.length > 1) { // if user want to add children keys 
                let string_children = this.enteredChildKeys.toString();
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
                        // console.log("Obtained provenance!");
                    } catch(error) {
                        // console.log("This child does not exist ", i)
                        new_children_list.splice(index, 1);
                        this.description = this.description + `\nError: Entered child key does not exist.`;
                        childExists = false;
                    }

                    // If entered child exist, check if it has a parent or is already a descendant of this device
                    if(childExists) {
                        const child_record = child_prov[0].record;
                        
                        if (child_record.hasParent) { // Child has a parent, cannot be added
                            console.log("Child key ", i, " already has a parent");
                            this.description = this.description + `\nError: Entered child key already has a container.`;
                            new_children_list.splice(index, 1);
                        } else {
                            let descendants = await getAllDescendants(i);
                            if (descendants.includes(this.deviceKey)) { // Device is a descendant of entered child, cannot be added
                                console.log("This device key is among descendants.");
                                this.description = this.description + `\nError: Child device could not be added.`;
                                new_children_list.splice(index, 1);
                            } else { // Here we finally add the child as it has passed all the requirements
                                enteredChildNames = enteredChildNames.concat(child_prov[child_prov.length-1].record.deviceName);
                                postProvenance(i, {
                                blobType: 'deviceRecord',
                                description: "Added parent", // need to discuss whether we want to have a unique description
                                tags: [],
                                children_key: [],
                                children_name: [],
                                hasParent: true,  // make sure the child has parent = true
                                }, this.pictures || [])
    
                            }
                        }
                    }                        
                }
                this.enteredChildKeys = new_children_list;
                
            } 

        const recall = this.tags.indexOf("recall", 0);        

        // "recall" is being added....
        if (recall > -1 || (<HTMLInputElement>document.getElementById("notify-all")).checked) {
            let reason = ""
            // let tags = this.tags
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
                // console.log("begin to recall");
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
                children_key: this.enteredChildKeys,
                children_name: enteredChildNames,
                hasParent: this.hasParent,
        }, this.pictures || [])
        .then(response => {
                // Handle successful response here
                console.log('Post request successful:', response);
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
                console.log("form is submitted!");
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
