<template>
    <div class="map-page">
        <div class="map-page-header">
          <div class="map-page-title">
              <h1>Requests by Geography</h1>
              <p>Click a country, region or city to see request details</p>
          </div>

          <div class="range-buttons">
            <button v-for="d in [30, 90, 365]" :key="d"
            :class="{ active: rangeDays === d }"
            @click="rangeDays = d">
              {{ d === 365 ? '1 yr' : `${d}d` }}
            </button>
          </div>
        </div>
        
        <div class="map-info">

          <div id="map-section">
            <div id="map-box">
              <button v-if="selectedPlace.level !== 'world'" id="reset-btn" @click="resetView">&larr; Back to World View</button>
              <div  id="map" ref="mapEl"></div>
            </div>
            <div class="map-footer">
              <div class="legend">
                <p>Fewer requests</p>
                <div class="legend-bar"></div>
                <p>More requests</p>
              </div>
              
              <div class="country-info">
                
                <p>{{worldStats.count}} countries reached</p>
              </div>
            </div>
          </div>

          <div v-if="loading">Loading stats...</div>
          <div v-else id="stat-section"> 
            <h2>{{ selectedStats?.name === "World" ? "Whole World" : selectedStats?.name }}</h2>
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

            <div class="city-section">
                <!-- Top Cities Section -->
                <p>TOP {{ selectedPlace.level === 'world' ? 'COUNTRIES' : selectedPlace.level === 'country' ? 'STATES / PROVINCES' : 'CITIES' }}</p>
                <ul v-if="topPlaces.length">
                  <li class="city-items" v-for="p in topPlaces" :key="p.name">
                    <p>{{ p.name }}</p> 
                    <p>{{ p.requests }}</p>
                  </li>
                </ul>
                <p v-else style="font-weight: 300;">No {{ selectedPlace.level === 'world' 
                ? 'country' 
                : selectedPlace.level === 'country' 
                ? 'states/provinces' : 'city' }}-level data yet</p>
            </div>
          </div>
        </div>  
        
    </div>
</template>

<script lang="ts">
import { markRaw } from 'vue'
import mapboxgl, { type LngLatBoundsLike } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getCityStats, getCountryStats, getStateStats } from '~/services/azureFuncs'
import rawBounds from '~/data_viz/geo/country-bounds.json';
import rawCoords from '~/data_viz/geo/city-coords.json';

import {fillByStats, radiusByStats, strokeByStats, stateNameOf, filterByRange} from '~/utils/mapUtils'
import type { LocationStats } from '~/utils/mapUtils'

type SelectionType = {level: 'world'} | {level: 'country' | 'state' | 'city'; key: string; name: string}
type CountryProps = {NAME: string, ISO_A2_EH: string}
type StateProps = {name: string, gn_name: string | null, iso_a2: string, iso_3166_2: string, latitude: number, longitude: number}

// Map ColorPalette
const mapColors = {
  dark : {
    low: '#383d3d',
    high: '#BFE4F3',
    background: '#1C1C19',
    selected: '#ffffff',
    noData: 'rgba(0, 0, 0, 0)',
    dot: '#4E3681'
  }, 
  light : {
    low: '#B9B1CA',
    high: '#4E3681',
    background: '#FFFFFF',
    selected: '#1C1C19',
    noData: 'rgba(0, 0, 0, 0)',
    dot: '#BFE4F3'
  }
}
const countryBounds = rawBounds as Record<string, { name: string; bounds: number[][] }>;
const cityCoords = rawCoords as Record<string, number[]>;

// mapBox query expressions
const stateKeyExpression = ['concat', ['get', 'iso_a2'], '|', ['downcase', ['case', 
  ['==', ['get', 'iso_a2'], 'IN'], 
  ['get', 'name'], ['coalesce', ['get', 'gn_name'], ['get', 'name']],
]]]

const STATE_VISIBLE_ZOOM = 3


