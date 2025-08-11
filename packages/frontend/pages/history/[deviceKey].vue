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
import { useRoute } from 'vue-router';
import { hasParent } from '~/utils/descendantList';
const route = useRoute();
const recordKey = route.params.deviceKey as string;
const qrCodeUrl = `${useRuntimeConfig().public.frontendUrl}/history/${recordKey}`;

const provenance = await getProvenance(recordKey);

const recordHasParent = hasParent(provenance);
</script>

<template>
  <!-- This link is for the icon in mobile dropdown menu -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
  />
  <div v-if="!isLoading" id="history-page">
    <div v-if="recordKeyFound">
      <div class="deviceKey-history">
        <div class="row pt-3 pb-6 mx-4">
          <div class="col-md-2 d-none d-md-block">
            <!-- Scrollspy -->
            <!-- When the screen size is md (>= 768px) and up  -->
            <nav id="jump-to" class="sticky-top text-slate">
              <p class="menu-spacing jump-sec">Jump to section</p>
              <ul id="nav" class="nav flex-column nav-pills menu-sidebar ps-2">
                <li
                  id="item"
                  class="py-2 scroll"
                  v-for="header in headers"
                  :key="header"
                  :class="{ active: header.id === currentSection }"
                >
                  <a :href="'#' + header.id" class="py-2 h" id="item-link">{{ header.name }}</a>
                </li>
              </ul>
            </nav>
          </div>

          <!-- When the screen size is less than md (< 768px ) -->
          <div class="dropdown d-md-none nav-line">
            <button
              class="btn text-left rounded-0 jump-sec"
              type="button"
              id="jump-to-mobile"
              data-bs-toggle="dropdown"
              aria-controls="toggle"
              aria-expanded="false"
              style="
                border: none;
                font-size: 18px;
                text-align: left;
                border-bottom: 3px;
                padding-left: 0px;
              "
            >
              <i id="toggle-right" class="fa fa-angle-right"></i>
              <i id="toggle-down" class="fa fa-angle-down"></i>
              Jump to section
            </button>

            <ul
              class="dropdown-menu rounded-0 border-0"
              style="width: 95%; padding: 7px 34px"
              aria-labelledby="dropdownMenuButton"
            >
              <li id="dropdown-item" style="padding: 7px" v-for="header in headers" :key="header">
                <a :href="'#' + header.id" class="py-2 h-mobile" id="item-link">{{
                  header.name
                }}</a>
              </li>
            </ul>
          </div>

          <!-- Scrollspy -->

          <div class="col-md-10">
            <!-- Spied element -->
            <div
              data-mdb-scrollspy-init
              data-spy="scroll"
              data-mdb-target="#jump-to"
              data-mdb-offset="0"
              class="left-col"
            >
              <section id="device-details" class="details-container">
                <div class="record-description">
                  <div class="my-4 text-iris fs-1">
                    <p class="text-bold mb-0 device-name">Asset History Records</p>
                    <h1 class="mt-1 mb-1">
                      {{ deviceRecord?.deviceName }}
                    </h1>
                  </div>

                  <div class="rec" v-if="deviceRecord?.children_key && recordHasParent">
                    Group & Child Record Key: {{ _recordKey }}
                  </div>
                  <div class="rec" v-else-if="deviceRecord?.children_key">
                    Group Record Key: {{ _recordKey }}
                  </div>
                  <div class="rec" v-else-if="deviceRecord.isReportingKey">
                    Reporting Key: {{ _recordKey }}
                  </div>
                  <div class="rec" v-else-if="recordHasParent">
                    Child Record Key: {{ _recordKey }}
                  </div>
                  <div class="rec" v-else>Record Key: {{ _recordKey }}</div>

                  <div class="mb-3 rec">
                    <span
                      style="word-wrap: break-word"
                      v-html="clickableLink(deviceRecord?.description)"
                    ></span>
                  </div>

                  <section ref="section" id="priority-notices">
                    <ProvenancePriorityNotices :recordKey="_recordKey" :provenance="provenance" />
                  </section>
                </div>

                <div class="qr-code-wrapper">
                  <QRCode :url="qrCodeUrl" ref="qrcode_component" style="overflow: hidden" />
                </div>
              </section>

              <div class="buttons-container">
                <button class="btn download-btn" @click="downloadQRCode">Download QR Code</button>

                <ProvenanceShareDropdown
                  :deviceName="deviceRecord.deviceName"
                  :description="deviceRecord.description"
                  :fontSize="20"
                  :height="66"
                  :width="48"
                >
                </ProvenanceShareDropdown>
              </div>
              <section id="recalled">
                <ProvenanceFeed
                  border="2px solid #4e3681"
                  :disabled="!valid"
                  :recordKey="_recordKey"
                  :provenance="recalledRecords"
                />
              </section>
              <section id="recent">
                <ProvenanceFeed :recordKey="_recordKey" :provenance="recordsInFeed" />
              </section>
              <section id="device-creation">
                <ProvenanceFeed :recordKey="_recordKey" :provenance="deviceCreationRecord" />
              </section>
              <section id="create-record">
                <ProvenanceCreateRecord :deviceRecord="deviceRecord" :recordKey="_recordKey" />
              </section>

              <section id="child-keys">
                <div v-if="hasReportingKey">
                  Reporting Key:
                  <div>
                    <a :href="`/history/${deviceRecord?.reportingKey}`">{{
                      deviceRecord?.reportingKey
                    }}</a>
                  </div>
                </div>
                <div v-if="childKeys?.length > 0 || hasReportingKey">
                  <div>
                    Child Keys:
                    <div>
                      <KeyList v-bind:keys="childKeys" />
                    </div>
                  </div>
                  <CsvFile :recordKey="_recordKey"></CsvFile>
                </div>
                <ProvenanceCSV :recordKey="_recordKey"></ProvenanceCSV>
              </section>
            </div>
          </div>
          <!-- TODO: Uncomment when  functionality is ready:
               <div>
                 <ProvenanceNotificationSignUpModal/>
               </div>   -->
        </div>
      </div>
    </div>
    <div v-else class="error-container">
      <h1 class="error-title">Invalid history key</h1>
      <h2 class="error-subtitle">No record attached to this key</h2>
      <p class="error-description">
        We’re sorry, the record you’re looking for could not be found. <br />
        Please double-check your key. If you keep receiving this error, <br />
        email us at <a class="error-email" href="mailto:info@gosqas.org">info@gosqas.org</a>.
      </p>
      <div class="error-buttons">
        <!-- Go home button -->
        <RouterLink to="/" class="btn btn-primary error-button">Go home</RouterLink>
        <!-- Email us button -->
        <RouterLink to="/contact" class="btn btn-secondary error-button">Email us</RouterLink>
      </div>
    </div>
  </div>
  <div v-else id="loading-screen">
    <p class="text-center pb-5 pt-5">Creating record(s)...</p>
  </div>
