<!-- Centralize the data the map uses by moving it all to one file. 
At the top of this file, create a json object that stores as key-value pairs the "variable name as used by the map at present" as the key, 
with "the variable containing the data" as the value.
Set the map to reference this data object. -->

<!-- 
TODO: FInd a better way to upload the geoJSON to frontend / mapbox
TODO: Add  states (error, loading) for mapbox section
TODO: Add temp tooltip to mapbox (country level and city level)
TODO: Add click and zoom to map
TODO: Outline logic for Additional Stats Section
-->

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
import { getCountryStats, getStateStats } from '~/services/azureFuncs'

let map: mapboxgl.Map | null = null

const LOW = '#33332D';
const HIGH = '#BFE4F3';
const WORLDVIEW = 'US';

type CountryStat = Record<string, { name: string; requests: number; failed: number }>;
type StateStat = Record<string, { name: string; requests: number; failed: number }>;

export default {

  data() {
    return {
      rawData: null as any[] | null,   
    }
  },

  mounted() {

    // fetch data - statistics, countryGEOJSON, stateGEOJSON
    const dataPromise = this.fetchData()
    const countryPromise = fetch('https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson')
    .then(res => res.json())

    const statePromise = fetch('https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_1_states_provinces.geojson')
    .then(res => res.json())

    mapboxgl.accessToken = this.$config.public.mapboxToken
    const m = markRaw(new mapboxgl.Map({
      container: 'map',
      projection: 'mercator',
      style: {
        version: 8,
        sources: {},
        layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#1C1C19' } }],
      },
      center: [0, 20],
      zoom: 1,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      maxZoom: 7,
      minZoom: 0.75,
    }));

    map = m;

    m.on('load', async () => {
      const [stats, countriesGeo] = await Promise.all([dataPromise, countryPromise]);

      // TODO: repeat code, turn into function
      // get statistics
      const countries: CountryStat  = stats.countries as CountryStat;
      const codes = Object.keys(countries);
      if (codes.length === 0) return;

      // take log of requests so color scale is less skewed
      const logOf = (country: string) => Math.log10(countries[country]!.requests + 1);
      const logs = codes.map(logOf);
      const minLog = Math.min(...logs);
      const maxLog = Math.max(...logs);

      // map country to to its log val
      const logValues = codes.flatMap(code => [code, logOf(code)]);


      m.addSource('country-boundaries', {
        type: 'geojson',
        data: countriesGeo
      });

      // COUNTRY-LEVEL
      // fill each country based on the number of requests using the minLog and maxlog as the range
      m.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'country-boundaries',
        paint: {
          'fill-color': [
            'match', ['get', 'ISO_A2_EH'],
            codes,
            ['interpolate', ['linear'],
              ['match', ['get', 'ISO_A2_EH'], ...logValues, minLog],
              minLog, LOW,
              maxLog > minLog ? maxLog : minLog + 1, HIGH],
            '#262622',
          ],
        },
      });

      m.addLayer({
        id: 'countries-outline',
        type: 'line',
        source: 'country-boundaries',
        paint: { 'line-color': '#1c1c1a', 'line-width': 0.4, 'line-opacity': 0.75 },
      });

      // CITY-LEVEL'
      // get state keys
      const stateKeys = Object.keys(stats.states as StateStat);
      console.log(stateKeys)
      console.log(stats.states)
      const statesGeo = await statePromise;

      // use geojson to draw states
      m.addSource('states', {
        type: 'geojson',
        data: statesGeo
      });

      m.addLayer({
        id: 'states-outline',
        type: 'line',
        source: 'states',
        minzoom: 2.5,
        paint: {
          'line-color': '#1c1c1a',
          'line-width': 0.4,
          'line-opacity': ['interpolate',['linear'], ['zoom'], 2.5, 0, 3.5, 0.75]
        },
      })

      // TODO: repeat code, turn into function
      if (stateKeys.length > 0) {
        // take log of requests so color scale is less skewed
        const stateLog = (key: string) => Math.log10((stats.states as StateStat)[key]!.requests + 1);
        const sLogs = stateKeys.map(stateLog);
        const sminLog = Math.min(...sLogs);
        const smaxLog = Math.max(...sLogs);

        // map city to its log val
        const slogValues = stateKeys.flatMap(key => [key, stateLog(key)]);
        const stateKey = ['concat', ['get', 'iso_a2'], '|', ['downcase', ['get', 'name']]]
      
        // fill in state based on requests amount- if no requests color state blank to cover up country-fill
         m.addLayer({
          id: 'states-fill',
          type: 'fill',
          source: 'states',
          minzoom: 2.5,
          paint: {
            'fill-color': [
              'match', stateKey,
              stateKeys,
              ['interpolate', ['linear'],
                ['match', stateKey, ...slogValues, sminLog],
                sminLog, LOW,
                smaxLog > sminLog ? smaxLog : sminLog + 1, HIGH],
              '#262622',
            ],
            'fill-opacity': [
              'interpolate', ['linear'], ['zoom'],
              2.5, 0,  
              3.5, 1
            ],
          },
        }, 'states-outline');
      }
    });

  },

  beforeUnmount() {
    map?.remove()
    map = null
  },

  methods: {
    async fetchData(): Promise<{countries: CountryStat | null, states: StateStat | null}> {
      // TODO: add filtering and state management
      try {
        const countries = await getCountryStats()
        const states = await getStateStats()
        console.log(states)
        this.rawData = states

        return {countries, states}

      } catch (err) {
        this.$snackbar.add({
            type: 'error',
            text: 'Failed to fetch data error: ' + err
        });
        return {countries: null, states: null}
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


