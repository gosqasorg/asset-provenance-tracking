<!--
    This component is a form. The form is used to create a new device that we will track the
    providence for.
    Resourses:
    https://test-utils.vuejs.org/guide/essentials/forms
-->

<template>
    <form enctype="multipart/form-data" @submit.prevent="submitForm">
      <h1>Create New History Record</h1>
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
        <input type="text" class="form-control" name="children-key" id="children-key" v-model="childrenKey" />
        <div>
            <span v-for="(childkey1, index) in childrenKey" :key="childkey1">
        {{ childkey1 }}{{ index !== childrenKey.length - 1 && childkey1.endsWith(',') ? ' ' : ''}}
    </span>
        </div>
    </div>
      <button id="submit-button" type="submit">Create New Record</button>
    </form>
</template>

<script lang="ts">
import { postProvenance, getProvenance } from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
const baseUrl = 'https://gosqasbe.azurewebsites.net/api';


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
        const uniqueValues = [...new Set(this.childrenKey)];
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
            this.childrenKey = [];
            this.hasParent = false;
            this.isReportingKey = false;
        },

        // gets all children given a key
        async getChildrenKeys(key: string) {

            let childKeysList:string = "";

            const response = await getProvenance(key);
            for (let i=0; i < response.length; i++) {

               childKeysList += response[i].record.children_key + ",";
            }

            let newChildKeysList = childKeysList.split(',');

            newChildKeysList = newChildKeysList.filter(c => String(c).trim()); // filter out if key = ""


            return newChildKeysList;
        },


        async recursivelyRecallChildren(childrenkeys: string[],recallReason: string) {
            // recalling the object is in fact supposed to be
            // recursive. This should probably be done in a separate
            // function; I am not sure where this code should live!
            // here we handle the "recall" functionality.
            // first add the recall tag here...

            for (const key of childrenkeys) {
                // console.log("GOT KEY", key);

                if (key != "" && key != "undefined") {
                    // console.log("successfully did a recrusive call on ", key);
                    let childrenList = await this.getChildrenKeys(key);
                    // console.log("these are the children", childrenList);
                    await this.recursivelyRecallChildren(childrenList, recallReason);

                    postProvenance(key, {
                        blobType: 'deviceRecord',
                        description: recallReason,
                        children_key: '',
                        tags: ["recall"],
                    }, this.pictures || [])
                }
            }


        },
        async submitRecord() {

            const response = await getProvenance(this.deviceKey);
            let local_deviceRecord = response[0].record;
            this.hasParent = local_deviceRecord.hasParent;
            this.isReportingKey = local_deviceRecord.isReportingKey;

            //here we post provenance if a container (parent) key was entered
            if (this.containerKey != '') {

                if (this.hasParent) {
                    console.log("This device already has a container.");
                } else {

                    postProvenance(this.containerKey, {
                        blobType: 'deviceRecord',
                        description: this.description,
                        tags: this.tags,
                        children_key: [this.deviceKey],
                        hasParent: true,
                    }, this.pictures || [])

                    this.hasParent = true;
                }
            }

        const index = this.tags.indexOf("recall", 0);
        
        let childrenList = await this.getChildrenKeys(this.deviceKey);

        // "recall" is being added....
        if (index > -1) {

            if (this.isReportingKey) {
                // reporting keys do not have the ability to recall
                console.log("Recall failed. This is a reporting key.");
            } else {
                await this.recursivelyRecallChildren(childrenList,"Recalled by Admin Key")
                .then(response => {
                    console.log("Finished recalling");
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
      background-color: rgb(145, 193, 248);
      border-radius: 10px;
      padding: 30px;
      width: 70%;
      display: block;
      margin-left: auto;
      margin-right: auto;

  }
  #device-form > * {
      padding: 5px;
      margin: 5px;
      display: flex;
      flex-direction: column;
      width: 70%
  }
  #submit-button {
      display: block;
      margin-left: auto;
      margin-right: auto;
      width: 50%;
      margin-top: 30px;

  }
</style>