</template>

<script lang="ts">
import { getProvenance } from '~/services/azureFuncs';
import { ref } from 'vue';
import KeyList from '~/components/KeyList.vue';

let deviceRecord: any;
let provenance, deviceCreationRecord, provenanceNoRecord;
let recalledRecords = [];
let recordsInFeed = [];
const currentSection = ref();
let section = ref();
let dropdownVisible = false;

let headers = [
  { id: 'device-details', name: 'Record details' },
  { id: 'priority-notices', name: 'Priority notices' },
  { id: 'recent', name: 'Most recent updates' },
  { id: 'device-creation', name: 'Record creation' },
  { id: 'create-record', name: 'Create new record entry' }
];

export default {
  components: {
    KeyList
  },
  data() {
    return {
      isLoading: true,
      recordKeyFound: false,
      hasReportingKey: false,
      childKeys: [] as string[],
      _recordKey: '',
      valid: false
    };
  },
  async mounted() {
    try {
      const route = useRoute();
      this._recordKey = route.params.deviceKey as string;
      const response = await getProvenance(this._recordKey);
      deviceRecord = response[response.length - 1].record;

      this.addScrollListener();

      EventBus.on('feedRefresh', this.refreshFeed);

      await this.refreshFeed();
    } catch (error) {
      this.isLoading = false;
      this.recordKeyFound = false;
      this.hasReportingKey = false;
      console.log(error);
    }
  },
  beforeDestroy() {
    EventBus.off('feedRefresh', this.refreshFeed);
  },
  methods: {
    downloadQRCode() {
      const qrCodeComponent = this.$refs.qrcode_component as any;
      qrCodeComponent?.downloadQRCode();
    },
    addScrollListener() {
      // When user scrolls, the nav bar is updated
      window.addEventListener('scroll', () => {
        for (let num in headers) {
          let current_id = headers[num].id;
          let sec = document.getElementById(current_id);

          let top = window.scrollY;
          const baseOffset = 150;
          let offset = sec?.offsetTop ? sec?.offsetTop + baseOffset : baseOffset; // can customize how far from the section to become active
          let height = sec?.offsetHeight ?? 0;
          if (top >= offset && top < offset + height) {
            currentSection.value = current_id;
          }
        }
      });
    },
    async refreshFeed() {
      console.log('Refreshing feed...');
      this.isLoading = true;
      this.recordKeyFound = false;
      this.hasReportingKey = false;

      const provenance = await getProvenance(this._recordKey);

      if (!provenance || provenance.length === 0) {
        this.$snackbar.add({
          type: 'error',
          text: 'No provenance record found'
        });
        this.isLoading = false;
        return;
      }

      this.recordKeyFound = true;

      // Decompose the provenance records into parts to be rendered.
      ({ provenanceNoRecord, deviceCreationRecord, deviceRecord } =
        decomposeProvenance(provenance));

      // Pin recalled records to the top of the feed
      recalledRecords = [];
      recordsInFeed = [];

      provenanceNoRecord.forEach((record) => {
        if (
          !Object.is(record.record.tags, undefined) &&
          Array.from(record.record.tags).includes('recall')
        ) {
          recalledRecords.push(record);
        } else {
          recordsInFeed.push(record);
        }
      });

      this.isLoading = false;

      // This functionality could be pushed into a component...
      this.hasReportingKey = deviceRecord.reportingKey ? true : false;

      // We will remove the reportingKey, because although it is a child,
      // we have already rendered it.
      if (this.hasReportingKey) {
        const index = deviceRecord.children_key.indexOf(deviceRecord.reportingKey, 0);
        if (index > -1) {
          deviceRecord.children_key.splice(index, 1);
        }
      }
      this.childKeys = getChildKeys(provenance);

      // Add child key navigation if there are child keys
      if (this.childKeys?.length > 0 || this.hasReportingKey) {
        headers = [
          { id: 'device-details', name: 'Record details' },
          { id: 'priority-notices', name: 'Priority notices' },
          { id: 'recent', name: 'Most recent updates' },
          { id: 'device-creation', name: 'Record creation' },
          { id: 'create-record', name: 'Create new record entry' }
        ];
        headers.push({ id: 'child-keys', name: 'Child keys' });
      }
    }
  }
};
</script>

