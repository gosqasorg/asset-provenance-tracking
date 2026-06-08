<!-- back_online.vue -- lists keys created while offline
Copyright (C) 2024 GOSQAS
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
Page will be where users can keep track of records they created
while offline.
-->

<template>
<div class="container-md" id="donate-container">
    <h1>Your Offline Edits</h1>
    <div class="row">
        <div>
            Your recent offline edits are below. Please review any pending edits to confirm they have synced.
        </div>
    </div>

    <button class="btn dismiss all" style="width: 19%; margin-right: 15px" @click="dismissAllEditsPopUp=true">Dismiss all edits</button>
    <button class="btn dismiss published" style="width: 27%" @click="dismissPublishedEditsPopUp=true">Dismiss published edits</button>

    <!----------------Dismiss All Edits Popup-------------------->
    <div class="popup" v-if="dismissAllEditsPopUp">
        <div class="popup-inner">
            <h3 style="font-weight: bold">You're dismissing all of your offline edits</h3>
            <p class="inner-p">Once you dismiss your offline edits, they will no longer be available for review.</p>
            <button class="popup-buttons" style="float: left;" @click="dismissAllEditsPopUp=false">Go back</button>
            <button class="btn confirm-dismiss" style="float: right" @click="clearAllEdits(); dismissAllEditsPopUp=false">Dismiss all edits</button>
        </div>
    </div>

    <!----------------Dismiss Published Edits Popup-------------->
    <div class="popup" v-if="dismissPublishedEditsPopUp">
        <div class="popup-inner">
            <h3 style="font-weight: bold">You're dismissing your published offline edits</h3>
            <p class="inner-p">Once you dismiss your published offline edits, they will no longer be available for review.</p>
            <button class="popup-buttons" style="float: left;" @click="dismissPublishedEditsPopUp=false">Go back</button>
            <button class="btn confirm-dismiss" style="float: right" @click="clearPublishedEdits()">Dismiss published edits</button>
        </div>
    </div>
    <!----------------Dimiss an Offline Edit Popup--------------->
    <div class="popup" v-if="dismissSingleEditPopUp">
        <div class="popup-inner">
            <h3 style="font-weight: bold">You're dismissing an offline edit</h3>
            <p class="inner-p">You're dismissing the below edit. Once dismissed, it will no longer be available for review.</p>
            <button class="popup-buttons" style="float: left;" @click="dismissSingleEditPopUp=false">Go back</button>
            <button class="btn confirm-dismiss" style="float: right" @click="clearOneEdit()">Dismiss edit</button>
        </div>
    </div>
    <!----------------Queued Keys Banner-------------------->
    <div v-for="(key, index) in offlineKeys">
        <div class="key-box">
            <p style="font-size: 17px;">{{ key }}</p>
            <div style="background-color: #91bdf5; border-radius: 20px; width: 105px; color: black; text-align: center; height:40px; display:flex; justify-content: center; align-items: center;">Queued</div>
        </div>
    </div>

    <!----------------Published Keys Banner------------------>
    <div v-for="(key, index) in fulfilledKeys">
        <div class="key-box" style="border: none; overflow:auto; display:grid; gap:10px; margin-bottom: 10px; margin-top: 0px">
            <p style="grid-row: 1; font-size: 17px; margin-top: -5px; margin-bottom: -5px">{{ key }}</p>      
            <div class="status-bubble">Published</div>
            <button class="btn key-buttons" style="grid-row: 1;" @click="$router.push('/history/' + key)">Go to record</button>
            <button class="btn key-buttons bottom" @click="dismissSingleEditPopUp=true; clearOneEditPrepare(key)">Dismiss edit</button>
        </div>
    </div>

    <!----------------Syncing Keys Banner-------------------->
    <div v-for="(key, index) in syncingKeys">
        <div class="key-box sync" style="border: solid; border-width: 2px; border-color: #efcc9b;">
            <p style="font-size: 17px">{{ key }}</p>
            <div class="status-bubble" style="background-color: #df892a;">Syncing</div>
        </div>
    </div>

    <!------------------Failed Keys Banner------------------->
    <div v-for="(key, index) in failedKeys">
        <div class="key-box failed" style="border: solid; border-width: 2px; overflow: auto; display: grid; gap: 10px; margin-bottom: 10px; margin-top: 0px; border-color: #ebb9b6;">
            <p style="grid-row: 1; font-size: 17px;">{{ key }}</p>
            <div class="status-bubble" style="background-color: #e08a82;">Failed</div>
            <button class="btn key-buttons" style="grid-row: 1;" @click="retrySyncing(key)">Retry syncing</button>
            <button class="btn key-buttons bottom" @click="editSubmission()">Edit submission</button>
        </div>
    </div>

</div>
</template>

<script lang="ts">
import { postProvenance, stashKey } from "~/services/azureFuncs"

