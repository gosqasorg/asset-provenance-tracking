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
            <label for="file">Device Image (optional)</label>
            <input type="file" class="form-control" accept="image/*" @change="onFileChange" capture="environment" multiple />
        </div>
        <button id="submit-button" type="submit">Create New Device</button>
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
        background-color: #e6f6ff;
        /* background-color: rgb(60, 179, 113); /* MediumSeaGreen */
        border-radius: 10px;
        padding: 30px;
        display: block;
        margin-left: auto;
        margin-right: auto;

    }
    #device-form > * {
        padding: 5px;
        margin: 5px;
        display: flex;
        flex-direction: column;
    }
    #submit-button {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 100%;
        margin-top: 30px;
        border-width: 0px;
        border-radius: 10px;
        padding: 7px;
        background-color: #4e3681;
        color: white;
    }
</style>
