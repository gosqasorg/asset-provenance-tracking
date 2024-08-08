<!-- deviceKey.vue -- management of device
Copyright (C) 2024 GOSQAS
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
  <!-- This link is for the icon in mobile dropdown menu -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <div v-if="!isLoading">
    <div v-if="deviceKeyFound">

      <div class="row pt-3 pb-6 mx-4">
        <div class="col-md-2 d-none d-md-block">
        <!-- Scrollspy -->
         <!-- When the screen size is md (>= 768px) and up  -->
            <nav id="jump-to test" class="sticky-top text-slate"> 
              <p class="menu-spacing">Jump to section</p>
              <ul id="nav" class="nav flex-column nav-pills menu-sidebar ps-2 ">
                <li id="item" class="py-2"
                  style= "border-left: 2px solid #4e3681;"
                  v-for="header in headers"
                  :key="header"
                  :class="{ active: header.id === currentSection }">
                  <a :href="'#' + header.id" class="text-slate py-2" id="item-link">{{ header.name }}</a>
                </li>
              </ul>
            </nav>
          </div>

          <!-- When the screen size is less than md (< 768px ) -->
          <div class="dropdown d-md-none" style="border-bottom: 2px solid #4e3681;">
            <button class="btn text-left rounded-0" 
                    type="button" id="jump-to-mobile" data-bs-toggle="dropdown" aria-controls="toggle" aria-expanded="false"
                    style="border: none; font-size: 18px; text-align: left; border-bottom: 3px;"> 
              <i id="toggle-right" class="fa fa-angle-right"></i>
              <i id="toggle-down" class="fa fa-angle-down"></i>
              Jump to section
            </button>

            <ul class="dropdown-menu rounded-0 border-0" style="width:95%; padding: 7px 34px; 
                background-color:#F1F5F9" aria-labelledby="dropdownMenuButton">
              <li id="dropdown-item" style="padding: 7px"
                  v-for="header in headers"
                  :key="header">
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
              <div><span v-html="clickableLink(deviceRecord.description)"></span></div>
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
                <CsvChildren :deviceKey="deviceKey"></CsvChildren>
              </div>
            </section>
            
          </body>
          <!-- Spied element -->
           <div>
            <CsvProvenance :deviceKey="deviceKey"></CsvProvenance>
           </div>
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
            let current_id = headers[num].id;
            let sec = document.getElementById(current_id);

            let top = window.scrollY;
            let offset = sec.offsetTop + 150; // can customize how far from the section to become active
            let height = sec.offsetHeight;
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

.menu-spacing {
  padding-top: 34px;
}

.provenance {
  white-space: pre-line;
}

a:link, a:visited {
      text-decoration: none;
}

#item > a {
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

#jump-to-mobile[aria-expanded="true"] {
  #toggle-down {
    display:inline-block;
  }
  #toggle-right {
    display: none;
  }
}

#jump-to-mobile[aria-expanded="false"] {
  #toggle-down {
    display:none;
  }
  #toggle-right {
    display: inline-block;
  }
}


</style>
