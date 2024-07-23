<!-- deviceKey.vue -- management of device
Copyright (C) 2024 GOSQAS Team
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. -->

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

      <div class="row pt-5 pb-6 mx-4">
        <div class="col-md-2 d-none d-md-block">
        <!-- Scrollspy -->
         <!-- When the screen size is md (>= 768px) and up  -->
            <nav id="jump-to" class="sticky-top text-slate">
              <p>Jump to section</p>
              <ul id="nav" class="nav flex-column nav-pills menu-sidebar ps-2 ">
                <li id="item" class="py-2"
                  v-for="header in headers"
                  :key="header"
                  :class="{ active: header.id === currentSection }"
                >
                  <a :href="'#' + header.id" class="text-slate py-2" id="item-link">{{ header.name }}</a>
                </li>
              </ul>
            </nav>
          </div>

          <!-- When the screen size is less than md (< 768px ) -->
          <div class="dropdown d-md-none" >
            <button class="btn w-100 text-left" 
                    type="button" id="jump-to" data-bs-toggle="dropdown" aria-expanded="false"
                    style="font-size: 18px; text-align: left;">
              Jump to section
            </button>
            <ul class="dropdown-menu w-100" style="padding: 7px 34px; background-color:#F1F5F9 "aria-labelledby="dropdownMenuButton">
              <li id="dropdown-item" style="padding: 7px"
                  v-for="header in headers"
                  :key="header"
                >
                  <a :href="'#' + header.id" class="text-slate py-2" id="item-link">{{ header.name }}</a>
                </li>
            </ul>
          </div>


    <!-- Scrollspy -->

        <div class="col-md-10">
          <!-- Spied element -->
          <body  data-mdb-scrollspy-init data-spy="scroll" data-mdb-target="#jump-to" data-mdb-offset="0" class="left-col" >
            <section id="device-details">
              <div class="my-4 text-iris fs-1">"{{ deviceRecord.deviceName }}" Asset History Records</div>
              <div>Device ID: {{ deviceKey }}</div>
              <div>{{ deviceRecord.description }}</div>
            </section>

            <section ref= "section" id="priority-notices">
              <ProvenancePriorityNotices :deviceKey="deviceKey" :provenance="provenance"/>
            </section>

            <section id="recent">
              <ProvenanceFeed :deviceKey="deviceKey" :provenance="provenance_noRecord"/>
            </section>
            <section id="device-creation">
              <ProvenanceFeed :deviceKey="deviceKey" :provenance="deviceCreationRecord"/>
            </section>
            <section id="create-record">
              <ProvenanceCreateRecord :deviceRecord="deviceRecord" :deviceKey="deviceKey"/>
            </section>
            <section id="child-keys">
              <div v-if="hasReportingKey"> Reporting Key:
                <div> <a :href="`/provenance/${deviceRecord.reportingKey}`">{{deviceRecord.reportingKey}}</a></div>
              </div>
              <div> Child Keys:
                <div> <KeyList v-bind:keys="childKeys"/> </div>
              </div>
              <div v-if="(childKeys.length > 0) || hasReportingKey ">
                <CsvFile :deviceKey="deviceKey"></CsvFile>
              </div>
            </section>
            
          </body>
          <!-- Spied element -->
        </div>

      </div>

      <!-- TODO: Uncomment when  functionality is ready: 
      <div>
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
import { ref, onMounted, type HtmlHTMLAttributes } from 'vue'
import KeyList from '~/components/KeyList.vue';

let deviceRecord, provenance, deviceCreationRecord, provenance_noRecord;
const currentSection = ref();
let section = ref();

const headers = [
  { id: "device-details", name: "Device details" },
  { id: "priority-notices", name: "Priority notices" },
  { id: "recent", name: "Most recent updates" },
  { id: "device-creation", name: "Device creation" },
  { id: "create-record", name: "Create history record" },
  { id: "child-keys", name: "Children keys" }
];


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

        // When user scrolls, the nav bar is updated
        window.addEventListener('scroll', () => {
          for(let num in headers) {
            // console.log("this is the section ", headers[num].id);
            let current_id = headers[num].id;
            let sec = document.getElementById(current_id);
            // console.log("section ", sec);

            let top = window.scrollY;
            let offset = sec.offsetTop - 30; // can customize how far from the section to become active
            let height = sec.offsetHeight;
            // console.log("offset ", offset, "height ", height);
            if (top >= offset && top < offset + height) {
              currentSection.value = current_id;
            }
          }
        });
                

        const route = useRoute();
        const deviceKey = route.params.deviceKey;
        await getProvenance(deviceKey).then((response) => {
            provenance = response;
            this.deviceKeyFound = true;
        });
        provenance_noRecord = provenance.slice(0, -1); // get the provenance without device creation
        deviceCreationRecord = [provenance.at(-1)]; //the last record in the list should be the device creation
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

a:link, a:visited {
      text-decoration: none;
}
/* 
a:visited {
      text-decoration: none;
} */

#item {
  border-left: 2px solid #4e3681;
}


#item > a{
  padding-left: 20px;
  box-decoration-break: clone;
}


#item > a:hover {
  padding-left: 20px;
  font-weight: bold;
}

.active > a {
  border-left: 3px solid #4e3681;
  padding-left: 20px;
  font-weight: bold;
}

#dropdown-item > a:hover {
  font-weight: bold;
}

/* .first-toggle {
  left: 80%;
} */

.button #jump-to > a {
  background-color: aqua;
}


</style>
