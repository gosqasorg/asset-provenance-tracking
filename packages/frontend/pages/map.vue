<!-- 
TODO: Find a better way to upload the geoJSON to frontend / mapbox
TODO: Add  states (error, loading) for mapbox section
TODO: Add Ranges 30, 60, 90 potentially. Unsure since the data only goes back 4 months and a smaller ranger isnt super impactful looking
BUG: some countries in India are undefined
-->

<template>
    <div class="map-page">
        <div class="map-page-header">
            <div>
              <h1>Requests by Geography</h1>
              <p>Click a country to see info in more details</p>
            </div>

            <div>
              <!-- Add summary range -->
            </div>
        </div>
        
        <!-- TODO: Map Section -->
        <div class="map-info">
          
          <div id="map-box">
            <button v-if="selectedPlace.level !== 'world'" id="reset-btn" @click="resetView">Back to World View</button>
            <div  id="map" ref="mapEl"></div>
          </div>

          <!-- TODO: Stats Section -->
          <div id="stat-box"> 
              <!--  Adds a >[Location] when specific location is clicked -->
              <p>World Data</p> 
              <div v-if="loading">Loading stats...</div>
              <div v-else>
                  
                <h2>{{ selectedStats.name }}</h2>
                  <!-- Row for  # of requests, avg response, succeeded %-->
                  <div class="summary-row">
                    <div class="summary-pill">
                      <span class="pill-num">{{ selectedStats?.requests }}</span>
                      <span class="pill-label">Requests</span>
                    </div>
                    <div class="summary-pill">
                      <span class="pill-num">{{ avgResponse.toFixed(2) }} ms</span>
                      <span class="pill-label">Avg Response</span>
                    </div>
                    <div class="summary-pill">
                      <span v-if="selectedStats?.requests" class="pill-num">{{ ((selectedStats.requests - selectedStats.failed) / selectedStats.requests * 100).toFixed(2)}}%</span>
                      <span v-else class="pill-num">-</span>
                      <span class="pill-label">Succeeded</span>
                    </div>
                    <div class="summary-pill">
                      <span  v-if="selectedStats?.requests" class="pill-num">{{ (selectedStats?.requests / worldStats.requests * 100).toFixed(2) }}%</span>
                      <span v-else class="pill-num">--%</span>
                      <span class="pill-label">of Traffic Total</span>
                    </div>
                  </div> 

              
                  <!-- <div>
                      <p>Portion of Traffic: {{ selectedStats?.requests / worldStats.requests * 100 }}</p>
                  </div> 
                  -->
                  <div class="city-section">
                      <!-- Top Cities Section -->
                      <p>TOP {{ selectedPlace.level === 'world' ? 'COUNTRIES' : selectedPlace.level === 'country' ? 'STATES / PROVINCES' : 'CITIES' }}</p>
                      <ul v-if="topPlaces.length">
                        <li v-for="p in topPlaces" :key="p.name">{{ p.name }} {{ p.requests }}</li>
                      </ul>
                  </div>
              </div>
                
              <!-- for testing -->
              <p v-if="selectedStats">{{ selectedStats }}</p>
              <p v-else>None selected</p>
            </div>
          </div>   
    </div>
</template>

<script lang="ts">
import { markRaw } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getCityStats, getCountryStats, getStateStats } from '~/services/azureFuncs'
import countryBounds from '../data_viz/files/country-bounds.json';

let map: mapboxgl.Map | null = null
let resize: ResizeObserver | null = null

const LOW = '#33332D';
const HIGH = '#BFE4F3';

type CountryStat = Record<string, { name: string; requests: number; failed: number }>;
type StateStat = Record<string, { name: string; requests: number; failed: number }>;
type SelectionType = {level: 'world'} | {level: 'country' | 'state'; key: string; name: string}

type CountryBounds = Record<string, { name: string; bounds: number[][] }>;
const BOUNDS = countryBounds as CountryBounds


