<!-- heatmap.vue -- website requests by geography
Copyright (C) 2024 GOSQAS
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. -->
<template>
  <div class="container py-4">
    <p class="h2 mb-4">Website requests by geography</p>
    <div ref="vizOrigin" class="heatmap-viz-origin" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import define from '~/data_viz/index.js'
import { Runtime, Library, Inspector } from '~/data_viz/runtime.js'

import '~/data_viz/inspector.css'

const vizOrigin = ref(null)
let runtime: Runtime // defines the instance of the element to mount

onMounted(() => {
  //waits for the page to be mounted to run
  const mountedElem = vizOrigin.value
  if (!mountedElem) return
  runtime = new Runtime()
  runtime.module(define, Inspector.into(mountedElem))
})

onBeforeUnmount(() => {
  // disposes of the reference and shuts down observable
  runtime?.dispose()
  runtime = null
})
</script>

<style scoped>
.heatmap-viz-origin {
  min-height: 24rem;
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #features-container {
        background-color: #1E2019;
    }
    p {
        color: #FFFFFF;
    }
  
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #features-container {
        background-color: #FFFFFF;
    }
    p {
        color: #1E2019;
    }
}
</style>
