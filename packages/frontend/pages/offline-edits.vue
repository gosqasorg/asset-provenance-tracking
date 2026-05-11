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
        <div style="margin-bottom: 30px;">
            <strong>*Note: This page is still a work in progress.</strong><br><br>
            Your recent offline edits are below. Please review any pending edits to confirm they have synced.
        </div>
    </div>

    <button class="btn purple-btn" @click="clearAllEdits">Dismiss All Edits</button>

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
        let existingKeys = localStorage.getItem("gdt-stash-fulfilled")
        if (existingKeys) {
            for (const key of existingKeys.split(",")) {
                this.offlineKeys.push(key)
            }
        }
    },
	clearAllEdits() {
        localStorage.setItem("gdt-stash-fulfilled", "")
        window.location.reload();
	},
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

.purple-btn {
    margin-bottom: 20px;
    padding: 12px 16px;
}

/* Wrap buttons once screen gets below a certain size */
@media (max-width: 991px) {
.purple-btn {
	width: 100% !important;
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
    .purple-btn {
        background-color: #CCECFD;
        border: #CCECFD;
        color: black;
    }
    .purple-btn:hover,
    .purple-btn:active {
        background-color: #e6f6ff !important;
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
    .purple-btn {
        background-color: #4e3681;
        border: #4e3681;
        color: white;
    }

    .purple-btn:hover,
    .purple-btn:active {
        background-color: #322253 !important;
        color: white !important;
    }
}
</style>