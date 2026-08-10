<template>
  <div class="stat-page">
    <div class="stat-header">
      <h2>Breakdown of data</h2>
      <!-- hook up to refresh for data -->
      <button @click="fetchData" :disabled="loading">{{loading ? 'Loading...' : 'Refresh'}}</button>
    </div>

    <div class="charts-row">
        <div class="chart-card">
          <h3>Browsers</h3>
          <!-- Broswer Graph -->
           <div class="canvas-wrap"><canvas ref="browserCanvas"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>Bots</h3>
          <!-- Bots Graph -->
        </div>
        <div class="chart-card">
          <h3>Scripts</h3>
          <!-- Scripts Graph -->
        </div>
    </div>

    <!-- for testing! -->
    <p>{{ rawData ? rawData.length : 0 }} records found</p>
    <p>{{ rawData }}</p>

  </div>
</template>

<script lang="ts">

import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);


// split into browser / bot / tool buckets
const BROWSER_KEYS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Other'];



export default {
  data() {
    return {
      loading: false,
      error: null as string | null,
      rawData: null as any[] | null,
      browserChart: null as Chart<'doughnut', number[], string> | null,
      // dict of chart instances so we can destroy them when re-rendering
      charts: {} as Record<string, Chart<'doughnut', number[], string>>,
    }
  },

  methods: {
    async fetchData() {
      // fetch data from stats/browsers endpoint
      this.loading = true
      this.error = null

      try {
        const baseUrl = useRuntimeConfig().public.baseUrl
        const res = await fetch(baseUrl + '/stats/browsers')

         const text = await res.text()
        if (!text) throw new Error(`Empty response (status ${res.status})`)

        let rows
        try {
          rows = JSON.parse(text)
        } catch {
          throw new Error(`Server error (status ${res.status}): ${text.slice(0, 200)}`)
        }
        this.rawData = rows

        // split data into its buckets, assuming there is data
        const map = Object.fromEntries(this.rawData!.map((item: any) => [item[0], item[1]]))
        const browserMap = Object.fromEntries(BROWSER_KEYS.map(key => [key, map[key] ?? 0]))
        
        // render charts! wait for vue to paint the canvas before chart.js can render
        await this.$nextTick()
        this.buildChart(this.$refs.browserCanvas as HTMLCanvasElement, 'browsers', browserMap);
      } catch (e) {
        this.error = String(e)
        this.$snackbar.add({
            type: 'error',
            text: 'Failed to fetch data error: ' + this.error
        });
      } finally {
        this.loading = false
      }
    },
    // render each bucket as a doughnut chart with chart.js
    buildChart(canvas : HTMLCanvasElement, label: string, dataMap: Record<string, number>) {
      // grab only the entries with non-zero values
      const entries = Object.entries(dataMap).filter(([, count]) => count > 0)
      if (!entries.length) return
      
      // destroy the old chart, then create a new one
      if (this.charts[label]) this.charts[label].destroy()
      this.charts[label] = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: entries.map(([key]) => key),
          datasets: [{
            data: entries.map(([, count]) => count),
            backgroundColor: ['red', 'blue', 'green', 'purple', 'orange', 'teal'],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
        }
      })
    },

  },



}

</script>

<style scoped>
.canvas-wrap {
  position: relative;
  height: 280px;
}

.chart-card {
  flex:1;
  min-width: 300px;
  border: 1px solid #ccc;
  padding: 1rem;
}

.charts-row {
  display: flex;
  gap: 20px;
}
</style>