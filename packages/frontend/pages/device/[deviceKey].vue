<script setup lang="ts">
const route = useRoute()
const deviceKey = route.params.deviceKey;
</script>

<template>
    <nav class="navbar navbar-expand-md navbar-light bg-sky">
    <div class="container">
        <a href="/" class="navbar-brand">
            <img src="../../assets/styles/gosqas_logo.png" width="300">
        </a>

        <!-- toggle button for mobile -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav" 
        aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button> 

        <div class="collapse navbar-collapse justify-content-end align-center " id="main-nav">
            <ul class="navbar-nav ms-2">
                <li class="nav-item pe-4">
                    <a class="nav-link" href="#">About</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Contact</a>
                </li>
            </ul>
        </div>
    </div>
    </nav>

  <div class="container-md my-4">
    <div class="row justify-content-between">
        <div class="col-sm-6 col-lg-9">

            <div class="mt-4 mb-2 text-iris fs-1" v-if="!isLoading">{{deviceRecord.deviceName}}</div>
            <!-- TODO: We might want to call this an Admin key if it has a reporting key -->
        
            <div>Device Key: {{ route.params.deviceKey }}</div>
            <div class="my-2" v-if="!isLoading">{{deviceRecord.description}}</div>
        
            <div> 
                <button class="btn mt-1 bg-iris text-white me-4 px-4"><a :href="`/provenance/${route.params.deviceKey}`" style="color: white; text-decoration: none">View Provenance Records</a></button>
                <button class="btn mt-1 bg-sky px-5">Download QR Code</button>
            </div>

        </div>
        <div class="col-sm-6 col-lg-3 mt-2">

            <div><GenerateQRCode :deviceKey="route.params.deviceKey"></GenerateQRCode></div>

        </div>

    </div>


    <!-- <div><a :href="`/provenance/${route.params.deviceKey}`">View History Records</a></div> -->


    <!--Put the Reporting Key here if there is one -->
    <div v-if="!isLoading">
        <div v-if="hasReportingKey" class="mt-4 mb-2 text-iris fs-2">
        Reporting Key:
        </div>
            <div>
                <a :href="`/provenance/${deviceRecord.reportingKey}`">{{deviceRecord.reportingKey}}</a>
            </div>
    </div>

    <!--Put the Child List key here if there are any -->
    <div v-if="childKeys" class="mt-4 mb-2 text-iris fs-3"> ChildKeys: </div>
    <div> 
    <KeyList v-bind:keys="childKeys"/>
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
