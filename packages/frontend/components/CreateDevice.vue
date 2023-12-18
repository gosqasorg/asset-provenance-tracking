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
import { encode as base58encode } from '@urlpack/base58'
const baseUrl = 'https://gosqasbe.azurewebsites.net/api';

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

            const deviceKey = this.encodeDeviceKey(await this.makeDeviceKey()); //TODO: change this to the actual device key
            this.postProvenance(deviceKey, {
                name: this.name,
                description: this.description,
            }, this.pictures || [])

            //Routing to display the device QR code etc. 
            this.$router.push({ path: `/device/${deviceKey}` });
        }, 
        async makeDeviceKey(): Promise<Uint8Array> { //TODO: use the function in azureFuncs.ts insted
            const key = await crypto.subtle.generateKey({
                name: "AES-CBC",
                length: 128
            }, true, ['encrypt', 'decrypt']);
            const buffer = await crypto.subtle.exportKey("raw", key);
            return new Uint8Array(buffer).slice();
        },
        encodeDeviceKey(key: Uint8Array): string {
            return base58encode(key);
        },
        async postProvenance(deviceKey: string, record: any, attachments: readonly Blob[]) {
            const formData = new FormData();
            formData.append("provenanceRecord", JSON.stringify(record));
            for (const blob of attachments) {
                formData.append("attachment", blob);
            }
            const response = await fetch(`${baseUrl}/provenance/${deviceKey}`, {
                method: "POST",
                body: formData,
            });
            return await response.json() as { record: string, attachments?: string[] };
        }
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