export default {

  data() {
    return {
      countryData: {} as Record<string, any>,
      stateData: {} as Record<string, any>,
      cityData: {} as Record<string, any>,
      selectedPlace: { level: 'world'} as SelectionType ,
      loading: true 
    }
  },
  computed: {
    selectedStats(): {requests: number; failed: number} | null {
      // for each selected place return the data that matches its key
      const s = this.selectedPlace

      if (s.level === 'state') {
        return this.stateData[s.key] ?? { name: s.name, requests: 0, failed: 0, responseTime: 0 }
      }

      if (s.level === 'country') {
        return this.countryData[s.key] ?? { name: s.name, requests: 0, failed: 0, responseTime: 0 }
      }

      return this.worldStats
    },

    worldStats() {
      const worldData = { name: 'World', requests: 0, failed: 0, responseTime: 0}
      for (const country of Object.values(this.countryData ?? {})){
        worldData.requests += country.requests
        worldData.failed += country.failed
        worldData.responseTime += country.responseTime
      }

      return worldData
    },

    topPlaces() {
      const s = this.selectedPlace

      // filter state data by country iso and grab top 5 states/provinces
      if (s.level === 'country') {
        let list = Object.values(this.stateData ?? {})
        return list.filter(st => st.iso === s.key)
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 5)
      }
      
      // filter city data by stateKey and grab top 5 citys
      if (s.level === 'state') {
        let list = Object.values(this.cityData ?? {})
        return list.filter(c => c.stateKey === s.key)
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 5)
      }

      // if neither country or state return top places as countries
      return Object.values(this.countryData ?? {}).sort((a, b) => b.requests - a.requests).slice(0, 5)

    },

    avgResponse() {
      const s = this.selectedStats
      return s.requests ? s.responseTime / s.requests : 0
    },

  },

  mounted() {
    const el = this.$refs.mapEl as HTMLDivElement | undefined
    if (!el) return

    // fetch data - statistics, countryGEOJSON, stateGEOJSON
    const dataPromise = this.fetchData()
    const countryPromise =  fetch('https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson')
    .then(res => res.json())

    const statePromise =  fetch('https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_1_states_provinces.geojson')
    .then(res => res.json())

    mapboxgl.accessToken = this.$config.public.mapboxToken
    const m = markRaw(new mapboxgl.Map({
      container: el,
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
    resize = new ResizeObserver(() => m.resize())
    resize.observe(el)

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
      // if (codes.length === 0) return;

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
          'fill-color': codes.length
          ? [
            'match', ['get', 'ISO_A2_EH'],
            codes,
            ['interpolate', ['linear'],
              ['match', ['get', 'ISO_A2_EH'], ...logValues, minLog],
              minLog, LOW,
              maxLog > minLog ? maxLog : minLog + 1, HIGH],
            '#262622',
            ]
          : '#262622',
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
          'fill-color': stateKeys.length 
          ? [
            'match', stateKey,
            stateKeys,
            ['interpolate', ['linear'],
              ['match', stateKey, ...slogValues, sminLog],
              sminLog, LOW,
              smaxLog > sminLog ? smaxLog : sminLog + 1, HIGH],
            '#262622',
            ]
          : '#262622',
          'fill-opacity': [
            'interpolate', ['linear'], ['zoom'],
            2.5, 0,  
            3, 1
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
          'line-width': 1.5 }
      })

      m.addLayer({ 
        id: 'state-selected', 
        type: 'line', 
        source: 'states', 
        filter: ['==', ['get', 'iso_3166_2'], ''],  
        paint: { 
          'line-color': '#ffffff', 
          'line-width': 2, 
          'line-opacity': 0.8 } 
      })

      const STATE_VISIBLE_ZOOM = 3
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

            popup.setLngLat(e.lngLat)
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
      // TODO: Don't Trigger when user clicks a state - but center to state??? 
      m.addControl(new mapboxgl.NavigationControl({showCompass: false}));

      m.on('click', 'countries-fill', (e) => {
        m.getCanvas().style.cursor = 'pointer';

        if (e.features && e.features.length > 0) {
          const country = e.features[0]
          const isoCode = country?.properties.ISO_A2_EH as string
          
          const result = BOUNDS[isoCode]

          // check if area has a state-fill
          const state = m.getLayer('states-fill') 
          ? m.queryRenderedFeatures(e.point, { layers: ['states-fill']})[0]
          : undefined;

          // check if at statelevel zoom and if a state is available
          const showState = !!state && m.getZoom() >= STATE_VISIBLE_ZOOM;

          if (result && !showState) {
            m.fitBounds(result.bounds, {
              padding: 50,      
              duration: 2000   
            });
          } else {
            let long = (state?.properties.longitude)
            let lat = (state?.properties.latitude)
            console.log(result?.bounds)
            m.flyTo({
              center: [long, lat],
              duration: 1500
            })
          }

          
          

          
          // if states are visible and available, the selectedPlace is a state
          if (showState) {
            const name = state!.properties.gn_name;
            this.selectedPlace = { level: 'state', key: `${state!.properties.iso_a2}|${String(name).toLowerCase()}`,name}
            m.setFilter('state-selected', ['==', ['get', 'iso_3166_2'], showState ? state!.properties!.iso_3166_2 : '']);
            map?.setFilter('country-selected', ['==', ['get', 'ISO_A2_EH'], '']);
          } else {
            m.setFilter('country-selected', ['==', ['get', 'ISO_A2_EH'], country?.properties.ISO_A2_EH]);
            this.selectedPlace = { level: 'country', key: country?.properties.ISO_A2_EH, name: country?.properties.NAME}
            map?.setFilter('state-selected', ['==', ['get', 'ISO_A2_EH'], '']);
          }

          
        }
      })

      // reset view when user clicks outside a country
      m.on('click', (e) => {
        const hit = m.queryRenderedFeatures(e.point, { layers: ['countries-fill'] });
        if (hit.length === 0) this.resetView();    
        // this.selectedPlace = { level: 'world'}
      })

    });

  },

  beforeUnmount() {
    resize?.disconnect()
    map?.remove()
    map = null
  },

  methods: {
    async fetchData(): Promise<{countries: CountryStat | null, states: StateStat | null}> {
      // TODO: add filtering and state management
      try {
        // const [countries, states, cities] = await Promise.all([getCountryStats(), getStateStats(), getCityStats()])
        const [countries, states, cities] = [undefined, undefined, undefined]
        // console.log(states)
        this.countryData = countries ?? {}
        this.stateData = states ?? {}
        this.cityData = cities ?? {}

        return {countries: this.countryData, states: this.stateData}

      } catch (err) {
        this.$snackbar.add({
            type: 'error',
            text: 'Failed to fetch data error: ' + err
        });
        return {countries: {}, states: {}}
      } finally {
        this.loading = false
      }
    },
    resetView() {
      map?.setFilter('country-selected', ['==', ['get', 'ISO_A2_EH'], '']);
      map?.setFilter('state-selected', ['==', ['get', 'ISO_A2_EH'], '']);
      map?.flyTo({ center: [0, 20], zoom: 0.75, duration: 1000});
      this.selectedPlace = { level: 'world'}
    }


    // 
  },
};

