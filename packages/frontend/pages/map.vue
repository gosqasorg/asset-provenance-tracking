<!-- Centralize the data the map uses by moving it all to one file. 
At the top of this file, create a json object that stores as key-value pairs the "variable name as used by the map at present" as the key, 
with "the variable containing the data" as the value.
Set the map to reference this data object. -->

<!-- 
TODO: FInd a better way to upload the geoJSON to frontend / mapbox
TODO: Add  states (error, loading) for mapbox section
TODO: Outline logic for Additional Stats Section
-->

<template>
    <div class="map-page">
        <div class="map-page-header">
            <h1>Requests by Geography</h1>
            <p>Instructions or description to go here</p>
        </div>
        
        <!-- TODO: Map Section -->
        <button id="reset-btn" @click="resetView">Back to World View</button>

        <div>
          <div id="map" style="width: 800px; height: 600px;"></div>
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
                <p>Country: {{  }}</p>
                <p>State: {{  }}</p>
                <p>Requests: {{  }}</p>
                <p>Succeeded Rate: {{  }}</p>

                <p>Avg Response: {{  }}</p>
            </div>
            <div>
                <!-- Row for % of total requests -->
                <p>Portion of Traffic: {{  }}</p>
            </div>
            <div>
                <!-- Line Graph for requests per day -->
            </div>
            <div>
                <!-- Top Cities Section -->
                <p>Cities in {{  }} </p>
                <p>List of the cities: {{  }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue'
import mapboxgl, { MapMouseEvent } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getCountryStats, getStateStats } from '~/services/azureFuncs'
import countryBounds from '../data_viz/files/country-bounds.json';


let map: mapboxgl.Map | null = null

const LOW = '#33332D';
const HIGH = '#BFE4F3';
const WORLDVIEW = 'US';

type CountryStat = Record<string, { name: string; requests: number; failed: number }>;
type StateStat = Record<string, { name: string; requests: number; failed: number }>;

type CountryBounds = Record<string, { name: string; bounds: number[][] }>;
const BOUNDS = countryBounds as CountryBounds


