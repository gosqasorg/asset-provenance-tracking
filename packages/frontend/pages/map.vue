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
        </div>

        <!-- TODO: Stats Section -->
        <div> 
             <!--  Adds a >[Location] when specific location is clicked -->
             <p>World</p> 
             <h2>Whole Network</h2>
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

export default {

  data() {
    return {
      rawData: null as any[] | null,   
    }
  },

  mounted() {
    // markRaw stops Vue from wrapping the map in a reactive proxy,
    // which breaks Mapbox internals
    // const m = markRaw(new mapboxgl.Map({
    //   accessToken: this.$config.public.mapboxToken as string,
    //   container: 'map',
    //   center: [0, 0],
    //   zoom: 0.75,
    //   style: 'mapbox://styles/mapbox/dark-v10',
    //   dragRotate: false,
    //   pitchWithRotate: false,
    //   maxZoom: 7,
    //   minZoom: 0.75,
    // }))

    // map = m

    // m.on('load', () => {
    //   m.addSource('country-boundaries', {
    //     type: 'vector',
    //     url: 'mapbox://mapbox.country-boundaries-v1',
    //   })

    //   m.addLayer({
    //     id: 'countries-fill',
    //     type: 'fill',
    //     source: 'country-boundaries',
    //     'source-layer': 'country_boundaries',
    //     filter: ['==', ['get', 'disputed'], 'false'],
    //     paint: {
    //       'fill-color': 'rgba(66,100,251, 0.3)',
    //       'fill-outline-color': '#0000ff',
    //     },
    //   })

    //   m.addLayer({
    //     id: 'countries-fill-d',
    //     type: 'fill',
    //     source: 'country-boundaries',
    //     'source-layer': 'country_boundaries',
    //     filter: ['==', ['get', 'disputed'], 'true'],
    //     paint: {
    //       'fill-color': 'rgba(66,100,251, 0.3)',
    //       'fill-outline-color': '#0000ff',
    //     },
    //   })

    //   // TODO: add layers for country outlines, heatmap, and city dots
    //   // TODO: add data source with GeoJSON
    // })

    this.fetchData()
  },

  beforeUnmount() {
    map?.remove()
    map = null
  },

  methods: {
    async fetchData() {
      // TODO: add filtering and state management
      try {
        this.rawData = await getRequestStats()
      } catch (err) {
        this.$snackbar.add({
            type: 'error',
            text: 'Failed to fetch data error: ' + err
        });
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

