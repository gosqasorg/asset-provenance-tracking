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

  </div>
</template>

<script lang="ts">

// fetch data from stats/browsers endpoint
// split into browser / bot / tool buckets
// render each bucket as a doughnut chart with chart.js

export default {
  data() {
    return {
      loading: false,
      error: null as string | null,
      rawData: null as any[] | null
    }
  },

  methods: {
    async fetchData() {
      // fetch data from stats/browsers endpoint
      this.loading = true

      try {
        const baseUrl = useRuntimeConfig().public.baseUrl
        const res = await fetch(baseUrl + '/stats/browsers')
        this.rawData = await res.json()
      } catch (e) {
        this.$snackbar.add({
            type: 'error',
            text: 'Failed to fetch data'
        });
      } finally {
        this.loading = false
      }
    }
  }
}



</script>