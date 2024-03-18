<template>
  <div>
    <!-- <h1>Device: {{ device.name }} </h1> -->
    <div>Device Key: {{ route.params.deviceKey }}</div>
    <div><a :href="`/provenance/${route.params.deviceKey}`">View History Records</a></div>
    <div><GenerateQRCode :deviceKey="route.params.deviceKey"></GenerateQRCode></div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import GenerateQRCode from '~/components/GenerateQRCode.vue';

const route = useRoute()
const deviceKey = route.params.deviceKey
</script>