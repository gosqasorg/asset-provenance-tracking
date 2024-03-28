<!--
    This component is a form. The form is used to create a new device that we will track the
    providence for.

    Resourses:
    https://test-utils.vuejs.org/guide/essentials/forms
-->

<template>
    <form enctype="multipart/form-data" @submit.prevent="submitForm">
      <h1>Create New Provenance Record</h1>
      <div>
        <input type="text" class="form-control" name="description" id="provenance-description" v-model="description" placeholder="Provenance Description" />
        <label>Tags (will be converted to lower case and duplicates removed)</label>
        <ProvenanceTagInput v-model="tags" @updateTags="handleUpdateTags"/>
        <div>
          <span v-for="tag in tags" :key="tag">{{ tag }}</span>
        </div>
        <div style="display: block;">
            <label>Add Image (optional):    </label>
            <input type="file" class="form-control" accept="image/*" @change="onFileChange" capture="environment" multiple />
        </div>
      </div>
      <button id="submit-button" type="submit">Submit</button>
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
    methods: {
        handleUpdateTags(tags: string[]) {
            //console.log('handleUpdateTags', tags);
            this.tags = tags;
        },
        onFileChange(e: Event) {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            if (files) {
                this.pictures = Array.from(files);
            }
            console.log(deviceRecord);
        },
        refresh() {
            this.description = '';
            this.pictures = null;
            this.tags = [];
        },
        // we need to recursively add "recall" to the main
        // device record if it is not already added.
        // This should always be the addition of a provenance
        // record, but should only occur if the record is not
        // already recalled.
        // We really need to add the type here...

        // Use this function if you have a key, but don't yet
        // have the the children_keys in hand...
        async recursivelyRecallKey(key,recallReason) {
            postProvenance(key, {
                blobType: 'deviceRecord',
                description: recallReason,
                tags: ["recall"],
            }, this.pictures || [])
                .then(response => {
                    // Handle successful response here
                    console.log('Recall by Admin successful:', response);
                })
                .catch(error => {
                    // Handle error here
                    console.error('Reacall by Admein post request:', error);
                });

            const response = await getProvenance(key);
            let local_deviceRecord = response[response.length - 1].record;
            this.recursivelyRecallChildren(local_deviceRecord.children_key,recallReason);
        },
        async recursivelyRecallChildren(childrenkeys,recallReason) {
            // recalling the object is in fact supposed to be
            // recursive. This should probably be done in a separate
            // function; I am not sure where this code should live!
            // here we handle the "recall" functionality.
            // first add the recall tag here...
            console.log("begin recursivelyRecallChildren");
            if (!childrenkeys) return;
            // now we must add a provenance record to each child...
            childrenkeys.forEach((key) => {
                console.log("Got KEY",key);
                this.recursivelyRecallKey(key,recallReason);
            });
        },
        async submitForm() {

            // Here we post the povenance itself...
                postProvenance(this.deviceKey, {
                        blobType: 'deviceRecord',
                        description: this.description,
                        tags: this.tags,
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

            console.log(this.deviceRecord);

            const index = this.tags.indexOf("recall",0);
            // "recall" is being added....
            if (index > -1) {
                console.log("calling Recall Children!");
                await this.recursivelyRecallChildren(this.deviceRecord.children_key,"Recalled by Admin Key");
            }

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
