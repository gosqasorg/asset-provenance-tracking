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
    This component is a form used to create a new record that we will track the
    providence for.

    Resourses:
    https://test-utils.vuejs.org/guide/essentials/forms
-->

<template>
    <!-- Form for creating a new record. Uses custom form submission. -->
    <form enctype="multipart/form-data" class="p-3" id="record-form" @submit.prevent="submitForm">
        <h4 class="mt-1 mb-3">Create New Record</h4>
 
        <div>
            <input type="text" class="form-control" v-model="name" required placeholder="Record Title" maxlength="500">
            <input type="text" class="form-control mt-3" v-model="description" required placeholder="Record Description" maxlength="5000">
            <div style="display: block;">
                <h4 class="mt-3 mb-3">Record Image (optional)</h4>
                <input type="file"  class="form-control" accept="*" @change="onFileChange" capture="environment" multiple />
            </div>
 
            <h4 class="mt-3 mb-3">Add Tags (optional)</h4>
            <ProvenanceTagInput v-model="tags" @updateTags="handleUpdateTags"/>

            <div>
                <span v-for="(tag, index) in tags" :key="tag"> {{ tag }}{{ index !== tags.length - 1 ? ', ' : '' }}</span>
            </div>
        </div>
 
        <div class="d-grid">
            <button class="record-button my-3 mb-0" id="record-button" type="submit" :loading="isSubmitting" style="
                  border-width: 2px;
                  border-style: solid;
                  border-radius: 10px;
                  padding: 10px 20px;
                  margin: 0px;
                  font-size: 20px;
                  font-weight: 400;
                  line-height: 30px;
                "
                >
                Create Record
                </button>
        </div>
    </form>
</template>

<script lang="ts">
import { postProvenance } from '~/services/azureFuncs';
import { makeEncodedDeviceKey } from '~/utils/keyFuncs';

import ButtonComponent from '../ButtonComponent.vue';
import { isNavigationFailure } from 'vue-router';

export default {
    data() {
        return {
            name: '',
            description: '',
            tags: [] as string[],
            children_key: '',
            hasParent: false, // states whether a record is contained within a box/container
            pictures: [] as File[] | null,
            isSubmitting: false  // bool to check that form is submitted
        }
    },
    computed: {
        // Checks to see if form is valid to be submitted and disables the form submit button if so.
        isFormValid() {
            return this.name.trim() !== '' && this.description.trim() !== '';
        },
        isButtonDisabled() {
            return !this.isFormValid || this.isSubmitting;
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
        async submitForm() {
            if (this.isSubmitting) return;
            
            this.isSubmitting = true;
            try {
                const deviceKey = await makeEncodedDeviceKey();
                const response = await postProvenance(deviceKey, {
                    blobType: 'deviceInitializer',
                    deviceName: this.name,
                    description: this.description,
                    tags: this.tags,
                    children_key: '',
                    hasParent: false,
                    isReportingKey: false,
                }, this.pictures || []);
                
                this.$snackbar.add({
                    type: 'success',
                    text: 'Successfully created the record'
                });

                // Navigate to the new record page
                const failure = await this.$router.push({ path: `/record/${deviceKey}` });

                if (isNavigationFailure(failure)) {
                    this.$snackbar.add({
                        type: 'error',
                        text: `Navigation failure from: ${failure.from} to: ${failure.to} type: ${failure.type} cause: ${failure.cause}!`
                    })

                }
            } catch (error) {
                this.$snackbar.add({
                    type: 'error',
                    text: `Failed to create the record: ${error}`
                });
            } finally {
                this.isSubmitting = false;
            }
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

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #record-form {
        background-color: #4B4D47;
    }
    h4 {
        color: #FFFFFF;
    }
    #record-button {
        background-color: #CCECFD;
        color: black;
        border-color: #CCECFD;
    }
    input[type="file"]::file-selector-button {
        background-color: #CCECFD;  
        color: black;
    }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #record-form {
        background-color: #E6F6FF;
    }
    h4 {
        color: #4E3681;
    }
    #record-button {
        background-color: #4E3681;
        color: white;
        border-color: #4E3681;
    }
    input[type="file"]::file-selector-button {
        background-color: #4E3681;  
        color: white;
    }
}

</style>
