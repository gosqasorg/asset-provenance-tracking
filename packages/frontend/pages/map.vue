<!-- Centralize the data the map uses by moving it all to one file. 
At the top of this file, create a json object that stores as key-value pairs the "variable name as used by the map at present" as the key, 
with "the variable containing the data" as the value.
Set the map to reference this data object. -->


<template>
    <div class="map-page">
        <div class="map-page-header">
            <h1>Requests by Geography</h1>
            <p>Instructions or description to go here</p>
        </div>
        
        <!-- TODO: Map Section -->
        <div>
          <div id="map" style="width: 800px; height: 600px;"></div>
          <!-- <div ref="mapEl" class="world-map" /> -->
        </div>

        <!-- TODO: Stats Section -->
        <div> 
             <!--  Adds a >[Location] when specific location is clicked -->
             <p>World</p> 
             <h2>Whole Network</h2>
             <p>{{ rawData?.length }}</p>
             <p>{{ rawData }}</p>
            <div>
                <!-- Row for  # of requests, avg response, succeeded %-->
            </div>
            <div>
                <!-- Row for % of total requests -->
            </div>
            <div>
                <!-- Line Graph for requests per day -->
            </div>
            <div>
                <!-- Top Cities Section -->
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getRequestStats } from '~/services/azureFuncs'

let map: mapboxgl.Map | null = null

const LOW = '#33332D';
const HIGH = '#BFE4F3';
const WORLDVIEW = 'US';

export default {

  data() {
    return {
      rawData: null as any[] | null,   
    }
  },

  mounted() {

    mapboxgl.accessToken = this.$config.public.mapboxToken

    const dataPromise = this.fetchData();

    const m = markRaw(new mapboxgl.Map({
      container: 'map',
      center: [0, 0],
      zoom: 0.75,
      style: 'mapbox://styles/mapbox/dark-v11',
      dragRotate: false,
      pitchWithRotate: false,
      maxZoom: 7,
      minZoom: 0.75,
    }));

    map = m;

    m.on('load', async () => {
      // get statistics
      const stats: Record<string, { requests: number }> = await dataPromise;
      const codes = Object.keys(stats);
      if (codes.length === 0) return;

      // take log of requests so color scale is less skewed
      const logOf = (c: string) => Math.log10(stats[c]!.requests + 1);
      const logs = codes.map(logOf);
      const minLog = Math.min(...logs);
      const maxLog = Math.max(...logs);
      console.log(logs)

      // map country to to its log val
      const logValues = codes.flatMap(code => [code, logOf(code)]);
      console.log(logValues)


      m.addSource('country-boundaries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
      });

      const worldviewFilter: mapboxgl.FilterSpecification = [
        'any',
        ['==', 'all', ['get', 'worldview']],
        ['in', 'US', ['get', 'worldview']],
      ];

      // fill each country based on the number of requests using the minLog and maxlog as the range
      m.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'country-boundaries',
        'source-layer': 'country_boundaries',
        filter: worldviewFilter,
        paint: {
          'fill-color': [
            'interpolate', ['linear'],
            ['match', ['get', 'iso_3166_1'], ...logValues, minLog],
            minLog, '#33332D',
            maxLog > minLog ? maxLog : minLog + 1, '#BFE4F3',
          ],
          'fill-opacity': ['match', ['get', 'iso_3166_1'], codes, 0.85, 0],
        },
      });
      
      m.addLayer({
        id: 'countries-outline',
        type: 'line',
        source: 'country-boundaries',
        'source-layer': 'country_boundaries',
        filter: worldviewFilter,
        paint: { 'line-color': '#1c1c1a', 'line-width': 0.4, 'line-opacity': 0.75 },
      });

    });
  },

  beforeUnmount() {
    map?.remove()
    map = null
  },

  methods: {
    async fetchData(): Promise<Record<string, { name: string; requests: number; failed: number }>> {
      // TODO: add filtering and state management
      try {
        const res = await getRequestStats()
        this.rawData = res
        return res as Record<string, { name: string; requests: number; failed: number }>;

      } catch (err) {
        this.$snackbar.add({
            type: 'error',
            text: 'Failed to fetch data error: ' + err
        });
        return {}
      }
    },

    // 
  },
};

</script>


<style scoped>
  p {
    color: #FFFFFF
  }

</style>


