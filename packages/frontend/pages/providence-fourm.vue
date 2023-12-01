<!-- 
    Page will be the fourm where users can keep track of the providence of 
    their items.
--> 
<template>
    <div>
        <h1>{{ deviceName }} Asset Provenance Records</h1>
        <div>Device ID: {{ deviceID }}</div>
        <div>
            <ProvidenceFeed :reports="reports" :deviceKey="deviceKey"></ProvidenceFeed>
        </div>
        <hr class="col-1 my-4">
        <CreateProvidenceRecord></CreateProvidenceRecord>
        <div id="form"></div>
    </div>
</template>

<script>
export default {

    mounted() {
        // Fetch device data and reports here
    }
};
</script>

<style>
/* Add your custom styles here */
</style>
