<template>
  <div class="stat-page">
    <div class="stat-header">
      <div class="stat-header-text"> 
        <h1>User Agents Breakdown</h1>
        <!-- Azure only seems to keep the last 90 days of AppRquests data on default -->
        <p>Classification of incoming requests by client type from the last 90 days</p>
      </div>
      <!-- hook up to refresh for data -->
      <button @click="fetchData" :disabled="loading" class="btn">{{loading ? 'Loading...' : 'Refresh'}}</button>
    </div>
    <!-- stat summaries -->
     <div class="summary-row">
      <div class="summary-pill">
        <span class="pill-num">{{totals ? totals.all?.toLocaleString() : 0}}</span>
        <span class="pill-label">Total Requests</span>
      </div>
      <div class="summary-pill">
        <span class="pill-num">{{totals ? totals.browsers?.toLocaleString() : 0}}</span>
        <span class="pill-label">Browsers</span>
      </div>
      <div class="summary-pill">
        <span class="pill-num">{{totals ? totals.bots?.toLocaleString() : 0}}</span>
        <span class="pill-label">Bots</span>
      </div>
      <div class="summary-pill">
        <span class="pill-num">{{totals ? totals.tools?.toLocaleString() : 0}}</span>
        <span class="pill-label">Tools</span>
      </div>
     </div>

    <!-- charts -->
    <div class="charts-row">
        <div class="chart-card">
          <h3>Browsers</h3>
          <!-- Broswer Graph -->
           <div class="canvas-wrap"><canvas ref="browserCanvas"></canvas></div>
            <ul class ="chart-legend">
              <li v-for="item in chartLegends.browsers" :key="item.label" class="legend-item">
                <span class="legend-left">
                  <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
                  <span>{{ item.label }}</span>
                </span>
                <span class="legend-percent">{{ item.percent }}</span>
              </li>
            </ul>
          </div>
        <div class="chart-card">
          <h3>Bots</h3>
          <!-- Bots Graph -->
           <div class="canvas-wrap"><canvas ref="botsCanvas"></canvas></div>
          <ul class ="chart-legend">
              <li v-for="item in chartLegends.bots" :key="item.label" class="legend-item">
                <span class="legend-left">
                  <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
                  <span>{{ item.label }}</span>
                </span>
                <span class="legend-percent">{{ item.percent }}</span>
              </li>
            </ul>
          </div>
        <div class="chart-card">
          <h3>Tools</h3>
          <!-- Tools Graph -->
           <div class="canvas-wrap"><canvas ref="toolsCanvas"></canvas></div>
          <ul class ="chart-legend">
              <li v-for="item in chartLegends.tools" :key="item.label" class="legend-item">
                <span class="legend-left">
                  <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
                  <span>{{ item.label }}</span>
                </span>
                <span class="legend-percent">{{ item.percent }}</span>
              </li>
            </ul>
          </div>
    </div>

  </div>
</template>

<script lang="ts">

import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);


// split into browser / bot / tool buckets
const BROWSER_KEYS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Internet Explorer', 'DuckDuckGo'];
const BOT_KEYS = ['ClaudeBot', 'Googlebot', 'Bingbot', 'Baiduspider']
const TOOL_KEYS = ['curl', 'Node', 'Python', '.NET', 'Unknown', 'Other']

export default {
  data() {
    return {
      loading: false,
      error: null as string | null,
      rawData: null as any[] | null,
      browserChart: null as Chart<'doughnut', number[], string> | null,
      // dict of chart instances so we can destroy them when re-rendering
      charts: {} as Record<string, Chart<'doughnut', number[], string>>,
      totals: null as Record<string, number> | null,
      chartLegends: { 
        browsers: [],
        bots: [],
        tools: []
      } as Record<string, {label: string, color: string, percent: string}[]>
    }
  },

  mounted() {
    this.fetchData()
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

        // split data into its buckets, assuming there is data. 
        const map = Object.fromEntries(this.rawData!.map((item: any) => [item[0], item[1]]))
        const browserMap = Object.fromEntries(BROWSER_KEYS.map(key => [key, map[key] ?? 0])) // If not data found for key, return 0
        const botsMap = Object.fromEntries(BOT_KEYS.map(key => [key, map[key] ?? 0]))
        const toolsMap = Object.fromEntries(TOOL_KEYS.map(key => [key, map[key] ?? 0]))

        // sumarry
        this.totals = {
          browsers: Object.values(browserMap).reduce((a, b) => a + b, 0),
          bots: Object.values(botsMap).reduce((a, b) => a + b, 0),
          tools: Object.values(toolsMap).reduce((a, b) => a + b, 0),
          all: this.rawData!.reduce((a, r) => a + r[1], 0),
        }
        // render charts! wait for vue to paint the canvas before chart.js can render
        await this.$nextTick()
        
        this.buildChart(this.$refs.browserCanvas as HTMLCanvasElement, 'browsers', browserMap);
        this.buildChart(this.$refs.botsCanvas as HTMLCanvasElement, 'bots', botsMap);
        this.buildChart(this.$refs.toolsCanvas as HTMLCanvasElement, 'tools', toolsMap);

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
    buildChart(canvas: HTMLCanvasElement, label: string, dataMap: Record<string, number>) {
      const colors = ['#4E3081', '#CCE6F0', '#8C72C9', '#6FA3B8', '#B9A6DE', '#6B6F76', '#A3785E']

      // grab only the entries with non-zero values
      const entries = Object.entries(dataMap).filter(([, count]) => count > 0)
      
      // calc total for percent display and add it to the legend
      const total = entries.reduce((sum, [, count]) => sum + count, 0)
      this.chartLegends[label] = entries.map(([key,count], idx) => ({
        label: key,
        color: colors[idx] ?? '#fff',
        percent: ((count / total) * 100).toFixed(1) + '%',
      }))
      if (!entries.length) return
      
      // destroy the old chart, then create a new one
      if (this.charts[label]) this.charts[label].destroy()
      this.charts[label] = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: entries.map(([key]) => key),
          datasets: [{
            data: entries.map(([, count]) => count),
            backgroundColor: colors,
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          cutout: '65%',
          layout: {
            padding: 10,
          }
        }
      })
    },

  },




}