<style scoped>
.history-container #device-details {
  margin: 20px auto;
  margin-bottom: 15px;
  position: relative;
}

.qr-code-wrapper {
  background-color: #4e3681;
  /* Purple outline */
  padding: 13px;
  padding-bottom: 7px;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: scale(0.775);
  margin: -20px;
  margin-left: -40px;
  height: min-content;
}

.record-description {
  margin-right: 15px;
  max-width: 60%;
}

.details-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.buttons-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.download-btn {
  margin-top: 20px;
  width: 48% !important;
}

.descr-container {
  word-wrap: break-word !important;
}

#history-page,
#loading-screen {
  width: 100%;
}

@media (max-width: 995px) {
  .record-description {
    max-width: 100%;
  }
}

/* Wrap buttons once screen gets below a certain size */
@media (max-width: 991px) {
  .download-btn {
    width: 100% !important;
  }
}

#item-link {
  text-decoration: none;
  cursor: pointer;
}

.download-button {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.download-button:hover {
  background-color: #4e3681;
  /* Slightly darker blue on hover */
}

.menu-spacing {
  padding-top: 34px;
}

.provenance {
  white-space: pre-line;
}

a:link,
a:visited {
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
  padding-left: 20px;
  font-weight: bold;
}

#jump-to-mobile[aria-expanded='true'] {
  #toggle-down {
    display: inline-block;
  }

  #toggle-right {
    display: none;
  }
}

