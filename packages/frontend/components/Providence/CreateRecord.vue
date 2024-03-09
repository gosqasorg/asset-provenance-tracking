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
        <input type="text" class="form-control" name="description" id="provenance-description" v-model="description" required placeholder="Provenance Description" />
        <label>Tags (will be converted to lower case and duplicates removed)</label>
        <ProvidenceTagInput v-model="tags" @updateTags="handleUpdateTags"/>
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
import { postProvenance } from '~/services/azureFuncs';
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
        },
        refresh() {
            this.description = '';
            this.pictures = null;
            this.tags = [];
        },
        async submitForm() {
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



