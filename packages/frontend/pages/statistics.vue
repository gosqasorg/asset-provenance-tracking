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
                <p class="display-4">{{ totalDevices }}</p>
              </div>
            </div>
          </div>
  
          <!-- Total provenance records -->
          <div class="col-md-6 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Total Record Entries</h6>
                <p class="display-4">{{ totalRecords }}</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Unique devices added in time windows -->
        <p class="h6 mb-2">Records added:</p>
        <div class="row text-center mb-4">
          <!-- Last 1 hour -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 1 Hour</h6>
                <p class="display-4">{{ devices1h }}</p>
              </div>
            </div>
          </div>
          <!-- Last 24 hours -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 24 Hours</h6>
                <p class="display-4">{{ devices24h }}</p>
              </div>
            </div>
          </div>
          <!-- Last 7 days -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 7 Days</h6>
                <p class="display-4">{{ devices7d }}</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Total records added in time windows -->
        <p class="h6 mb-2">Record entries added:</p>
        <div class="row text-center">
          <!-- Last 1 hour -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 1 Hour</h6>
                <p class="display-4">{{ records1h }}</p>
              </div>
            </div>
          </div>
          <!-- Last 24 hours -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 24 Hours</h6>
                <p class="display-4">{{ records24h }}</p>
              </div>
            </div>
          </div>
          <!-- Last 7 days -->
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Last 7 Days</h6>
                <p class="display-4">{{ records7d }}</p>
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
        // Total number of records/devices
        totalRecords: 0,
        totalDevices: 0,
        // Records/Devices per 1hr/24hrs/7days
        records1h: 0,
        records24h: 0,
        records7d: 0,
        devices1h: 0,
        devices24h: 0,
        devices7d: 0,
        // Y values for the graph
        recordsPerDayY: [0, 0, 0, 0, 0, 0, 0],
        recordsPerHourY: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

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
          title: {text: 'Record Entries Created Per Hour (Last 7 Days)'},
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
      // Graph records created each day of the past week
      recordsPerDay() {
        let x = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat']
        let y = this.recordsPerDayY

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

      // Graph number of records created each hour of the past week
      recordsPerHour() {
        let x = ['1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00',
                '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00']
        let y = this.recordsPerHourY

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
      console.log("loading statistics...")
      const counts = await this.fetchData()

      this.totalRecords = counts.totalRecords
      this.totalDevices = counts.totalDevices

      this.records1h = counts.records1h
      this.records24h = counts.records24h
      this.records7d = counts.records7d
      this.devices1h = counts.devices1h
      this.devices24h = counts.devices24h
      this.devices7d = counts.devices7d

      this.recordsPerDayY = counts.recordsPerDayY
      this.recordsPerHourY = counts.recordsPerHourY

      // Hide loading state
      this.isLoading = false
    }
  }
  </script>
  