export default {
data() {
	return {
        dismissOneKey: '',
        dismissAllEditsPopUp: false,
        dismissPublishedEditsPopUp: false,
        dismissSingleEditPopUp: false,
        offlineKeys: [] as string[],
        fulfilledKeys: [] as string[],
        syncingKeys: [] as string[],
        failedKeys: [] as string[],
	}
},

async mounted() {
    try {
        this.getFailedKeys();
        this.getOfflineKeys();
        this.getSyncingKeys();
        this.getFulfilledKeys();
        this.clearOneEdit();
    } catch (e) {
        console.error("There was an error displaying your offline edits: " + e)
    }
},

methods: {
    getOfflineKeys() {
        // Get all keys that were successfully stashed while offline
        let stash_counter = parseInt(localStorage.getItem('stash_counter') || "0");
        for (stash_counter; stash_counter > 0; stash_counter--) {
            let test = JSON.parse(localStorage.getItem('gosqas-offline-stash-' + stash_counter) || '{}')
            let fullUrl = test[0][1]
            let record = fullUrl.split("/")[fullUrl.split("/").length - 1]
            this.offlineKeys.push(record)   
        }
    },
    getFulfilledKeys() {
        // Get all keys that were fullfilled from the stash
        let fulfilled = (localStorage.getItem('gdt-stash-fulfilled') || "{}")
        for (const key of fulfilled.split(",")) {
            if (key === "{}") {
                continue
            }
            this.fulfilledKeys.push(key)  
        }
    },
    getSyncingKeys() {
        // Get all keys in the stash that are syncing
        let syncing = (localStorage.getItem('gdt-stash-syncing') || "{}")
        for (const key of syncing.split(",")) {
            if (key === "{}") {
                continue
            }
            this.syncingKeys.push(key)  
        }
    },
    getFailedKeys() {
        // Get all keys in the stash that failed to create
        let failed = localStorage.getItem("gdt-stash-failed") || '{}';
        if (failed == '{}') {
            return
        }

        for (const request of JSON.parse(failed)) {
            if (request === "{}") {
                continue
            }
            let fullUrl = request[0][1];
            this.failedKeys.push(fullUrl.split("/")[fullUrl.split("/").length - 1]);  
        }
    },
    clearAllEdits() {
        let stash_counter = parseInt(localStorage.getItem('stash_counter') || "0");
        for (stash_counter; stash_counter > 0; stash_counter--) {
            let request_name = 'gosqas-offline-stash-' + stash_counter;
            localStorage.removeItem(request_name);
        }
        localStorage.setItem('stash_counter', '0');
        localStorage.removeItem('gdt-stash-syncing');
        localStorage.removeItem('gdt-stash-fulfilled');
        localStorage.removeItem('gdt-stash-failed');
        window.location.reload();
    },
    clearPublishedEdits() {
        localStorage.removeItem("gdt-stash-fulfilled")
        window.location.reload();  
    },
    clearOneEditPrepare(key: string) {
        this.dismissOneKey = key;
    },
    clearOneEdit() {
        // Removes key from fulfilled array then resets and copies this array to gdt stash fullfilled
        const index = this.fulfilledKeys.indexOf(this.dismissOneKey);
        if (index > -1) {
            this.fulfilledKeys.splice(index, 1);
            this.dismissOneKey = '';
            this.dismissSingleEditPopUp = false;
        }
        localStorage.setItem('gdt-stash-fulfilled', '')
        localStorage.setItem('gdt-stash-fulfilled', this.fulfilledKeys.toString())
    },
    moveFailedToFulfilled(failedRequests: any, failedRequest: any, newRecord: any, newKey: string) {
        // Add the key to the fulfilled stash and remove it from the failed stash
        try { 
            // Add record key to fulfilledRequests
            // TODO: Handle failedRequest being undefined (watch out for error handling adding twice, though remove should handle that case)
            let result = stashKey(newKey, "gdt-stash-fulfilled", failedRequest)
            if (!result) {
                throw new Error("Record was not able to be added to the published stash")
            }

            // Remove request from failedRequests
            let requests = [];
            for (let i = 0; i < failedRequests.length; i++) {
                let record = failedRequests[i][1][1];
                if (record !== JSON.stringify(newRecord)) {
                    requests.push(failedRequests[i]);
                }
            }

            localStorage.setItem("gdt-stash-failed", JSON.stringify(requests))

        } catch (error) {
            console.error("Record was created successfully but the stash was unable to update: " + error)
            throw new Error(`Record was created successfully but the stash was unable to update: ${error}`)
        }
    },
    async retrySyncing(key: string) {
        try {
            // Get all failed requests
            let failedRequests = JSON.parse(localStorage.getItem("gdt-stash-failed") || '{}');
            let failedRequest;
            let stashedRecord;

            // Get the specified record
            for (let i = 0; i < failedRequests.length; i++) {
                let fullUrl = failedRequests[i][0][1];
                let requestKey = fullUrl.split("/")[fullUrl.split("/").length - 1];
                if (requestKey == key) {
                    failedRequest = failedRequests[i];
                    stashedRecord = JSON.parse(failedRequests[i][1][1]);
                    continue
                }
            }

            // Try to post the record and display an error if it fails
            await postProvenance(key, {
                blobType: 'deviceInitializer',
                deviceName: stashedRecord.deviceName,
                description: stashedRecord.description,
                tags: stashedRecord.tags,
                children_key: stashedRecord.children_key,
                hasParent: stashedRecord.hasParent,
                isReportingKey: stashedRecord.isReportingKey,
            }, []);

            // If the record creates successfully, move the key to the fulfilled stash
            this.moveFailedToFulfilled(failedRequests, failedRequest, stashedRecord, key)

            // Reload the page
            window.location.reload();

        } catch (error) {
            this.$snackbar.add({
                type: 'error',
                text: `Failed to create record: ${error}`
            });
        }
    },
    editSubmission() {
        // get record from the failed stash and display to the user (form almost..?)
            // WE COULD get the info and redirect to the create page and fill in (mindful of groups/adding to existing though)
                // DEFINITELY THIS WE DON'T WANNA CREATE A WHOLE NEW INTERFACE!
                // Get record and remove from stash, redirect and fill in information

        // allow user to edit fields and then submit

    },
}
}
</script>

<style scoped>
    @import '../assets/css/history-form.css';
    @import '../assets/css/offline-edits.css';
</style>