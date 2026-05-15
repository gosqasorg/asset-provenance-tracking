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
        <div style="margin-bottom: 30px; color: white">
            Your recent offline edits are below. Please review any pending edits to confirm they have synced.
        </div>
    </div>

    <button class="btn dismiss-all" @click="clearAllEdits">Dismiss all edits</button>
    <button class="btn dismiss-published" @click="sample">Dismiss published edits</button>

    <div v-for="(key, index) in offlineKeys">
        <div class="key-text">
            <p>{{ key }}</p>
            <div style="background-color: #91bdf5; border-radius: 20px; width: 105px; color: black; text-align: center; height:40px; display:flex; justify-content: center; align-items: center;">Queued</div>
        </div>

    </div>

    <div> Records Created: {{ offlineKeys }} </div>

</div>
</template>

<script lang="ts">
export default {
data() {
	return {
        offlineKeys: [] as string[],
	}
},

async mounted() {
    try {
        this.getOfflineKeys()
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
	clearAllEdits() {
        localStorage.setItem("gdt-stash-fulfilled", "")
        window.location.reload();
	},
    sample() {
        let stash_counter = parseInt(localStorage.getItem('stash_counter') || "0");
        for (stash_counter; stash_counter > 0; stash_counter--) {
            let test = JSON.parse(localStorage.getItem('gosqas_offline_stash_' + stash_counter) || '{}')
            let fullUrl = test[0][1]
            let record = fullUrl.split("/")[fullUrl.split("/").length - 1]
            this.offlineKeys.push(record)            
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

.dismiss-all {
    margin-bottom: 20px;
    margin-right: 15px;
    padding: 12px 16px;
    width: 14%;
    border-radius: 11px;
}
.dismiss-published {
    margin-bottom: 20px;
    padding: 12px 16px;
    width: 19%;
    border-radius: 11px;
}

/* Wrap buttons once screen gets below a certain size */
@media (max-width: 767px) {
.dismiss-all {
	width: 30% !important;
}
.dismiss-published {
    width: 50% !important;
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
    .dismiss-all {
        background-color: #CCECFD;
        border: #CCECFD;
        color: black;
    }
    .dismiss-published {
        background-color: #CCECFD;
        border: #CCECFD;
        color: black;
    }
    .dismiss-published:hover,
    .dismiss-published:active {
        background-color: #e6f6ff !important;
    }
    .dismiss-all:hover,
    .dismiss-all:active {
        background-color: #e6f6ff !important;
    }
    .key-text {
        color: white;
        padding: 20px;
        margin-bottom: 14px;
        margin-top: 14px;
        border: solid;
        border-color: #91bdf5;
        border-radius: 20px;
        word-wrap: break-word;
        background-color: #383838;
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
    .dismiss-all {
        background-color: #4e3681;
        border: #4e3681;
        color: white;
    }
    .dismiss-published {
        background-color: #4e3681;
        border: #4e3681;
        color: white;
    }
    .dismiss-all:hover,
    .dismiss-all:active {
        background-color: #322253 !important;
        color: white !important;
    }
    .dismiss-published:hover,
    .dismiss-published:active {
        background-color: #322253 !important;
        color: white !important;        
    }
}
</style>