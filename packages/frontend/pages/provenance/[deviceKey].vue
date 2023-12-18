<!-- 
    Page will be the fourm where users can keep track of the providence of 
    their items.
--> 
<template>
    <div>
        <h1>{{ deviceName }} Asset Provenance Records</h1>
        <div>Device ID: {{ deviceID }}</div>
        <div>
            <ProvidenceFeed :deviceKey="deviceKey"></ProvidenceFeed>
        </div>
        <hr class="col-1 my-4">
        <CreateProvidenceRecord></CreateProvidenceRecord>
        <div id="form"></div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const deviceKey = route.params.deviceKey



</script>