export default {

  data() {
    return {
      rawData: null as any[] | null    }
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
      center: [0, 0],
      zoom: 0.75,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      maxZoom: 7,
      minZoom: 0.75,
    }));

    map = m;

    const popup = new mapboxgl.Popup({
      className: 'map-popup',
      closeButton: false,
      closeOnClick: false,
      offset: [0, -20],      
    })

    m.on('load', async () => {
      const [stats, countriesGeo] = await Promise.all([dataPromise, countryPromise]);

      // TODO: repeat code, turn into function
      // get statistics
      const countries: CountryStat  = stats.countries as CountryStat;
      const statesRequests: StateStat = stats.states as StateStat;
      
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
      // console.log(stateKeys)
      // console.log(stats.states)
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
      // take log of requests so color scale is less skewed
      const stateLog = (key: string) => Math.log10((stats.states as StateStat)[key]!.requests + 1);
      const sLogs = stateKeys.map(stateLog);
      const sminLog = Math.min(...sLogs);
      const smaxLog = Math.max(...sLogs);

      // map city to its log val
      const slogValues = stateKeys.flatMap(key => [key, stateLog(key)]);
      const stateKey = ['concat', ['get', 'iso_a2'], '|', ['downcase', ['get', 'gn_name']]]
    
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
      

      // hover outline layers
      // idea is to filter show for matching countries/states using iso code of hovered area
      m.addLayer({ 
        id: 'country-hover', 
        type: 'line', 
        source: 'country-boundaries', 
        filter: ['==', ['get', 'ISO_A2_EH'], ''],  
        paint: { 
          'line-color': '#ffffff', 
          'line-width': 2, 
          'line-opacity': 0.8 } 
        })

      m.addLayer({ 
      id: 'country-selected', 
      type: 'line', 
      source: 'country-boundaries', 
      filter: ['==', ['get', 'ISO_A2_EH'], ''],  
      paint: { 
        'line-color': '#ffffff', 
        'line-width': 2, 
        'line-opacity': 0.8 } 
      })

        m.addLayer({
        id: 'state-hover',
        type: 'line',
        source: 'states',
        filter: ['==', ['get', 'iso_3166_2'], ''],
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.5,
        },
      })

      const STATE_VISIBLE_ZOOM = 3.5
      m.on('mousemove', 'countries-fill', (e) => {
          m.getCanvas().style.cursor = 'pointer';

          // enable popup on hover over country, name and number of requests
          // state level - theory, use the zoom level to determine if we can see states- 
          // and if theres a state use that info instead of country

          if (e.features && e.features.length > 0) {
            const country = e.features[0]

            // check if area has a state-fill
            const state = m.getLayer('states-fill') 
            ? m.queryRenderedFeatures(e.point, { layers: ['states-fill']})[0]
            : undefined;

            // check if at statelevel zoom and if a state is available
            const showState = !!state && m.getZoom() >= STATE_VISIBLE_ZOOM;

            // console.log(` Country Features: ${JSON.stringify(country?.properties, null, 2)}`)
            // console.log(` State Features: ${JSON.stringify(state?.properties, null, 2)}`)


            // enable highlight on countries
            // const isCountry = country.layer.id === 'countries-fill';
            m.setFilter('country-hover', ['==', ['get', 'ISO_A2_EH'], showState ? '' : country.properties!.ISO_A2_EH]);
            m.setFilter('state-hover', ['==', ['get', 'iso_3166_2'], showState ? state!.properties!.iso_3166_2 : '']);
            
            const countryKey = country.properties.ISO_A2_EH;
            const stateKey = showState 
            ? `${state!.properties!.iso_a2}|${String(state!.properties!.gn_name).toLowerCase()}`
            : '';

            const name = showState ? state!.properties!.gn_name : country.properties.NAME
            const stats = showState ? statesRequests[stateKey] : countries[countryKey]
            const value = stats ? `${stats!.requests} requests`  : 'No requests yet'


            // const { NAME, ISO_A2_EH } = hovered.properties;
            // const value = countries.hasOwnProperty(ISO_A2_EH) 
            // ? `${countries[ISO_A2_EH]!.requests} requests ` 
            // : 'No requests yet'

            popup
                .setLngLat(e.lngLat)
                .setHTML(`<div class="map-popup-name">${name}</div><div class="map-popup-val">${value}</div>`)
                .addTo(m);
          
          }

          
      });

      m.on('mouseleave', 'countries-fill', () => {
          m.getCanvas().style.cursor = '';
          m.setFilter('country-hover', ['==', ['get', 'ISO_A2_EH'], '']);
          if (m.getLayer('state-hover')) m.setFilter('state-hover', ['==', ['get', 'iso_3166_2'], '']);
          popup.remove();
      });

      // Zoom Functionality 
      m.on('click', 'countries-fill', (e) => {
        m.getCanvas().style.cursor = 'pointer';

        if (e.features && e.features.length > 0) {
          const country = e.features[0]
          const isoCode = country?.properties.ISO_A2_EH as string
          console.log(isoCode)
          const result = BOUNDS[isoCode]

          if (result) {
            m.fitBounds(result.bounds, {
              padding: 50,      
              duration: 2000   
            });
          } else {
            console.log("Country code not found")
          }

          m.setFilter('country-selected', ['==', ['get', 'ISO_A2_EH'], country?.properties.ISO_A2_EH]);

          
        }
      })

      // reset view when user clicks outside a country
      m.on('click', (e) => {
        const hit = m.queryRenderedFeatures(e.point, { layers: ['countries-fill'] });
        if (hit.length === 0) this.resetView();    
      })

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
        // console.log(states)
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
    resetView() {
      map.setFilter('country-selected', ['==', ['get', 'ISO_A2_EH'], '']);
      map.flyTo({ center: [0, 20], zoom: 0.75, duration: 1000});
    }


    // 
  },
};

</script>


<style scoped>
  p {
    color: #FFFFFF
  }

  :deep(.map-popup .mapboxgl-popup-content) {
    background: #14140f;
    border: 1px solid #45453c;
    border-radius: 6px;
    padding: 8px 10px;
    white-space: nowrap;
    pointer-events: none;
  }

    :deep(.map-popup .map-popup-name) { font-size: 12px; font-weight: 500; color: #9a9a93; }
    :deep(.map-popup .map-popup-val)  { font-size: 12px; font-weight: 600; color: #f0f0ea; }

    :deep(.map-popup.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip) { border-bottom-color: #14140f; }
    :deep(.map-popup.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip) { border-bottom-color: #14140f; }
    :deep(.map-popup.mapboxgl-popup-anchor-top .mapboxgl-popup-tip) { border-bottom-color: #14140f; }

    :deep(.map-popup.mapboxgl-popup-anchor-right .mapboxgl-popup-tip) { border-left-color: #14140f; }
    :deep(.map-popup.mapboxgl-popup-anchor-left .mapboxgl-popup-tip) { border-right-color: #14140f; }

    :deep(.map-popup.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip) { border-top-color: #14140f; }
    :deep(.map-popup.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip) { border-top-color: #14140f; }
    :deep(.map-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip) { border-top-color: #14140f; }
    
</style>


