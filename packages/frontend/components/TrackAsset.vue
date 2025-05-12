<!-- TrackAsset.vue
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
    This is the component that shows users an input field to enter
    a record key to be tracked (Button now called View Record).
-->


<template>
    <form @submit.prevent="submit">
        <input type="text" id="input" v-model="deviceKey" placeholder="Record key" style="width: inputWidth;" required/>
        <button
                @click="trackingForm()"
                id="viewRecordButton"
                class="baseButton view-record-button"
                style="
                  border-width: 2px;
                  border-style: solid;
                  padding: 12px;
                  margin: 0px;
                  font-size: 16px;
                "
              >
                View Record
              </button>
    </form>
</template>

<script lang="ts">

export default {
    props: {
        inputWidth: { type: String, default: "100%" }
    },
    data() {
        return {
            deviceKey: ''
        }
    },
    mounted() {
        let inputField = document.getElementById("input") as HTMLDivElement;
        inputField.style.width = this.inputWidth;
    },
    methods: {
        async submit() {
            // Get the record/device key from the end of an entered URL, or just use the entered key
            var extractedDeviceKey = this.deviceKey.split("/").pop();
            this.$router.push({ path: `/history/${extractedDeviceKey}` });
        }
    }
}
</script>
<style scoped>
input {
    border: 1px solid #CBD5E1;
    border-radius: 6px;
    line-height: 48px;
    margin-right: 15px;
    margin-top: 20px;
    margin-bottom: 0px;
}
#viewRecord {
    margin-top: 20px !important;
}
input::placeholder{
    padding-left: 5px;
}
form {
    width: 100%;
}
/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #viewRecordButton {
        background-color: #CCECFD;
        color: #000000;
        border-color: #CCECFD;
        border-radius: 10px;
    } 
    .view-record-button.navbar-button {
        background-color: #CCECFD;
        color: #000000;
        border-color: #CCECFD;
        border-radius: 10px;
    }

  /* Index page button — purple background with white text */
  .view-record-button.index-page-button {
        background-color: #322253;
        color: #FFFFFF;
        border-color: #322253;
        border-radius: 10px;
    }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #viewRecordButton {
      background-color: #4E3681;
      color: #FFFFFF;  
      border-color: #4E3681;
      border-radius: 10px;
    } 
}
</style>