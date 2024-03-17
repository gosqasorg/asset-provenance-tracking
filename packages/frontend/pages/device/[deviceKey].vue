<script setup lang="ts">
const route = useRoute()
const deviceKey = route.params.deviceKey;
</script>

<template>
  <div>
    <h1><div>Device Key: {{ route.params.deviceKey }}</div></h1>
    <!-- TODO: We might want to call this an Admin key if it has a reporting key -->
    <div v-if="!isLoading">
      <div>Name: {{deviceRecord.deviceName}}</div>
    </div>
    <div><a :href="`/provenance/${route.params.deviceKey}`">View Provenance Records</a></div>
    <div><GenerateQRCode :deviceKey="route.params.deviceKey"></GenerateQRCode></div>
    <!--Put the Reporting Key here if there is one -->
    <div v-if="!isLoading">
    <div v-if="hasReportingKey">
    Reporting Key:
    <a :href="`/provenance/${deviceRecord.reportingKey}`">{{deviceRecord.reportingKey}}</a>
      </div>
    </div>
    <!--Put the Child List key here if there are any -->
    <ChildKeysList v-bind:childkeys="childKeys"/>
  </div>
</template>
<script lang="ts">
import GenerateQRCode from '~/components/GenerateQRCode.vue';
import ChildKeysList from '~/components/ChildKeysList.vue';
import { getProvenance } from '~/services/azureFuncs';

let deviceRecord;

 // Here we are are going to want to read the device,
 //    but not all the provenance. We will use this to load
 //    the two components above, the reporting key component and
 //    the child list component.
 //    At present, get Provenance is our only function;
 //    we do not have a function for returning only the first
//    record of a device, but we probably should.

export default {
    components: {
        GenerateQRCode,
        ChildKeysList,
    },
    data() {
        return {
            isLoading: true,
            hasReportingKey: false,
            childKeys: [],
        }},
    async mounted() {
        try {
            const route = useRoute();
            const deviceKey = route.params.deviceKey;
            const response = await getProvenance(deviceKey);
            // Warning---I am not sure this works if a provenance has been added.

            console.log(response);
            deviceRecord = response[response.length - 1].record;
            console.log(deviceRecord);
            this.isLoading = false;
            this.hasReportingKey = (deviceRecord.reportingKey ? true : false);
            this.childKeys = deviceRecord.children_key;
            console.log(this.hasReportingKey);
        } catch (error) {
            console.log(error)
        }
    }
};


</script>