</script>


<style scoped>
  p, li {
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
    
  .map-page {
    font-size: 18px;
    background-color: #262820;
    height: 80vh;
    width: 100%;
    padding: 22px 24px;
    border: #353535 solid 1px;
    border-radius: 15px;
    margin: 32px 13.5px;
  }

  .map-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 60vh;
    gap: 18px
  }

  #map-box {
    border: #353535 solid 1px;
    border-radius: 15px;
    position: relative;
    height: 100%;
    min-width: 0;
    overflow: hidden; 
  }

  #map {
    position: absolute;
    inset: 0;
  }

  #reset-btn {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;

    background: #4e3681;
    border: 2px solid #4e3681;
    border-radius: 5px;
    color: #fff;
    padding: 10px 20px;
  }

  #stat-box {
    overflow-y: auto;
    min-height: 0;
  }

  h1, h2 {
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

  .summary-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    /* flex-wrap: wrap;
    width: 100%; */
    /* width: 100%; */
    flex: 1;
    padding-bottom: 15px;
  }

  .summary-row .summary-pill:nth-child(4) {
    grid-column: span 3;
    width: 100%
  }

  .summary-pill {
    background: rgba(204,204,204,.24);
    display: flex;
    flex-direction: column;
    /* flex: 1; */
    border: 1px solid rgba(204,204,204,.24);
    border-radius: 10px;
    padding: 15px 10px;
    gap:5 px
  }

  .pill-num {
    font-size: 24px;
    line-height: 1.2;
    color: #1E2019;
    font-weight: 600;
  }

  .pill-label {
    font-size: 15px;
    font-weight: 600;
    line-height: 30px;
    color: rgba(30,32,25,.55);
    /* text-transform: upp ercase; */
    letter-spacing: 2px;
  }

  .city-section {
    font-size: 14px
  }

  .city-section > p {
    font-weight: bold;
  }

  @media (prefers-color-scheme: dark) {
    h1, h2 {
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

    .city-section {
      color: rgba(255,255,255,.55)
    }


  }

  /* Mobile */
  @media (max-width: 768px) {
    .map-page {
      gap: 30px;
      padding: 20px 30px 0px 30px;
      width: 100%;
      margin: 32px 13.5px;
    }

    h1, h2 {
      font-size: 32px;
      font-weight: 600;
      line-height: 50px;
    }

    p {
      font-size: 18px;
      line-height: 27px;
    }

    #reset-btn {
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

    .map-info {
      flex-direction: column;
      gap: 18px
    }

  }

</style>


