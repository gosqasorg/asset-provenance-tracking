<!-- 
    This component is a form used to create a new device that we will track the 
    providence for. 

    Resourses:
    https://test-utils.vuejs.org/guide/essentials/forms
-->

<template>
    <form enctype="multipart/form-data" @submit.prevent="submitForm"> 
        <h3>Create New Device</h3>
        <div id="device-form">
            <input type="text" class="form-control" v-model="name" required placeholder="Device Name">
            <input type="text" class="form-control mt-3" v-model="description" required placeholder="Device Description">
            <div style="display: block;">
                <label>Device Image (optional):    </label>
                <input type="file" class="form-control" accept="image/*" @change="onFileChange" capture="environment" multiple />
            </div>
        </div>
        <button id="submit-button" type="submit">Submit</button>
    </form>
</template>

<script lang="ts">
import { postProvenance } from '~/services/azureFuncs';
import { makeEncodedDeviceKey } from '~/utils/keyFuncs';

export default {
    data() {
        return {
            name: '',
            description: '',
            pictures: [] as File[] | null,
        }
    },
    methods: {
        onFileChange(e: Event) {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            if (files) {
                this.pictures = Array.from(files);
            }
        },
        async submitForm() {

            const deviceKey = await makeEncodedDeviceKey();
            postProvenance(deviceKey, {
                blobType: 'deviceInitializer',
                deviceName: this.name,
                deviceDescription: this.description,
            }, this.pictures || [])
                .then(response => {
                    // Handle the successful response here
                    console.log('Post request successful:', response);
                })
                .catch(error => {
                    // Handle the error here
                    console.error('Error in post request:', error);
                });

            //Routing to display the device QR code etc. 
            this.$router.push({ path: `/device/${deviceKey}` });
        }, 
    }
    
}
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



