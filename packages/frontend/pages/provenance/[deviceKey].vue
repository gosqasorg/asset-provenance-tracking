<!--
    Page will be the forum where users can keep track of the provenance of
    their items.
    -->
<script setup lang="ts">
  const route = useRoute()
  const deviceKey = route.params.deviceKey;
</script>

<template>
  <div v-if="!isLoading">
    <div v-if="deviceKeyFound">

      <div class="my-4 text-iris fs-1">"{{ deviceRecord.deviceName }}" Asset History Records</div>
    <div>Device ID: {{ deviceKey }}</div>
    <ProvenancePriorityNotices :deviceKey="deviceKey" :provenance="provenance"/>
        <a href = "#createdDevicePoint">
          <button class = "textToLinkButton0">Go to Device Creation Record </button>
        </a>
    <br>
        <a href = "#createRecordPoint">
          <button class = "textToLinkButton1">Go to Create New History Record </button>
        </a>
    <br>
      <a href = "#childKeysPoint">
        <button class = "textToLinkButton2">Go to Child Keys </button>
      </a>
      <div class="provenance">

        <ProvenanceFeed :deviceKey="deviceKey" :provenance="provenance"/>
      </div>
      <hr class="col-1 my-4">
    <ProvenanceCreateRecord :deviceRecord="deviceRecord" :deviceKey="deviceKey" id="createRecordPoint"/>
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
    <div id="childKeysPoint">
        Child Keys:
      <div>
        <KeyList v-bind:keys="childKeys"/>
        <br> <CsvFile :deviceKey="deviceKey"></CsvFile>
      </div>
    </div>

      <!-- TODO: Uncomment when  functionality is ready: -->
      <!-- <div>
          <ProvenanceNotificationSignUpModal/>
      </div>   --> 

    </div>
    <div v-else>
      <p>Device key not found.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { getProvenance} from '~/services/azureFuncs';
import { ref, onMounted } from 'vue'
import KeyList from '~/components/KeyList.vue';

let deviceRecord, provenance;

export default {
    components: {
        KeyList,
    },
    data() {
        return {
            isLoading: true,
            deviceKeyFound: false,
            hasReportingKey: false,
            childKeys: [],
        }},
    async mounted() {
        try {
            // console.log("hello!");
            const route = useRoute();
            const deviceKey = route.params.deviceKey;
            await getProvenance(deviceKey).then((response) => {
                provenance = response;
                this.deviceKeyFound = true;
            });
            deviceRecord = provenance[provenance.length - 1].record;
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


            let childKeysList:any = [];

            for (let i=0; i < provenance.length; i++) {
               childKeysList += provenance[i].record.children_key + ",";
            }

            childKeysList= childKeysList.split(',');

            this.childKeys = childKeysList;

        } catch (error) {
            this.isLoading = false;
            this.deviceKeyFound = false;
            console.log(error)
        }
    }
};

</script>
<style>

.provenance {
  white-space: pre-line;
}

.textToLinkButton0 {
    border-width: 0px;
    border-radius: 10px;
    background-color: rgb(243, 248, 100);
    padding: 5px;
}
.textToLinkButton1 {
    border-width: 0px;
    border-radius: 10px;
    background-color: rgb(145, 193, 248);
    padding: 5px;
}
.textToLinkButton2 {
    border-width: 0px;
    border-radius: 10px;
    padding: 5px;
    margin-bottom: 10px;
}
</style>
