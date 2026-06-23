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
            <button class="btn key-buttons" style="grid-row: 1;" @click="clearSessionStorage(); $router.push('/history/' + key)">Go to record</button>
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
            <button class="btn key-buttons bottom" @click="editSubmission(key)">Edit submission</button>
        </div>
    </div>

</div>
</template>

<script lang="ts">
import { postProvenance, stashOfflineRequest, removeOfflineRequest } from "~/services/azureFuncs"

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
    } catch (error) {
        console.log("There was an error displaying your offline edits: " + error);
        this.$snackbar.add({
            type: 'error',
            text: `Could not display offline edits: ${error}`
        });
    }
},

methods: {
    getOfflineKeys() {
        // Get all keys that were successfully stashed while offline
        let stash_counter = parseInt(localStorage.getItem('stash_counter') || "0");
        for (stash_counter; stash_counter > 0; stash_counter--) {
            let stashedRequest = JSON.parse(localStorage.getItem('gosqas-offline-stash-' + stash_counter) || '{}')
            let fullUrl = stashedRequest[0][1]
            let record = fullUrl.split("/")[fullUrl.split("/").length - 1]
            this.offlineKeys.push(record)   
        }
    },
    getFulfilledKeys() {
        // Get all keys that were fullfilled from the stash
        let fulfilled = (localStorage.getItem('gdt-stash-fulfilled') || "{}")
        for (const key of fulfilled.split(",")) {
            if (key !== "{}") {
                this.fulfilledKeys.push(key) 
            } 
        }
    },
    getSyncingKeys() {
        // Get all keys in the stash that are syncing
        let syncing = (localStorage.getItem('gdt-stash-syncing') || "{}")
        for (const key of syncing.split(",")) {
            if (key !== "{}") {
                this.syncingKeys.push(key)  
            }
        }
    },
    getFailedKeys() {
        // Get all keys in the stash that failed to create
        let failed = localStorage.getItem("gdt-stash-failed") || '{}';
        if (failed == '[{}]' || failed == '{}') {
            return
        }

        for (const request of JSON.parse(failed)) {
            if (JSON.stringify(request) !== "{}") {
                let fullUrl = request[0][1];
                this.failedKeys.push(fullUrl.split("/")[fullUrl.split("/").length - 1]);
            }
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
    clearSessionStorage() {
        sessionStorage.removeItem("gdt-redirect-record");
        sessionStorage.removeItem("gdt-redirect-isGroup");
        sessionStorage.removeItem("gdt-redirect-key");
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
    async retrySyncing(key: string) {
        try {
            // Get all failed requests
            let failedRequests = JSON.parse(localStorage.getItem("gdt-stash-failed") || '{}');
            let stashedRecord;

            // Get the specified request to retry
            for (let i = 0; i < failedRequests.length; i++) {
                let fullUrl = failedRequests[i][0][1];
                let requestKey = fullUrl.split("/")[fullUrl.split("/").length - 1];
                // If we find the request store it and exit the loop
                if (requestKey == key) {
                    stashedRecord = JSON.parse(failedRequests[i][1][1]);
                    break
                }
            }

            // Try to post the record/group and display an error if it fails
            if (stashedRecord.children_name) {
                // Post a group
                await postProvenance(key, {
                    blobType: 'deviceInitializer',
                    deviceName: stashedRecord.deviceName,
                    description: stashedRecord.description,
                    tags: stashedRecord.tags,
                    reportingKey: stashedRecord.reportingKey,
                    children_name: stashedRecord.childrenName,
                    children_key: stashedRecord.children_key,
                    hasParent: stashedRecord.hasParent,
                    isReportingKey: stashedRecord.isReportingKey,
                }, []);
            } else {
                // Post a record
                await postProvenance(key, {
                    blobType: 'deviceInitializer',
                    deviceName: stashedRecord.deviceName,
                    description: stashedRecord.description,
                    tags: stashedRecord.tags,
                    children_key: stashedRecord.children_key,
                    hasParent: stashedRecord.hasParent,
                    isReportingKey: stashedRecord.isReportingKey,
                }, []);
            }

            // If the request creates successfully move the key to the fulfilled stash
            stashOfflineRequest(key, "gdt-stash-fulfilled");
            removeOfflineRequest(key, "gdt-stash-failed");

            // Reload the page
            window.location.reload();

        } catch (error) {
            this.$snackbar.add({
                type: 'error',
                text: `Failed to create record: ${error}`
            });
        }
    },
    editSubmission(key: string) {
        // Get all failed requests
        let failedRequests = JSON.parse(localStorage.getItem("gdt-stash-failed") || '{}');
        let stashedRecord;
        let isGroup = false;

        try {
            // Get the specified request to edit
            for (let i = 0; i < failedRequests.length; i++) {
                let fullUrl = failedRequests[i][0][1];
                let requestKey = fullUrl.split("/")[fullUrl.split("/").length - 1];
                // If we find the request store it and exit the loop
                if (requestKey == key) {
                    stashedRecord = JSON.parse(failedRequests[i][1][1]);
                    break
                }
            }

            if (stashedRecord.children_name) {
                isGroup = true;
            }

            // Store the record in sessionStorage so the create pages have access to it
            sessionStorage.setItem("gdt-redirect-record", JSON.stringify(stashedRecord));
            sessionStorage.setItem("gdt-redirect-isGroup", isGroup.toString());
            sessionStorage.setItem("gdt-redirect-key", key);
                                                             
            // Redirect to the specified creation page
            if (!stashedRecord.deviceName) {
                // If the request doesn't have a name then it is part of an existing record/group
                this.$router.push({
                    path: '/history/offline'
                });
            } else {
                // Otherwise it is either a new record or group
                this.$router.push({
                    path: '/gdt'
                });
            }

        } catch (error) {
            this.$snackbar.add({
                type: 'error',
                text: `Failed to get stashed information: ${error}`
            });
        }
    },
}
}
</script>

<style scoped>
    @import '../assets/css/history-form.css';
    @import '../assets/css/offline-edits.css';
</style>