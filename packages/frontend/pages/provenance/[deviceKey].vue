<!-- 
    Page will be the fourm where users can keep track of the providence of 
    their items.
--> 
<template>
    <div>
        <h1>"{{ deviceInfo.deviceName }}" Asset History Records</h1>
        <div>Device ID: {{ deviceKey }}</div>
        <a href="#createRecord">Go to "Create New History Record"</a>
        <div>
            <ProvidenceFeed :deviceKey="deviceKey"/>
        </div>
        <hr class="col-1 my-4">
        <ProvidenceCreateRecord :deviceKey="deviceKey" id="createRecord"/>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { getProvenance} from '~/services/azureFuncs.ts'
import { ref, onMounted } from 'vue'

const route = useRoute()
const deviceKey = route.params.deviceKey


let deviceInfo = ref({})

onMounted(async () => {
    try {
        const response = await getProvenance(deviceKey)
        deviceInfo.value = response[response.length - 1].record
    } catch (error) {
        console.log(error)
    }
})
</script>
