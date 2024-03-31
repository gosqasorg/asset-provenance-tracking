<!--
    Page will be the fourm where users can keep track of the providence of
    their items.
-->
<template>
    <div>
        <template v-if="deviceInfo.deviceKeyFound">
            <h1>"{{ deviceInfo.retrievedData.deviceName }}" Asset History Records</h1>
            <div>Device ID: {{ deviceKey }}</div>
            <a href="'#createRecord/' + deviceKey">Go to "Create New History Record"</a>
        <div>
            <ProvidenceFeed :deviceKey="deviceKey"/>
        </div>
        <hr class="col-1 my-4">
        <ProvidenceCreateRecord :deviceKey="deviceKey" id="createRecord"/>
        </template>
        <template v-else>
            <p>Device key not found.</p>
        </template>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { getProvenance} from '~/services/azureFuncs.ts'
import { ref, onMounted } from 'vue'

const route = useRoute()
const deviceKey = route.params.deviceKey

// We want to do conditional rendering based on whether or not we find the key.
// This is the best way I know to do it; but I am not a Vue expert - rlr
let deviceInfo = ref({ deviceKeyFound: false,
                       retrievedData: {}});

onMounted(async () => {
    if (!deviceKey) {
        console.error('Device key not provided in URL.')
        return
    }
    try {
        const response = await getProvenance(deviceKey)
        deviceInfo.value.retrievedData = response[response.length - 1].record
        deviceInfo.value.deviceKeyFound = true;
    } catch (error) {
        // we probably didn't find the deviceKey in the database...
        deviceInfo.value.deviceKeyFound = false;
        console.log(error)
    }
})
</script>
