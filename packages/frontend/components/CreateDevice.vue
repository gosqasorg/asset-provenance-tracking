<!--
    This component is a form used to create a new device that we will track the
    providence for.

    Resourses:
    https://test-utils.vuejs.org/guide/essentials/forms
-->

<template>
    <form enctype="multipart/form-data" class="bg-sky p-3" @submit.prevent="submitForm">
        <p class="text-iris mt-1">Create New Device</p>
        <div>
            <input type="text" class="form-control" v-model="name" required placeholder="Device Name">
            <input type="text" class="form-control mt-2" v-model="description" required placeholder="Device Description">
            <div style="display: block;">
                <label class="mt-3 text-iris">Device Image (optional):    </label>
                <input type="file" class="form-control " accept="image/*" @change="onFileChange" capture="environment" multiple />
            </div>
        </div>
        <div class="d-grid">        
            <button class="btn my-3 bg-iris text-white" type="submit">Create Device</button>
        </div>
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
            children_key: '',
            hasParent: false, // states whether a device is contained within a box/container
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
                description: this.description,
                children_key: '',
                hasParent: false,
                isReportingKey: false,
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
        width: 100%;
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
        width: 100%;
        margin-top: 30px;

    }
</style>
