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
        <button-component buttonText="View Record" padding="12px 12px" margin="0"
            type="submit" style="font-size: 16px;"></button-component>
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
            this.$router.push({ path: `/provenance/${extractedDeviceKey}` });
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
    margin-bottom:5px;
}

input::placeholder{
    padding-left: 5px;
}

form {
    width: 100%;
}

</style>