let map: mapboxgl.Map | null = null
let resize: ResizeObserver | null = null
let currentStyleUrl = ''

export default {

  data() {
    return {
      countryData: {} as Record<string, LocationStats>,
      stateData: {} as Record<string, LocationStats & {iso: string}>,
      cityData: {} as Record<string, LocationStats & {iso: string, stateKey: string}>,
      selectedPlace: { level: 'world'} as SelectionType ,
      loading: true ,

      // for switching colors in the map
      isDark: false,
      darkQuery: null as MediaQueryList | null,
      onModeChange: null as ((e: MediaQueryListEvent) => void) | null,
      dataPromise: null as Promise<void> | null,
      rangeDays : 365 as 30 | 90 | 365  ,
    }
  },
  computed: {
    selectedStats(): {name: string, requests: number; failed: number, responseTime: number} | null {
      // for each selected place return the data that matches its key
      const s = this.selectedPlace
      const locationStats = 
      {
        state: this.filteredStates, 
        country: this.filteredCountry, 
        city: this.filteredCity
      }

      if (s.level === 'world'){
        return this.worldStats
      } 

      return locationStats[s.level]?.[s.key] ??  { name: s.name, requests: 0, failed: 0, responseTime: 0 }
    },

    // get the world stats by summing up all the country stats
    worldStats() {
      const worldData = { name: 'World', count: 0, requests: 0, failed: 0, responseTime: 0}
      for (const country of Object.values(this.filteredCountry ?? {})){
        worldData.count += 1
        worldData.requests += country.requests
        worldData.failed += country.failed
        worldData.responseTime += country.responseTime
      }
      return worldData
    },

    // get the top 5 places based on the selected place level
    topPlaces() {
      const s = this.selectedPlace

      // filter state data by country iso and grab top 5 states/provinces
      if (s.level === 'country') {
        let list = Object.values(this.filteredStates ?? {})
        return list.filter(st => st.iso === s.key)
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 5)
      }
      
      // filter city data by stateKey and grab top 5 citys
      if (s.level === 'state') {
        let list = Object.values(this.filteredCity ?? {})
        return list.filter(c => c.stateKey === s.key)
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 5)
      }

      if (s.level === 'city') {
        return []
      }

      // if neither country or state return top places as countries
      return Object.values(this.filteredCountry ?? {}).sort((a, b) => b.requests - a.requests).slice(0, 5)

    },

    avgResponse() {
      if (!this.selectedStats) return 0
      const s = this.selectedStats
      return s.requests ? s.responseTime / s.requests : 0
    },
    // get palette based on darkmode or lightmode
    palette() {
      return mapColors[this.isDark ? "dark" : "light"]
    },
    filteredCountry() {
      return filterByRange(this.countryData, this.rangeDays) as Record<string, LocationStats>
    },
    filteredStates() {
      return filterByRange(this.stateData, this.rangeDays) as Record<string, LocationStats & {iso: string}>
    },
    filteredCity() {
      return filterByRange(this.cityData, this.rangeDays) as Record<string, LocationStats & {iso: string, stateKey: string}>
    }
  },

  async mounted() {
    // Check if dark mode or light mode
    this.darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.isDark = this.darkQuery.matches
    this.onModeChange = (e: MediaQueryListEvent) => { this.isDark = e.matches }
    this.darkQuery.addEventListener('change', this.onModeChange)

    currentStyleUrl = `mapbox://styles/mapbox/${this.isDark ? 'dark' : 'light'}-v11`

    const el = this.$refs.mapEl as HTMLDivElement | undefined
    if (!el) return

    // fetch data - statistics, countryGEOJSON, stateGEOJSON
    this.dataPromise =  this.fetchData()
  
    mapboxgl.accessToken = this.$config.public.mapboxToken
    const m = markRaw(new mapboxgl.Map({
      container: el,
      projection: 'mercator',
      style: currentStyleUrl,
      center: [0, 20],
      zoom: 0.75,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      maxZoom: 18,
      minZoom: 0.75,
    }));

    map = m;
    if (!map) return
    
    resize = new ResizeObserver(() => m.resize())
    resize.observe(el)

    const popup = new mapboxgl.Popup({
      className: 'map-popup',
      closeButton: false,
      closeOnClick: false,
      offset: [0, -20],      
    })

    const loadLayers = async() => {
      await this.addMapLayers(m)
    }

    if(m.isStyleLoaded()) {
      await loadLayers()
    } else {
      m.on('style.load', async () => {
        await loadLayers();
      });
    }

    m.on('load', async () => {
      m.on('mousemove', 'countries-fill', (e) => {

          // if 
          // if (m.queryRenderedFeatures(e.point, {layers:['cities-dot']})){
          //   return
          // }

          m.getCanvas().style.cursor = 'pointer';

          // enable popup on hover over country, name and number of requests
          // state level - theory, use the zoom level to determine if we can see states- 
          // and if theres a state use that info instead of country

          if (e.features && e.features.length > 0) {
            const country = e.features[0]?.properties as CountryProps

            // check if area has a state-fill
            const state = m.getLayer('states-fill') 
            ? m.queryRenderedFeatures(e.point, { layers: ['states-fill']})[0]?.properties as StateProps
            : undefined;

            const city = m.getLayer('cities-dot') ?
            m.queryRenderedFeatures(e.point, {layers:['cities-dot']})[0]?.properties
            : undefined


            if (city) {
              return
            }

            // check if at statelevel zoom and if a state is available
            const showState = state && m.getZoom() >= STATE_VISIBLE_ZOOM;

            // enable highlight on countries
            m.setFilter('country-hover', ['==', ['get', 'ISO_A2_EH'], showState ? '' : country.ISO_A2_EH]);
            m.setFilter('state-hover', ['==', ['get', 'iso_3166_2'], showState ? state.iso_3166_2 : '']);
            
            const countryKey = country.ISO_A2_EH;
            const stateKey = showState 
            ? `${state.iso_a2}|${String(stateNameOf(state)).toLowerCase()}`
            : '';

            const name = showState ? stateNameOf(state) : country.NAME
            const stats = showState ? this.filteredStates[stateKey] : this.filteredCountry[countryKey]
            const value = stats ? `${stats!.requests} requests`  : 'No requests yet'

            popup.setLngLat(e.lngLat)
            .setHTML(`<div class="map-popup-name">${name}</div><div class="map-popup-val">${value}</div>`)
            .addTo(m);
          
          }

          
      });

      m.on('mousemove', 'cities-dot', (e) => {
        if (e.features && e.features.length > 0) {
          const cityKey = e.features[0].properties.id
          const city = this.filteredCity[cityKey]
          if (!city) return

          const value = city.requests
          const name = city.name

          m.setFilter('cities-hover', ['==', ['get', 'id'], cityKey]);

          if (popup.isOpen()) {
            popup.setLngLat(e.lngLat)
          } else {
            popup.setLngLat(e.lngLat).addTo(m)
          }

          popup
          .setHTML(`<div class="map-popup-name">${name}</div><div class="map-popup-val">${value} requests</div>`);
        }
      });

      m.on('mouseleave', 'countries-fill', () => {
          m.getCanvas().style.cursor = '';
          m.setFilter('country-hover', ['==', ['get', 'ISO_A2_EH'], '']);
          if (m.getLayer('state-hover')) m.setFilter('state-hover', ['==', ['get', 'iso_3166_2'], '']);
          m.setFilter('cities-hover', ['==', ['get', 'id'], '']);

          popup.remove();
      });

      m.on('mouseleave', 'cities-dot', () => {
        m.getCanvas().style.cursor = '';
        m.setFilter('cities-hover', ['==', ['get', 'id'], '']);
        popup.remove();
      });

      // Zoom Functionality 
      m.addControl(new mapboxgl.NavigationControl({showCompass: false}));

      m.on('click', 'countries-fill', (e) => {
        m.getCanvas().style.cursor = 'pointer';

        if (e.features && e.features.length > 0) {
          const country = e.features[0]?.properties as CountryProps
          const isoCode = country.ISO_A2_EH as string
          
          const result = countryBounds[isoCode]

          // check if area has a state-fill
          const state = m.getLayer('states-fill') 
          ? m.queryRenderedFeatures(e.point, { layers: ['states-fill']})[0]?.properties as StateProps
          : null;

          const city = m.getLayer('cities-dot') ?
          m.queryRenderedFeatures(e.point, {layers:['cities-dot']})[0]?.properties
          : undefined

          if (city) {
            return
          }

          // check if at statelevel zoom and if a state is available
          const showState = state && m.getZoom() >= STATE_VISIBLE_ZOOM;

          if (result && !showState) {
            m.fitBounds(result.bounds as LngLatBoundsLike, {
              padding: 50,      
              duration: 2000   
            });
          } else if (state) {
            const long = (state.longitude)
            const lat = (state.latitude)
            m.flyTo({
              center: [long, lat],
              duration: 1500
            })
          }

          // if states are visible and available, the selectedPlace is a state
          if (showState) {
            const name = stateNameOf(state)
            this.selectedPlace = { level: 'state', key: `${state.iso_a2}|${String(name).toLowerCase()}`,name}
            this.clearSelection();
            m.setFilter('state-selected', ['==', ['get', 'iso_3166_2'], showState ? state.iso_3166_2 : '']);
          } else {
            this.clearSelection();
            m.setFilter('country-selected', ['==', ['get', 'ISO_A2_EH'], country.ISO_A2_EH]);
            this.selectedPlace = { level: 'country', key: country.ISO_A2_EH, name: country.NAME}          
          }
        }
      })

      // reset view when user clicks outside a country
      m.on('click', (e) => {
        const hit = m.queryRenderedFeatures(e.point, { layers: ['countries-fill'] });
        if (hit.length === 0) this.resetView();    
      })

      m.on('click', 'cities-dot', (e) => {
        if (e.features && e.features.length > 0) {
          const cityKey = e.features[0].properties.id

          this.selectedPlace = { 
            level: 'city', 
            key: cityKey,
            name: this.filteredCity[cityKey]["name"] ?? cityKey.split('|')[2] 
          }

          this.clearSelection();
          m.setFilter('cities-selected', ['==', ['get', 'id'], cityKey]);

          const coords = cityCoords[cityKey]!
          if (coords){
            // default val is center, if coords returns undefined
            // shouldn't occur since cityDots are placed using cityCoords
            const [lon = 0, lat = 0] = coords
            m.flyTo({
              center: [lon, lat],
              duration: 1500
            })
          }
          
        }
      })

      // Fullscreen Functionality
      m.addControl(new mapboxgl.FullscreenControl());

      
    });
  },

  beforeUnmount() {
    resize?.disconnect()
    map?.remove()
    map = null
    if (this.onModeChange){
      this.darkQuery?.removeEventListener('change', this.onModeChange)
    }
  },

  methods: {
    async fetchData() {
      this.loading = true

      try {
        const [countries, states, cities] = await Promise.all([getCountryStats(), getStateStats(), getCityStats()])
        this.countryData = countries ?? {}
        this.stateData = states ?? {}
        this.cityData = cities ?? {}

        if (!Object.keys(this.countryData).length && !Object.keys(this.stateData).length && !Object.keys(this.cityData).length) {
          this.$snackbar.add({
              type: 'error',
              text: 'No data available for the selected range. Please try a different range or check back later.'
          });
        }

      } catch (err) {
        this.$snackbar.add({
            type: 'error',
            text: 'Failed to fetch data. Please try again later.'
        });
      } finally {
        this.loading = false
      }
    },
    resetView() {
      this.clearSelection();
      map?.flyTo({ center: [0, 20], zoom: 0.75, duration: 1000});
      this.selectedPlace = { level: 'world'}
    },

    async addMapLayers(m: mapboxgl.Map) {
      try {
        // drawing the choropleth under the roads and labels, so that they're visible
        const labelLayersId = m.getStyle().layers.find(l => l.type === 'symbol')?.id;
        const roadLayerId = m.getStyle().layers.find(l => l.id.startsWith('road'))?.id ?? labelLayersId

        
        await this.dataPromise;

        m.addSource('country-boundaries', {
          type: 'geojson',
          data: await $fetch('/geo/50m_countries.json')
        });

        // COUNTRY-LEVEL
        // fill each country based on the number of requests using the minLog and maxlog as the range
        m.addLayer({
          id: 'countries-fill',
          type: 'fill',
          source: 'country-boundaries',
          paint: {
            'fill-color': fillByStats(this.palette, ['get', 'ISO_A2_EH'], this.filteredCountry),
            'fill-opacity': ['interpolate', ['linear'], ['zoom'], 0, 1, 3.5, 0],
          },
        }, roadLayerId);

        // STATE-LEVEL'
        // use geojson to draw states
        m.addSource('states', {
          type: 'geojson',
          data: await $fetch('/geo/50m_states_provinces.json')
        });

        // fill in state based on requests amount- if no requests color state blank to cover up country-fill
          m.addLayer({
          id: 'states-fill',
          type: 'fill',
          source: 'states',
          minzoom: 2.5,
          paint: {
            'fill-color': fillByStats(this.palette, stateKeyExpression, this.filteredStates),
            'fill-opacity': [
              'interpolate', ['linear'], ['zoom'],
              4, 1,
              8, 1,
              12, 0
            ],
          },
        }, roadLayerId);
        

        // hover outline layers
        // idea is to filter show for matching countries/states using iso code of hovered area
        m.addLayer({ 
          id: 'country-hover', 
          type: 'line', 
          source: 'country-boundaries', 
          filter: ['==', ['get', 'ISO_A2_EH'], ''],  
          paint: { 
            'line-color': this.palette.selected, 
            'line-width': 2, 
            'line-opacity': 0.8 } 
          })

        m.addLayer({ 
          id: 'country-selected', 
          type: 'line', 
          source: 'country-boundaries', 
          filter: ['==', ['get', 'ISO_A2_EH'], ''],  
          paint: { 
            'line-color': this.palette.selected, 
            'line-width': 2, 
            'line-opacity': 0.8 } 
        })

        m.addLayer({
          id: 'state-hover',
          type: 'line',
          source: 'states',
          filter: ['==', ['get', 'iso_3166_2'], ''],
          paint: {
            'line-color': this.palette.selected,
            'line-width': 1.5 }
        })

        m.addLayer({ 
          id: 'state-selected', 
          type: 'line', 
          source: 'states', 
          filter: ['==', ['get', 'iso_3166_2'], ''],  
          paint: { 
            'line-color': this.palette.selected, 
            'line-width': 2, 
            'line-opacity': 0.8 } 
        })

        //CITY_LEVEL
        const citygeojson = {
          type: 'FeatureCollection',
          features: Object.entries(cityCoords).map(([key, coords]) => ({
            type: 'Feature',
            properties: {
              id: key, 
              coords: coords
            },
            geometry: {
              type: 'Point',
              coordinates: coords
            }
          }))
        };

        m.addSource('cities-source', {
          type: 'geojson',
          data: citygeojson
        })

        m.addLayer({
          id: 'cities-dot',
          type: 'circle',
          source: 'cities-source',
          minzoom: 2.5,
          paint: {
            'circle-radius': radiusByStats(false, this.filteredCity) as any,
            'circle-color': this.palette.dot,
            'circle-stroke-width': strokeByStats(this.filteredCity) as any,
            'circle-stroke-color': this.palette.selected,
          }
        })

        m.addLayer({
          id: 'cities-selected',
          type: 'circle',
          source: 'cities-source',
          minzoom: 2.5,
          filter: ['==', ['get', 'id'], ''],
          paint: {
            'circle-radius': radiusByStats(true, this.filteredCity) as any,
            'circle-color': 'rgba(255, 255, 255, 0)',
            'circle-stroke-width': 4,
            'circle-stroke-color': this.palette.selected,
          }
        })

        m.addLayer({
          id: 'cities-hover',
          type: 'circle',
          source: 'cities-source',
          minzoom: 2.5,
          filter: ['==', ['get', 'id'], ''],
          paint: {
            'circle-radius': radiusByStats(true, this.filteredCity) as any,
            'circle-color': 'rgba(255, 255, 255, 0)',
            'circle-stroke-width': 2,
            'circle-stroke-color': this.palette.selected,
          }
        })
      } catch (err) { 
        console.error('Error adding map layers:', err);
        this.$snackbar.add({
          type: 'error',
          text: 'Failed to load map layers. Please try again later.'
        });
      }
    },
    clearSelection() {
        map?.setFilter('country-selected', ['==', ['get', 'ISO_A2_EH'], '']);
        map?.setFilter('state-selected', ['==', ['get', 'iso_3166_2'], '']);
        map?.setFilter('cities-selected', ['==', ['get', 'id'], '']);
    }
  },
  watch: {
    // watch for darkmode changes and update the map style accordingly
    palette() {
      if (!map) return
      const url = `mapbox://styles/mapbox/${this.isDark ? 'dark' : 'light'}-v11`
      if (url === currentStyleUrl) return   
      currentStyleUrl = url
      map.setStyle(url)
    },
    // watch for changes in the rangeDays and update the map layers accordingly
    rangeDays() {
      if (!map?.getLayer('countries-fill')) return
      map.setPaintProperty('countries-fill', 'fill-color', fillByStats(this.palette, ['get', 'ISO_A2_EH'], this.filteredCountry))
      map.setPaintProperty('states-fill', 'fill-color', fillByStats(this.palette, stateKeyExpression, this.filteredStates))
     
      map.setPaintProperty('cities-dot', 'circle-radius', radiusByStats(false, this.filteredCity) as any)
      map.setPaintProperty('cities-dot', 'circle-stroke-width', strokeByStats(this.filteredCity) as any)
      
      map.setPaintProperty('cities-selected', 'circle-radius', radiusByStats(true, this.filteredCity) as any)
      map.setPaintProperty('cities-selected', 'circle-stroke-width', strokeByStats(this.filteredCity) as any)
    }
  }
};

