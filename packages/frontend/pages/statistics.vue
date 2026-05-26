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

      <!-- Error message only when running this page locally -->
      <div v-else-if="isLocal" class="text-center mt-4">
        This page cannot run locally. Please check out our <a class="gosqas-link" href="https://dev.gosqas.org/statistics">development site</a> or our <a class="gosqas-link" href="https://gosqas.org/statistics">production site</a> instead.
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
        <div class="row text-center mb-4">
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
        </div>

        <!-- Total Attachments -->
        <p class="h6 mb-2">Attachments added:</p>
        <div class="row text-center mb-4">
          <!-- Total attachments -->
          <div class="mb-3">
            <div class="card">
              <div class="card-body">
                <h6 class="card-title">Total Attachments</h6>
                <p class="display-4">{{ totalAttachments }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Failure/Success Counts (only visible on dev) -->
        <div v-if="isDev">
          <p class="h6 mb-2">Successful/Failed record creation (last 3 months):</p>
          <div class="row text-center">
            <!-- Successes -->
            <div class="col-md-6 mb-3">
              <div class="card">
                <div class="card-body">
                  <h6 class="card-title">Successes</h6>
                  <p class="display-4">{{ totalSuccesses }}</p>
                </div>
              </div>
            </div>
            <!-- Failures -->
            <div class="col-md-6 mb-3">
              <div class="card">
                <div class="card-body">
                  <h6 class="card-title">Failures</h6>
                  <p class="display-4">{{ totalFailures }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        

        <!-- Graphs of the data -->
        <div class="row text-center">
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
        // If running locally don't display the page
        isLocal: false,
        // Controls loading spinner
        isLoading: true,
        // Total number of records/devices/attachments
        totalRecords: 0,
        totalDevices: 0,
        totalAttachments: 0,
        // Total successful/failed postProv calls (dev only)
        totalFailures: 0,
        totalSuccesses: 0,
        isDev: false,
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
          // Draw a line above the x-axis to prevent bars overlapping the x-axis
          shapes: [{
            type: 'line',
            xref: 'paper',
            x0: 0, x1: 1,
            y0: 0, y1: 0,
            line: {
              color: 'black',
              width: 1
            },
            layer: 'above'
          }],
          xaxis: {
            title: {text: 'Hour Created (UTC)'}
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
        let y = this.recordsPerHourY

        const amRecords = {
          x: ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am'],
          y: y.slice(0, 12),
          name: 'AM',
          type: 'bar',
          marker: {
            color: '#ccecfd'
          }
        };
        const pmRecords = {
          x: ['12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'],
          y: y.slice(12, 24),
          name: 'PM',
          type: 'bar',
          marker: {
            color: '#4e3681'
          }
        };

        return [amRecords, pmRecords]
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

      const environment = useRuntimeConfig().public.environment;

      // Get the statistics from the backend only if we are not running locally
      // (getStatistics() needs to connect to Azure Log Analytics, and since we don't have an alternative for local development,
      // we're just skipping it for now)
      if (environment != 'development') {
        const counts = await this.fetchData()

        this.totalRecords = counts.totalRecords
        this.totalDevices = counts.totalDevices
        this.totalAttachments = counts.totalAttachments

        this.records1h = counts.records1h
        this.records24h = counts.records24h
        this.records7d = counts.records7d
        this.devices1h = counts.devices1h
        this.devices24h = counts.devices24h
        this.devices7d = counts.devices7d

        this.recordsPerDayY = counts.recordsPerDayY
        this.recordsPerHourY = counts.recordsPerHourY

        this.totalFailures = counts.totalFailures
        this.totalSuccesses = counts.totalSuccesses

        // Show dev counts if environment is not prod
        if (environment != 'production') {
          this.isDev = true
        }
      } else {
        this.isLocal = true
      }

      // Hide loading state
      this.isLoading = false
    }
  }
</script>

<style>
  @media (prefers-color-scheme: dark) {
    .gosqas-link {
      color: #CCECFD; 
    }
  }
  @media (prefers-color-scheme: light) {
    .gosqas-link {
      color: #4E3681; 
    }
  }
</style>
  