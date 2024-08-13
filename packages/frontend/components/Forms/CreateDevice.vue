<!-- CreateDevice.vue -- Creation of Device
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
    This component is a form used to create a new device that we will track the
    providence for.

    Resourses:
    https://test-utils.vuejs.org/guide/essentials/forms
-->

<template>
    <form enctype="multipart/form-data" class="bg-frost p-3" @submit.prevent="submitForm">
        <h4 class="text-iris mt-1 mb-3">Create New Device</h4>
 
 
        <div>
            <input type="text" class="form-control" v-model="name" required placeholder="Device Name">
            <input type="text" class="form-control mt-3" v-model="description" required placeholder="Device Description">
            <div style="display: block;">
                <h4 class="mt-3 mb-3 text-iris">Device Image (optional)   </h4>
                <input type="file"  class="form-control " accept="*" @change="onFileChange" capture="environment" multiple />
            </div>
 
 
            <h4 class="mt-3 mb-3 text-iris">Add Tags (optional)</h4>
            <ProvenanceTagInput class="form-control mt-1" placeholder="Device Tag" v-model="tags" @updateTags="handleUpdateTags"/>
            <div>
                <span v-for="(tag, index) in tags" :key="tag"> {{ tag }}{{ index !== tags.length - 1 ? ', ' : '' }}</span>
            </div>
        </div>
 
 
        <div class="d-grid">
            <button-component class="my-4 mb-0" buttonText="Create Device" type="submit" />
        </div>
    </form>
 </template>

<script lang="ts">
import { postProvenance } from '~/services/azureFuncs';
import { makeEncodedDeviceKey } from '~/utils/keyFuncs';

import ButtonComponent from '../ButtonComponent.vue';

export default {
    data() {
        return {
            name: '',
            description: '',
            tags: [] as string[],
            children_key: [] as string[],
            children_name: [] as string[],
            hasParent: false, // states whether a device is contained within a box/container
            pictures: [] as File[] | null,
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
        },
        async submitForm() {

            const deviceKey = await makeEncodedDeviceKey();
            postProvenance(deviceKey, {
                blobType: 'deviceInitializer',
                deviceName: this.name,
                description: this.description,
                tags: this.tags,
                children_key: [],
                children_name: [],
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
        border-radius: 10px;
        padding: 30px;
        width: 100%;
        display: block;
        margin-left: auto;
        margin-right: auto;

    }
    /* Style for the placeholder text */
    .form-control::placeholder {
    color: gray;
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
