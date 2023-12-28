<!-- 
    Page will be the fourm where users can keep track of the providence of 
    their items.
--> 
<template>
    <div>
        <h1>{{ deviceName }} Asset Provenance Records</h1>
        <div>Device ID: {{ deviceID }}</div>
        <div>
            <ProvidenceFeed :deviceKey="deviceKey"/>
        </div>
        <hr class="col-1 my-4">
        <ProvidenceCreateRecord :deviceKey="deviceKey"/>
        <div id="form"></div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { getProvenance} from '~/services/azureFuncs.ts'

const route = useRoute()
const deviceKey = route.params.deviceKey


</script>
