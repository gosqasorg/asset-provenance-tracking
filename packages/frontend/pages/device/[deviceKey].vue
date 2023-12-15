<!-- 
    Page that apears after you create a new device. This is where you can save 
    the QR code etc.
-->
<template>
  <div>
    <!-- <h1>Device: {{ device.name }} </h1> -->
    <div>Device Key: {{ route.params.deviceKey }}</div>
    <div><a :href="`/provenance/${route.params.deviceKey}`">View Provenance Records</a></div>
    <div><GenerateQRCode :deviceKey="route.params.deviceKey"></GenerateQRCode></div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import GenerateQRCode from '~/components/GenerateQRCode.vue';

const route = useRoute()
const deviceKey = route.params.deviceKey

</script>