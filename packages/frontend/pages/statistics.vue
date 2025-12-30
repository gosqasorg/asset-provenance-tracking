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
          <!-- Graph of records created this week -->
          <div class="mt-4 mb-3" style="border: solid 1px lightgrey; border-radius: 10px; background-color: white">
            <Plotly :data="recordsPerDay" :layout="chartLayout" />
          </div>

          <!-- Graph of times records were created this week -->
          <div class="mt-4 mb-3" style="border: solid 1px lightgrey; border-radius: 10px; background-color: white">
            <Plotly :data="recordsPerHour" :layout="chartLayout2" />
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

        chartLayout: {
          title: {text: 'Record Entries Created This Week'},
          xaxis: {
            title: {text: 'Day Created',
                    type : 'category'}
          },
          yaxis: {
            title: {text: 'Number of Records Created'},
            tickmode: 'auto',
            nticks: 10,
            rangemode: 'tozero'
          }
        },

        chartLayout2: {
          title: {text: 'Record Entries Created Per Hour (Last 28 Days)'},
          xaxis: {
            title: {text: 'Hour Created'}
          },
          yaxis: {
            title: {text: 'Number of Records Created'},
            tickmode: 'auto',
            nticks: 10,
            rangemode: 'tozero'
          }
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

      last24hDeviceCount() {
        const now = Date.now()
        const recent = this.myTimestampPairs.filter(
          r => now - Number(r.timestamp) <= 24 * 60 * 60 * 1000
        )

        return new Set(recent.map(r => r.deviceID)).size
      },

      last7DaysDeviceCount() {
        const now = Date.now()
        const recent = this.myTimestampPairs.filter(
          r => now - Number(r.timestamp) <= 7 * 24 * 60 * 60 * 1000
        )
        return new Set(recent.map(r => r.deviceID)).size
      },

      // Get number of records created each day of the past week to graph
      recordsPerDay() {
        const d = new Date()
        const now = Date.now()
        let today = d.getDay()  // returns 0-6 (0 is Sunday, 6 is Saturday)
        let hours = d.getHours() + (d.getMinutes() / 60)
        let counted = 0

        let x = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat']
        let y = [0, 0, 0, 0, 0, 0, 0]

        // Get records created today
        let recent = this.myTimestampPairs.filter(
          r => now - Number(r.timestamp) <= hours * 60 * 60 * 1000
        )

        for (let i = 0; i <= today; i++) {
          // Add the records we found to the current day, subtracting records we already counted
          y[today - i] = recent.length - counted
          counted = recent.length
          hours += 24

          recent = this.myTimestampPairs.filter(
            r => now - Number(r.timestamp) <= hours * 60 * 60 * 1000
          )
        }

        const chartData = [{
          x: x,
          y: y,
          type: 'scatter',
          marker: {
            color: '#4e3681'
          }
        }]

        return chartData
      },

      // Get number of records created each hour of the past month to graph
      recordsPerHour() {
        const d = new Date()
        const now = Date.now()
        let currentHour = d.getHours()
        let minutes = d.getMinutes() / 60
        let day = 0

        let counted = 0

        let x = ['1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00',
                '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00']
        let y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        for (let weekday = 0; weekday < 28; weekday++) {
          for (let hour = 0; hour < 24; hour++) {
            let hourly = this.myTimestampPairs.filter(
              // (0-1 [minutes in the current hour] + 0-24 [hours ago] + 0,24,48,... [the day]) * translate to milliseconds)
              r => now - Number(r.timestamp) <= (minutes + hour + day) * 60 * 60 * 1000
            )

            // If a record was created within an hour, add it to the graph
            if (hourly.length - counted > 0) {
              y[Math.abs(currentHour - hour - 1)] += hourly.length - counted
              counted = hourly.length
            }
          }

          day += 24

        }

        const chartData = [{
          x: x,
          y: y,
          type: 'bar',
          marker: {
            color: '#4e3681'
          }
        }]

        return chartData
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
  