<!--
    Page will be the fourm where users can keep track of the providence of
    their items.
    -->
<script setup lang="ts">
const route = useRoute()
const deviceKey = route.params.deviceKey;
</script>
<template>
    <div v-if="!isLoading">
        <h1 >"{{ deviceRecord.deviceName }}" Asset Provenance Records</h1>
        <div>Device ID: {{ deviceRecord.deviceID }}</div>
    <div>
    <ProvidencePriorityNotices :deviceKey="deviceKey" :provenance="provenance"/>
    </div>
    <a href="#createRecord">Go to "Create New Provenance Record"</a>
        <div>
    <ProvidenceFeed :deviceKey="deviceKey" :provenance="provenance"/>
        </div>
        <hr class="col-1 my-4">
    <ProvidenceCreateRecord :deviceRecord="deviceRecord" :deviceKey="deviceKey" id="createRecord"/>
        <!--Put the Reporting Key here if there is one -->
    <div v-if="!isLoading">
    <div v-if="hasReportingKey">
    Reporting Key:
    <div>
    <a :href="`/provenance/${deviceRecord.reportingKey}`">{{deviceRecord.reportingKey}}</a>
    </div>
      </div>
    </div>
    <!--Put the Child List key here if there are any -->
    Child Keys:
<div>
    <KeyList v-bind:keys="childKeys"/>
    </div>
    </div>
</template>

<script lang="ts">
import { getProvenance} from '~/services/azureFuncs.ts'
import { ref, onMounted } from 'vue'
import KeyList from '~/components/KeyList.vue';
// import Feed from '~/components/Feed.vue';

// let deviceInfo = ref({})
let deviceRecord;
let provenance;

export default {
    components: {
        KeyList,
    },
    data() {
        return {
            isLoading: true,
            hasReportingKey: false,
            childKeys: [],
        }},
    async mounted() {
        try {
            console.log("hello!");
            const route = useRoute();
            const deviceKey = route.params.deviceKey;
            await getProvenance(deviceKey).then((response) => {
                provenance = response;
            });
            console.log(provenance);
            deviceRecord = provenance[provenance.length - 1].record;
            console.log(deviceRecord);
            this.isLoading = false;

            // This functionality could be pushed into a component...
            this.hasReportingKey = (deviceRecord.reportingKey ? true : false);
            // We will remove the reportingKey, because although it is a child,
            // we have already rendered it.
            if (this.hasReportingKey) {
                const index = deviceRecord.children_key.indexOf(deviceRecord.reportingKey, 0);
                if (index > -1) {
                    deviceRecord.children_key.splice(index, 1);
                }
            }
            this.childKeys = deviceRecord.children_key;
        } catch (error) {
            console.log(error)
        }
    }
};

</script>