</script>


<style scoped>  
  .map-page {
    /* font-size: 18px; */
    
    width: 100%;
    padding: 22px 24px; 
    margin: 32px 110px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    /* styling for dashbaord */
    /* background-color: #F3F3F3;
    border: #D8D8D8 solid 1px;
    border-radius: 15px; */
  }

  .range-buttons {
    display: flex;
    gap: 12px;
    border: #D8D8D8 solid 1px;
    border-radius: 10px;
    padding: 15px 10px;
  }

  .range-buttons button {
    background: none;
    border: none;
    font-size: 18px;
    font-weight: 400;
    border-radius: 5px;
    padding: 5px 11px;
    cursor: pointer;

  }

  .range-buttons button.active {
    background: #4E3681;
    color: #fff;
  }

  .range-buttons button:hover {
    background: #322253;
    color: #fff;
  }

  .map-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .map-page-title {
    gap: 10px
  }

  .map-page h1 {
    font-size: 48px;
    font-weight: bold;
    color: #4E3681;
    margin-bottom: 0;
  }

  .map-page h2 {
    font-size: 24px;
    font-weight: bold;
    line-height: 30px;
  }

  .map-page p {
    font-size: 20px;
    line-height: 30px;
    color: #1E2019;
    margin: 0;
  }

  .map-info {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: stretch;
    gap: 18px
  }

  #map-section, #stat-section  {
    min-width: 0;
  }

  /* Map Section */
  #map-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    grid-column: span 3;
  }

  #map-box {
    border: #D8D8D8 solid 1px;
    border-radius: 15px;
    position: relative;

    min-width: 0;
    overflow: hidden; 

    aspect-ratio: 16 / 10; 
    min-height: 300px
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

  .map-footer, .map-footer > p {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .country-info {
    display: flex;
    gap: 10px;
    flex-direction: row;

  }

  .legend > p, .country-info > p {
    font-size: 14px;
  }

  .legend {
    flex: 1;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: center;
  }

  .legend-bar {
    width: 150px;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(to right, #B9B1CA, #4E3681);
  }

  /* Stat Section */
  #stat-section {
    grid-column: span 2;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .summary-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 20px;
    padding-bottom: 15px;
  }

  .summary-pill {
    background: #F3F3F3;
    display: flex;
    flex-direction: column;
    border: 1px solid #D8D8D8;
    border-radius: 10px;
    padding: 15px 10px;
    gap: 5px;
    max-height: fit-content;
  }

  .pill-num {
    font-size: 24px;
    line-height: 1.2;
    font-weight: 600;
  }

  .pill-label {
    font-size: 15px;
    font-weight: 600;
    line-height: 30px;
    color: #7E807C;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .city-section > p {
    font-weight: bold;
    font-size: 18px;
    padding-bottom: 5px;
  }

  .city-section > ul {
    padding-left: 0;
  }

  .city-items {
    display: flex;
    
    justify-content: space-between;
    padding-bottom: 10px;
    
  }

  .city-items > p {
    font-size: 18px;
  }


  /* MapBox Styling */
  :deep(.map-popup .mapboxgl-popup-content) {
    background: #14140f;
    border: 1px solid #45453c;
    border-radius: 6px;
    padding: 8px 10px;
    white-space: nowrap;
    pointer-events: none;
  }

  /* Styling for mapbox popup */
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
    

  @media (prefers-color-scheme: dark) {
    /* styling for dashboard */
    /* .map-page {
      background-color: #262820;
      border: #353535 solid 1px;
    } */

    .map-page p {
      color: #FFFFFF
    }

    .map-page h1 {
      color: #CCECFD
    }

    .map-page h2 {
      color: #fdf9f9
    }

    p, .pill-num {
      color: #FFFFFF
    }

    .summary-pill {
      background: #262820;
      border: 1px solid #353535;
    }

    .pill-label {
      color: #9D9E9A
    }

    .city-section, .city-items > p {
      color: #CCCCCC;
    }

    .legend-bar {
      background: linear-gradient(to right, #383d3d, #BFE4F3);
    }

    #map-box {
      border-color: #353535;
    }

    .range-buttons {
      border: #353535 solid 1px;
    }

    .range-buttons button {
      color: #FFFFFF;
    }

    .range-buttons button.active {
      background: #CCECFD;
      color: #000000;
    }

    .range-buttons button:hover {
      background: #ffffff;
      color: #000000;
    }

  }

  /* Mobile */
  @media (max-width: 1280px) {
    .map-page {
      gap: 30px;
      padding: 10px 15px;
      width: 100%;
      margin: 52px 30px;
    }

    .map-page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 30px;
    }

    .map-page h1 {
      font-size: 32px;
      font-weight: 600;
    }

    .map-page h2 {
      font-size: 20px;
      line-height: 20px;
    }

    .map-page p {
      font-size: 18px;
      line-height: 27px;
    }

    .map-info {
      display: flex;
      flex-direction: column;
      gap: 18px
    }

    .summary-row {
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 20px;
    }

    #reset-btn {
      padding: 14px 18px;
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
  }

</style>
