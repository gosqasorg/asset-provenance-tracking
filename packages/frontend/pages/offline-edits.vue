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

    <button class="btn dismiss all" style="width: 19%; margin-right: 15px" @click="clearAllEdits">Dismiss all edits</button>
    <button class="btn dismiss published" style="width: 27%" @click="clearPublishedEdits">Dismiss published edits</button>

    <!----------------Queued Keys-------------------->
    <div v-for="(key, index) in offlineKeys">
        <div class="key-box">
            <p style="font-size: 17px;">{{ key }}</p>
            <div style="background-color: #91bdf5; border-radius: 20px; width: 105px; color: black; text-align: center; height:40px; display:flex; justify-content: center; align-items: center;">Queued</div>
        </div>
    </div>

    <!----------------Published Keys------------------>
    <div v-for="(key, index) in fulfilledKeys">
        <div class="key-box" style="border: none; overflow:auto; display:grid; gap:10px; margin-bottom: 10px; margin-top: 0px">
            <p style="grid-row: 1; font-size: 17px; margin-top: -5px; margin-bottom: -5px">{{ key }}</p>      
            <div class="status-bubble">Published</div>
            <button class="btn key-buttons" style="grid-row: 1;">Go to record</button>
            <button class="btn key-buttons bottom" @click="clearEdit(key)">Dismiss edit</button>
        </div>
    </div>

    <!----------------Syncing Keys-------------------->
    <div v-for="(key, index) in getSyncingKeys">
        <div class="key-box sync" style="border: solid; border-color: #efcc9b;">
            <p style="font-size: 17px">{{ key }}</p>
            <div class="status-bubble" style="background-color: #df892a;">Syncing</div>
        </div>
    </div>

    <!------------------Failed Keys------------------->
    <div v-for="(key, index) in getFailedKeys">
        <div class="key-box failed" style="border: solid; overflow: auto; display: grid; gap: 10px; margin-bottom: 10px; margin-top: 0px; border-color: #ebb9b6;">
            <p style="grid-row: 1; font-size: 17px;">{{ key }}</p>
            <div class="status-bubble" style="background-color: #e08a82;">Failed</div>
            <button class="btn key-buttons" style="grid-row: 1;">Retry syncing</button>
            <button class="btn key-buttons bottom">Edit submission</button>
        </div>
    </div>

</div>
</template>

<script lang="ts">
export default {
data() {
	return {
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
    } catch (e) {
        console.log("There was an error displaying your offline edits: " + e)
    }
},

methods: {
    getOfflineKeys() {
        // Get all keys that were successfully created while offline
        let stash_counter = parseInt(localStorage.getItem('stash_counter') || "0");
        for (stash_counter; stash_counter > 0; stash_counter--) {
            let test = JSON.parse(localStorage.getItem('gosqas_offline_stash_' + stash_counter) || '{}')
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

    },
    getFailedKeys() {

    },
    clearAllEdits() {
        if (confirm("Are you sure you want to dismiss all edits?")) {
            localStorage.setItem("gdt-stash-fulfilled", "")
            window.location.reload();           
        }
    },
    clearPublishedEdits() {
        if (confirm("Are you sure you want to dismiss all published edit?")) {
            localStorage.setItem("gdt-stash-fulfilled", "")
            window.location.reload();  
        }
    },
    clearEdit(key: string) {
        if (confirm("Are you sure you want to clear this edit?")) {
            const index = this.fulfilledKeys.indexOf(key);
            if (index > -1) {
                this.fulfilledKeys.splice(index, 1);
            }
        }
    }
}
}
</script>

<style>
.row {
    margin-top:32px;
}

/* For screens smaller than 768px */
#donate-container{
    padding: 50px 20px 40px 20px;
}

.dismiss {
    margin-bottom: 20px;
    border-radius: 11px;
    padding: 12px 16px;
}
.status-bubble {
    grid-row:2; 
    background-color: #00dc82; 
    border-radius: 20px; 
    width: 115px; 
    color: black; 
    text-align: center; 
    display:flex; 
    justify-content: center; 
    align-items: center;
    margin-top: -2px;
    height: 40px;
}
.key-buttons {
    width: 100px;
    width: 50%;
    border-radius: 6px;
    font-size: 14px;
    padding-top: 10px;
    margin-bottom: 5px;
    justify-self: end;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
}

/* Wrap buttons once screen gets below a certain size */
@media (max-width: 1024px) {
.dismiss {
	width: 100% !important;
}
.key-box {
    display:flex !important;
    flex-direction: column !important;
}
.status-bubble {
    padding: 10px;
}
.key-buttons {
    width: 100% !important;
    margin-top: auto !important;
    
}
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    h1 {
        color: #CCECFD;
    }
    p {
        color: #FFFFFF;
    }
    .row {
        margin-bottom: 30px;
        color: white;
    }
    .btn {
        background-color: #CCECFD;
        border: #CCECFD;
        color: black;
    }
    .btn:hover,
    .btn:active {
        background-color: #e6f6ff;
        color: black;
    }
    .key-buttons.bottom:hover,
    .key-buttons.bottom:active {
        background-color: #636262 !important;
    }
    .key-box {
        color: white;
        padding: 20px;
        margin-bottom: 14px;
        margin-top: 14px;
        border: solid;
        border-color: #91bdf5;
        border-radius: 20px;
        border-width: 2px;
        word-wrap: break-word;
        background-color: #383838;
    }
    .btn.key-buttons.bottom {
        grid-row: 2; 
        border: solid; 
        border-width: 1px; 
        border-color: #ffffff; 
        background-color: #383838; 
        color: #ffffff
    }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    h1 {
        color: #4E3681;
    }
    p {
        color: #1E2019;
    }
    .row {
        margin-bottom: 30px;
        color: black;
    }
    .btn {
        background-color: #4e3681;
        border: #4e3681;
        color: white;
    }
    .btn:hover,
    .btn:active {
        background-color: #322253 !important;
        color: white !important;
    }
    .key-box {
        color: white;
        padding: 20px;
        margin-bottom: 14px;
        margin-top: 14px;
        border: solid;
        border-color: #bbd7f9;
        border-radius: 20px;
        border-width: 2px;
        word-wrap: break-word;
        background-color: #f0f3f8;
    }
    .key-buttons.bottom {
        grid-row: 2; 
        border: solid; 
        border-width: 2px; 
        border-color: #322253; 
        background-color: #f0f3f8; 
        color: #322253
    }
}
</style>