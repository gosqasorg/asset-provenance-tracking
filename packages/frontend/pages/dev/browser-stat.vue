<template>
  <div class="stat-page">
    <div class="stat-header">
      <h2>Breakdown of data</h2>
      <!-- hook up to refresh for data -->
      <button>Refresh Data</button>
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

  </div>
</template>

<script setup>

// fetch data from stats/browsers endpoint
// split into browser / bot / tool buckets
// render each bucket as a doughnut chart with chart.js

const browserCanvas = ref(null)

</script>