#jump-to-mobile[aria-expanded='false'] {
  #toggle-down {
    display: none;
  }

  #toggle-right {
    display: inline-block;
  }
}

.error-container {
  text-align: center;
  margin: 70px auto;
  max-width: 655px;
  padding: 20px;
}

.error-title {
  text-align: left;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 48px;
  line-height: 150%;
  margin-bottom: 10px;
  color: #322253;
  text-align: left;
}

.error-subtitle {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 40px;
  line-height: 60px;
  margin-bottom: 20px;
  color: #1e2019;
  /* Dark text color */
  text-align: left;
}

.error-description {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 30px;
  margin-bottom: 30px;
  color: #1e2019;
  text-align: left;
}

.error-email {
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  line-height: 30px;
  color: #4e3681;
  text-decoration: underline !important;
}

.error-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
}

.error-button {
  width: 48% !important;
}

.btn {
  height: 66px;
  padding: 18px 22px;
  /*     margin: 5px;*/
  border-radius: 10px;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 400;
  text-align: center;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #4e3681;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #3b2a6a;
  /* Darker purple */
}

.btn-secondary {
  background-color: #ccecfd;
  /* Light blue */
  color: #1e2019;
  /* Dark text */
}

.btn-secondary:hover {
  background-color: #b3dff5;
  /* Slightly darker blue */
  color: #1e2019;
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
  .deviceKey-history {
    background-color: #1e2019;
  }

  #loading-screen {
    background-color: #1e2019;
    color: white;
  }

  h1 {
    color: #ccecfd;
  }

  .device-name {
    color: #ccecfd;
  }

  .rec,
  #priority-notices,
  .jump-sec,
  .jump-sec:hover .jump-sec:active {
    color: #ffffff;
  }

  #desc {
    color: #ffffff;
  }

  .dropdown-menu {
    background-color: #1e2019;
  }

  .nav-line {
    border-bottom: 2px solid #ccecfd;
  }

  .scroll {
    border-left: 2px solid #ccecfd;
  }

  .active > a {
    border-left: 3px solid #ccecfd;
  }

  .h,
  .h-mobile {
    color: white;
  }

  .view-history {
    background-color: #ccecfd;
    border: #ccecfd;
    color: black;
  }

  .download-btn {
    background-color: #1e2019;
    border: 2px solid #ffffff;
    color: white;
  }

  .download-btn:hover {
    color: white;
  }
}

/* Light mode version*/
@media (prefers-color-scheme: light) {
  .deviceKey-history {
    background-color: #ffffff;
  }

  h1 {
    color: #4e3681;
  }

  .device-name {
    color: #4e3681;
  }

  .rec,
  #priority-notices,
  .jump-sec {
    color: #1e2019;
  }

  .dropdown-menu {
    background-color: #f1f5f9;
  }

  .nav-line {
    border-bottom: 2px solid #4e3681;
  }

  .scroll {
    border-left: 2px solid #4e3681;
  }

  .active > a {
    border-left: 3px solid #4e3681;
  }

  .h,
  .h-mobile {
    color: black;
  }

  #desc {
    color: #1e2019;
  }

  .view-history {
    background-color: #4e3681;
    border: #4e3681;
    color: white;
  }

  .download-btn {
    background-color: #ccecfd;
    border: #ccecfd;
    color: black;
  }

  .download-btn:hover {
    color: black;
  }
}
</style>
