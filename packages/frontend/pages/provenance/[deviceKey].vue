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
        <div class="col-md-2">
        <!-- Scrollspy -->

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

    <!-- Scrollspy -->
        </div>

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
              <ProvenanceFeed :deviceKey="deviceKey" :provenance="provenance"/>
            </section>
            <section id="device-creation">
              
            </section>
            <section id="create-record">
              <ProvenanceCreateRecord :deviceRecord="deviceRecord" :deviceKey="deviceKey" id="createRecordPoint"/>
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



      <!-- <div class="my-4 text-iris fs-1">"{{ deviceRecord.deviceName }}" Asset History Records</div>
    <div>Device ID: {{ deviceKey }}</div> -->
    <!-- <ProvenancePriorityNotices :deviceKey="deviceKey" :provenance="provenance"/> -->
        <!-- <a href = "#createdDevicePoint">
          <button class = "textToLinkButton0">Go to Device Creation Record </button>
        </a>
    <br>
        <a href = "#createRecordPoint">
          <button class = "textToLinkButton1">Go to Create New History Record </button>
        </a>
    <br>
      <a href = "#childKeysPoint">
        <button class = "textToLinkButton2">Go to Child Keys </button>
      </a> -->
      <!-- <div class="provenance">

        <ProvenanceFeed :deviceKey="deviceKey" :provenance="provenance"/>
      </div> -->
      <!-- <hr class="col-1 my-4">
    <ProvenanceCreateRecord :deviceRecord="deviceRecord" :deviceKey="deviceKey" id="createRecordPoint"/> -->
    <!--Put the Reporting Key here if there is one -->
    <!-- <div v-if="!isLoading">
      <div v-if="hasReportingKey">
        Reporting Key:
        <div>
          <a :href="`/provenance/${deviceRecord.reportingKey}`">{{deviceRecord.reportingKey}}</a>
        </div>
      </div>
    </div> -->
    <!--Put the Child List key here if there are any -->
    <!-- <div id="childKeysPoint">
        Child Keys:
        <KeyList v-bind:keys="childKeys"/>
    </div>
    <div v-if="(childKeys.length > 0) || hasReportingKey ">
        <br> <CsvFile :deviceKey="deviceKey"></CsvFile>
    </div>

      TODO: Uncomment when  functionality is ready: -->
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
import { ref, onMounted, type HtmlHTMLAttributes } from 'vue'
import KeyList from '~/components/KeyList.vue';
// import { registerScrollSpy } from 'vue3-scroll-spy';
// var bootstrap = typeof window !== `undefined` && import( 'bootstrap' );
// import { ScrollSpy } from 'bootstrap';

let deviceRecord, provenance;
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

          // content.querySelectorAll('#section');
          // console.log("this is the content obtained", content);
            // console.log("hello!");
            
            // let sections= document.querySelectorAll('.section') as NodeListOf<HTMLElement>;
            // let navLi = document.querySelectorAll('nav ul li a') as HtmlHTMLAttributes;
            // console.log("this is the child", content);

            window.addEventListener('scroll', () => {
              for(let num in headers) {
                // console.log("this is the section ", headers[num].id);
                let current_id = headers[num].id;
                let sec = document.getElementById(current_id);
                // console.log("section ", sec);

                let top = window.scrollY;
                let offset = sec.offsetTop +30; // can customize how far from the section to become active
                let height = sec.offsetHeight;
                // console.log("offset ", offset, "height ", height);
                if (top >= offset && top < offset + height) {
                  currentSection.value = current_id;
                }
              }
            });


            
            // section.value = document.querySelectorAll("section");

            // window.addEventListener("scroll", () => {
            //   console.log("the section value is ", section.value);
              // for(let sec in section.value) {

                // console.log("this is sec: ", sec);
                // let top = window.scrollY;
                // let offset = sec.offsetTop - 150;
            //     let height = sec.offsetHeight;
            //     let id = sec.getAttribute("id");

            //     if (top >= offset && top < offset + height) {
            //       currentSection.value = id;
            //     }
              
            // }   
          // });
            

            // function updateScroll() {
            //   section.value.forEach((sec) => {
            //     console.log("this is sec: ", sec);
            //     let top = window.scrollY;
            //     let offset = sec.offsetTop - 150;
            //     let height = sec.offsetHeight;
            //     let id = sec.getAttribute("id");

            //     if (top >= offset && top < offset + height) {
            //       currentSection.value = id;
            //     }
            //   });
            // }
                        

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
/* 
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
} */

a:link {
      text-decoration: none;
}

a:visited {
      text-decoration: none;
}

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


</style>
