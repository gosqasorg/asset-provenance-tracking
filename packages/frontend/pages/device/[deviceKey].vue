<script setup lang="ts">
const route = useRoute()
const deviceKey = route.params.deviceKey;
const deviceDescription = route.params.description;
</script>

<template>
    <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
    <div class="navigationBar">
        <a href="http://localhost:3000/"><img class="logohomepage" src="https://www.pubinv.org/wp-content/uploads/image.png"></a>
        <element>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a href="about"><button
                    class="navigation">About</button></a>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a href = "https://gosqas.org/devices"><button
                    class="navigation">Sample Devices</button></a>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a href = "contact"><button
                    class="navigation" style="margin-right: 100px;">Contact</button></a></element>
    </div>
    <div class = "mainStuff"><br>
  <div>
    <h1 style = "font-weight: 1000; color:#4e3681;"><div v-if="!isLoading">{{deviceRecord.deviceName }}</div></h1>
    <div style = "font-weight: 900;">Device Key: {{ route.params.deviceKey }}</div>
    <div v-if="!isLoading" style = "line-height:30px;">{{ deviceRecord.description }}</div>
    <!-- TODO: We might want to call this an Admin key if it has a reporting key -->
    Child Keys:
    <div>
    <KeyList v-bind:keys="childKeys"/>
    </div>
    <div><GenerateQRCode :deviceKey="route.params.deviceKey"></GenerateQRCode></div>
    <a :href="`/provenance/${route.params.deviceKey}`"><button class = "viewRecordsButton">View Provenance Records</button></a>
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
  </div>
</div>
</template>
<script lang="ts">
import GenerateQRCode from '~/components/GenerateQRCode.vue';
import KeyList from '~/components/KeyList.vue';
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
            const route = useRoute();
            const deviceKey = route.params.deviceKey;
            const response = await getProvenance(deviceKey);
            deviceRecord = response[response.length - 1].record;
            console.log(deviceRecord);
            this.isLoading = false;
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
<style>
body {
        font-family: 'Poppins', sans-serif;
    }
    .navigationBar {
        display: flex;
        align-items: center;
        padding-top: 7px;
        background-color: #e6f6ff;
    }
    .logohomepage {
        width: 60px;
        margin: 20px 20px 20px 50px;
    }
    element {
        margin-left: auto;
        display: flex;
        align-items: center;
    }
    button.navigation {
        background-color: transparent;
        border-width: 0;
        text-align: center;
        margin: 0 10px;
    }
    .mainStuff {
        margin: 50px;
        margin-top: 30px;
    }
    </style>