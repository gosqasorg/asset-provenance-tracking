<!-- statistics.vue -- statistics
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
<template>
    <div class="container py-4">
      <!-- Loading indicator while data is being fetched -->
      <div v-if="isLoading" class="text-center">
        Loading statistics…
      </div>
  
      <!-- Once data is loaded, show all statistic cards -->
      <div v-else>
        <p class="h5 mb-4">Statistics Overview</p>
  
        <!-- Total counts  -->
        <div class="row text-center mb-4">
          <!-- Total unique devices -->
          <div class="col-md-6 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Total Records</h6>
                <!-- Computed property totalDevices -->
                <p class="display-4">{{ totalDevices }}</p>
              </div>
            </div>
          </div>
  
          <!-- Total provenance records -->
          <div class="col-md-6 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Total Record Entries</h6>
                <!-- Computed property totalRecords -->
                <p class="display-4">{{ totalRecords }}</p>
              </div>
            </div>
          </div>
        </div>
  
        <!--Devices added in time windows-->
        <p class="h6 mb-2">Records added:</p>
        <div class="row text-center mb-4">
          <!-- Last 1 hour -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 1 Hour</h6>
                <!-- Computes unique deviceIDs in past hour -->
                <p class="display-4">{{ lastHourDeviceCount }}</p>
              </div>
            </div>
          </div>
          <!-- Last 24 hours -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 24 Hours</h6>
                <!-- Computes unique deviceIDs in past 24h -->
                <p class="display-4">{{ last24hDeviceCount }}</p>
              </div>
            </div>
          </div>
          <!-- Last 7 days -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 7 Days</h6>
                <!-- Computes unique deviceIDs in past 7d -->
                <p class="display-4">{{ last7DaysDeviceCount }}</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Records added in time windows -->
        <p class="h6 mb-2">Record entries added:</p>
        <div class="row text-center">
          <!-- Last 1 hour -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 1 Hour</h6>
                <!-- Total records in past hour -->
                <p class="display-4">{{ lastHourRecordCount }}</p>
              </div>
            </div>
          </div>
          <!-- Last 24 hours -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 24 Hours</h6>
                <!-- Total records in past 24h -->
                <p class="display-4">{{ last24hRecordCount }}</p>
              </div>
            </div>
          </div>
          <!-- Last 7 days -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 7 Days</h6>
                <!-- Total records in past 7d -->
                <p class="display-4">{{ last7DaysRecordCount }}</p>
              </div>
            </div>
          </div>

          <!-- TODO: This adds the Plotly.vue template chart (where does title go??) -->
          <div id="app">
            <Plotly :data="chartData" :layout="chartLayout" />
          </div>

        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { getStatistics } from '~/services/azureFuncs'
  import PlotlyChart from '../components/Plotly.vue'
  
  export default {
    name: 'Statistics',

    components: {
      PlotlyChart
    },
  
    data() {
      return {
        // Controls loading spinner
        isLoading: true,
        // Raw array of { timestamp, deviceID } items from API
        myTimestampPairs: [],

        // TODO: replace with actual data (plotly.js)
        // WANT: Times records were created in the last week (one for days of week, one for times of day??)
        chartData: [{
          x: [1, 2, 3, 4, 5],
          y: [10, 15, 13, 17, 22],
          type: 'scatter'
        }],
        chartLayout: {
          title: 'Sample Chart'
        }
      }
    },
  
    computed: {
      // Totals 
      // Total number of records fetched
      totalRecords() {
        return this.myTimestampPairs.length
      },
      // Total number of unique devices
      totalDevices() {
        // Remove duplicate device IDs
        return new Set(this.myTimestampPairs.map(r => r.deviceID)).size
      },
  
      //Provenance record counts in time windows 
      lastHourRecordCount() {
        const now = Date.now()
        // Filter records with timestamp within last 1 hour
        return this.myTimestampPairs.filter(
          r => now - Number(r.timestamp) <= 1 * 60 * 60 * 1000
        ).length
      },
      last24hRecordCount() {
        const now = Date.now()
        // Filter records within last 24 hours
        return this.myTimestampPairs.filter(
          r => now - Number(r.timestamp) <= 24 * 60 * 60 * 1000
        ).length
      },
      last7DaysRecordCount() {
        const now = Date.now()
        // Filter records within last 7 days
        return this.myTimestampPairs.filter(
          r => now - Number(r.timestamp) <= 7 * 24 * 60 * 60 * 1000
        ).length
      },
  
      //Device counts in time windows
      lastHourDeviceCount() {
        const now = Date.now()
        // Get only recent records, then dedupe by deviceID
        const recent = this.myTimestampPairs.filter(
          r => now - Number(r.timestamp) <= 1 * 60 * 60 * 1000
        )
        return new Set(recent.map(r => r.deviceID)).size
      },

      // TODO: figure out what timestamp is and what how to get daily/hourly info
        // NOTE: i think if we do the same as these functions but just for days/hours it should work!
      last24hDeviceCount() {
        console.log("24 HOURS!")
        const now = Date.now()
        const recent = this.myTimestampPairs.filter(
          // NOTE: current time - creation time <= 24 hours ago in MILLISECONDS!
          r => now - Number(r.timestamp) <= 24 * 60 * 60 * 1000
        )

        // TODO: same as recent..?
        // [{"timestamp":"1765850588878","deviceID":"258cc003b7dbacb098a05310c7982d2ebdf16477d8cd20795a8e1e659507106d"}]
        console.log("*original: " + JSON.stringify(this.myTimestampPairs))

        // [{"timestamp":"1765850588878","deviceID":"258cc003b7dbacb098a05310c7982d2ebdf16477d8cd20795a8e1e659507106d"}]
        console.log("*recent: " + JSON.stringify(recent))

        let test = new Set(recent.map(r => r.deviceID))
        // console.log("*group: " + new Set(recent.map(r => r.deviceID)))
        return new Set(recent.map(r => r.deviceID)).size
      },

      last7DaysDeviceCount() {
        const now = Date.now()
        const recent = this.myTimestampPairs.filter(
          r => now - Number(r.timestamp) <= 7 * 24 * 60 * 60 * 1000
        )
        return new Set(recent.map(r => r.deviceID)).size
      }
    },
  
    methods: {
      // Fetches data from your existing API function
      async fetchData() {
        try {
          return await getStatistics()
        } catch (error) {
          // Show error via your snackbar utility
          this.$snackbar.add({ type: 'error', text: `Error: ${error}` })
          return []
        }
      }
    },
  
    async mounted() {
      // On component mount, load data...
      const pairs = await this.fetchData()
      // sort newest-first by timestamp
      pairs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
      this.myTimestampPairs = pairs
      // Hide loading state
      this.isLoading = false
    }
  }
  </script>
  