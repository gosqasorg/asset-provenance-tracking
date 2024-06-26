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

        async getAllDescendants(key: string) {

            let children_list = await this.getChildrenKeys(key);

            for (let child_key of children_list) {
                children_list = children_list.concat(await this.getAllDescendants(child_key));
            }

            return children_list;
        },


        async recursivelyRecallChildren(childrenkeys: string[],recallReason: string, tags: string[]) {

            for (const key of childrenkeys) {
                // console.log("GOT KEY", key);

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

            const response = await getProvenance(this.deviceKey);
            let local_deviceRecord = response[0].record;
            this.hasParent = local_deviceRecord.hasParent;
            this.isReportingKey = local_deviceRecord.isReportingKey;
            let descendantsList = await this.getAllDescendants(this.deviceKey);

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
                            hasParent: true,
                        }, this.pictures || [])
    
                        this.hasParent = true;
                    }
                }
            }

            if (this.childrenKey.length > 1) { // if user want to add children keys 
                let string_children = this.childrenKey.toString();
                let entered_children = string_children.split(",");
                for (let i of entered_children) {
                    // for each key, check its descendants and see if current device is a child of them
                    // make sure that the entered child does not have a parent yet
                    // TODO: make sure the child exists
                    const child_prov = await getProvenance(i);
                    const child_record = child_prov[0].record;
                    let index = entered_children.lastIndexOf(i);

                    if (child_record.hasParent) {
                        console.log("Child key ", i, " already has a parent");
                        this.description = this.description + `\nError: Child device could not be added.`;
                        entered_children.splice(index, 1);
                    } else {
                        let descendants = await this.getAllDescendants(i);
                        console.log("These are the descendants of key ", i, " : ", descendants);
                        if (descendants.includes(this.deviceKey)) {
                            console.log("This device key is among descendants");
                            this.description = this.description + `\nError: Child device could not be added.`;
                            entered_children.splice(index, 1);
                        } else {
                            // make sure the child has parent = true
                            postProvenance(i, {
                            blobType: 'deviceRecord',
                            description: this.description, // need to discuss whether we want to have a unique description
                            tags: [],
                            children_key: [],
                            hasParent: true,
                            }, this.pictures || [])

                        }
                    }
                    this.childrenKey = entered_children;
                }
            } 

        const recall = this.tags.indexOf("recall", 0);
        const inform = this.tags.indexOf("inform_all", 0);
        

        // "recall" is being added....
        if (recall > -1 || inform > -1) {
            let reason = ""
            let tags = this.tags
            if (recall > -1) { 
                reason = "Recalled by Admin Key";
            } else { reason = this.description; }

            if (this.isReportingKey) {
                // reporting keys do not have the ability to recall
                console.log("Action failed. This is a reporting key.");
            } else {
                // console.log("begin to recall");
                await this.recursivelyRecallChildren(descendantsList, reason, tags)
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
