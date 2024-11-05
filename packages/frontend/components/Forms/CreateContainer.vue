<!-- CreateContainer.vue -- Creation of Container
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
<template>
    <form enctype="multipart/form-data" class="bg-frost p-3" @submit.prevent="submitForm">
        <h4 class="text-iris mt-1 mb-3">Create New Group</h4>
        <div>
            <input type="text" class="form-control" v-model="name" required placeholder="Group Name">
            <input type="text" class="form-control mt-3" v-model="description" id="device-description" placeholder="Group Description">
            <h4 class="text-iris form-label mt-3 mb-3" for="file">Attachments (optional)</h4>
            <input type="file" class="form-control" accept="*" @change="onFileChange" capture="environment" multiple />
           
            <h4 class="mt-3 mb-3 text-iris">Tags (optional)</h4>
            <ProvenanceTagInput class="form-control mt-1 " placeholder="Group Tag" v-model="tags" @updateTags="handleUpdateTags"/>
            <div>
                <span v-for="(tag, index) in tags" :key="tag"> {{ tag }}{{ index !== tags.length - 1 ? ', ' : '' }}</span>
            </div>

            <!-- <br> -->
            <!-- <h4 class="text-iris p-1 mt-0 mb-0 ">
                <input type="checkbox" class="form-check-input" id="report-key" v-model="createReportingKey" /> Create reporting key?
            </h4> -->
 
            <!-- <br>
            <h4 class="text-iris p-1 mt-0">
                <input type="checkbox" class="form-check-input" id="notify-all"/> Notify all children?
            </h4> -->
 
            <h4 class="text-iris my-4 mb-0" for="children-keys">Add devices to group:
                <input type="number" class="form-inline" id="children-keys" v-model="numChildKeys" min="0" max="500">
            </h4>
 
            <br>

            <ChildDeviceGroup v-if="numChildKeys > 0" :numChildren="numChildKeys" />
        </div>
       
        <div class="d-grid">
            <ButtonComponent class="my-4 mb-0" buttonText="Create Container" type="submit" />
        </div>
    </form>
 </template>

<script lang="ts">
import { bulkCreateProvenances, postProvenance } from '~/services/azureFuncs';
import { makeEncodedDeviceKey } from '~/utils/keyFuncs';

import ButtonComponent from '../ButtonComponent.vue';
import { isNavigationFailure } from 'vue-router';
import type { ProvenanceRecord } from '~/utils/types';

export default {
    data() {
        return {
            name: '',
            description: '',
            tags: [] as string[],
            numChildKeys: 0,
            // createReportingKey: false,
            hasParent: false, // states whether this device is contained within a box/container
            attachments: [] as File[] | null,
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
                this.attachments = Array.from(files);
            }
        },
        onFormChange() {
        },

        async submitForm() {
            const childrenDeviceList = [];
            const childrenDeviceName = [];
            let reportingKey;

            // if ((<HTMLInputElement>document.getElementById("notify-all")).checked) {
            //     this.tags = (this.tags).concat(['notify_all'])
            // } 

            // if (this.createReportingKey) {
            // A reporting key is a special record that is a child of the group.
            reportingKey =  await makeEncodedDeviceKey();
            
            try {
                this.tags.push('reportingkey');
                const response = await postProvenance(reportingKey, {
                    blobType: 'deviceInitializer',
                    deviceName: this.name,
                    description: "Reporting Key",
                    tags: this.tags,
                    children_key: [],
                    hasParent: true,
                    isReportingKey: true,
                } as ProvenanceRecord);
                console.log('Succesfully created the reporting key:', response);
            } catch (error) {
                console.error('Failed to create the reporting key:', error);
            }

            childrenDeviceList.push(reportingKey);
            childrenDeviceName.push(this.name + "_reporting_key");
            // }

            if (this.numChildKeys > 0) {
                // Create the child records.
                // TODO: use default name for children but also allow user to specify names.
                let records: Provenance[] = [];
                for (let i = 0; i < this.numChildKeys; i++) {
                    const childName = this.name + " #" + String(i + 1);
                    const childKey =  await makeEncodedDeviceKey();
                    const record: ProvenanceRecord = {
                            blobType: 'deviceInitializer',
                            deviceName: childName,
                            description: this.description,
                            tags: this.tags,
                            children_key: [],
                            hasParent: true,
                            isReportingKey: false
                        }
                    const prov: Provenance = {
                        deviceID: childKey,
                        record: record,
                    }
                    records.push(prov);
                };

                await bulkCreateProvenances(records);
            }

            // Create the group record.
            try {
                const deviceKey = await makeEncodedDeviceKey();
                const response = await postProvenance(deviceKey, {
                    blobType: 'deviceInitializer',
                    deviceName: this.name,
                    description: this.description,
                    tags: this.tags,
                    reportingKey: reportingKey,
                    children_key: childrenDeviceList,
                    children_name: childrenDeviceName,
                    hasParent: false,
                    isReportingKey: false
                }, this.attachments || [])
                
                console.log('Succesfully created the group:', response);

                // Navigate to the new container page
                const failure = await this.$router.push({ path: `/device/${deviceKey}` });

                if (isNavigationFailure(failure)) {
                    console.error(`Navigation failure from: ${failure.from} to: ${failure.to} type: ${failure.type} cause: ${failure.cause}!`);
                }
            } catch (error) {
                console.error('Failed to create the container:', error);
            }
        }
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
    #container-form > * {
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
    input[type=number] {
        border: 0px;
        border-radius: 4px;
    }
    input[type=checkbox] {
        width:25px;
        border: 0px;
        margin-right: 15px;
    }
    .num-fields {
        border: 0px;
        border-radius: 4px;
        border-color:red;
    }
    input[type=text] {
        border:5px;
        border-color:red;
    }
</style>