</script>

<style scoped>

.stat-page {
  font-size: 18px;
  color: #1e2019;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px 126px 0px 126px;
  /* margin: 30px; */
  width: 100%;
  margin: 32px 13.5px;
}

h1 {
  font-size: 48px;
  font-weight: 600;
  line-height: 72px;
  color: #4E3681;
}

p {
  font-size: 20px;
  line-height: 30px;
  color: #1E2019;
  margin: 0;
}

.btn {
  background: #4e3681;
  border: 2px solid #4e3681;
  color: #fff;
  padding: 10px 20px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.stat-header-text {
  display: flex;
  flex-direction: column;
}

.summary-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  width: 100%;
}

.summary-pill, .chart-card {
  background: rgba(204,204,204,.24);
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid rgba(204,204,204,.24);
  border-radius: 10px;
  padding: 22px 24px;
  gap: 10px
}

.pill-num {
  font-size: 30px;
  line-height: 1.2;
  color: #1E2019;
  font-weight: 600;
}

.pill-label {
  font-size: 20px;
  font-weight: 600;
  line-height: 30px;
  color: rgba(30,32,25,.55);
  text-transform: uppercase;
  letter-spacing: 2px;
}

h3 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  color: #4E3681;
}


.canvas-wrap {
  position: relative;
  width: 100%;
  margin: 0 auto;
}

.charts-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-legend {
  list-style: none;
  padding: 0;
  margin: 15px 0 0;
}

.legend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0; 
  font-size: 20px;
  line-height: 30px;
  color: #1E2019;
}

.legend-item span {
  font-size: 20px;
  line-height: 30px;
}

.legend-left  { 
  display: flex; 
  align-items: center; 
  gap: 6px; 
}

.legend-dot   { 
  width: 10px; 
  height: 10px; 
  border-radius: 50%; 
  flex-shrink: 0; 
}

.legend-percent {
  font-size: 20px;
  line-height: 30px;
  color: rgba(30,32,25,.55);
}

@media (prefers-color-scheme: dark) {
  h1 {
    color: #CCECFD
  }

  p {
    color: #FFFFFF
  }
  
  .stat-page {
    color: #ffffff;
  }

  .summary-pill, .chart-card {
    background: #262820;
    border: 1px solid #353535;
  }

  .pill-num {
    color: #FFFFFF;
  }

  .pill-label {
    color: rgba(255,255,255,.55)
  }

  h3 {
    color: #CCECFD;
  }

  .legend-item {
    color: rgba(255,255,255,.85);
  }


  .legend-percent {

    color: rgba(255,255,255,.55);
  }


  /* Mobile */
  @media (max-width: 768px) {
    .stat-page {
      gap: 30px;
      padding: 20px 30px 0px 30px;
      width: 100%;
      margin: 32px 13.5px;
    }

    h1 {
      font-size: 32px;
      font-weight: 600;
      line-height: 50px;
    }

    p {
      font-size: 18px;
      line-height: 27px;
    }

    .btn {
      padding: 14px 18px;
    }

    .stat-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 20px
    }

    .summary-row {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      justify-content: space-evenly;
    }


    .pill-num {
      font-size: 26px;
    }

    .pill-label {
      font-size: 16px;
      font-weight: 500;
      line-height: 25px;
      letter-spacing: 0px;
    }

    h3 {
      font-size: 20px;
    }

    .charts-row {
      flex-direction: column;
    }


    .legend-item {
      padding: 5px 0; 
      font-size: 16px;
    }

    .legend-item span {
      font-size: 16px;
    }


    .legend-percent {
      font-size: 16px;
    }

  }

}
</style>