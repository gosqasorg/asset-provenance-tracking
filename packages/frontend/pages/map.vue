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

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

let map: mapboxgl.Map | null

onMounted(() => {
    map = new mapboxgl.Map({
    accessToken: process.env.MAPBOX_TOKEN,
    container: 'map',
    center: [0, 0],
    zoom: 0.75,
    style: 'mapbox://styles/mapbox/dark-v10',
    dragRotate: false, 
    pitchWithRotate: false, 
    maxZoom: 7, 
    minZoom: 0.75
  })

  map.on('load', () => {
    map.addSource("country-boundaries", {type: "vector", url: "mapbox://mapbox.country-boundaries-v1"})

    map.addLayer({
      id: 'countries-fill',
      type: 'fill',
      source: 'country-boundaries',
      "source-layer": "country_boundaries",
      "filter": [
        "==", ["get", "disputed"], "false"],
      "paint": {
        "fill-color": "rgba(66,100,251, 0.3)",
        "fill-outline-color": "#0000ff"
      }
    })

    map.addLayer({
      id: 'countries-fill-d',
      type: 'fill',
      source: 'country-boundaries',
      "source-layer": "country_boundaries",
      "filter": [
        "==", ["get", "disputed"], "true"],
      "paint": {
        "fill-color": "rgba(66,100,251, 0.3)",
        "fill-outline-color": "#0000ff"
      }
    })
  })

  // TODO ADD LAYERS FOR COUNTRY outlines, heatmap, and dots for cities
  //add data sorce with geoJSON


  // // Heatmap filling
  

  // // Outlining
  // map.addLayer({
  //           id: 'outline',
  //           type: 'line',
  //           source: 'country-boundaries',
  //           layout: {},
  //           paint: {
  //               'line-color': '#000',
  //               'line-width': 2
  //           }
  // });

})

onBeforeUnmount(() => map?.remove())


</script>

<style scoped>



</style>