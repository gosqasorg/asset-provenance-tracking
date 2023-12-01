<!-- 
    Page that apears after you create a new device. This is where you can save 
    the QR code etc.
-->
<template>
  <div>
    <h1 v-if="device.saved">Sample Device: {{ device.name }}</h1>
    <h1 v-else>Device: {{ device.name }}</h1>

    <div v-if="device.saved" class="text-bg-info col-6">
      <p>
        The key for this device has been <a href="/devices">saved</a> for demonstration purposes.
      </p>
    </div>

    <div v-else class="text-bg-warning col-6">
      <p>
        This device key is not stored in the GOSQAS Asset Provenance Tracker.
        Please save the device key and QR code in order to use GOSQAS for this device.
      </p>
    </div>

    <div>Device Key: {{ device.key }}</div>
    <div><a :href="'/provenance/' + device.key">View Provenance Records</a></div>
    <div><img :src="device.qrCode" /></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      device: {
        saved: false,
        name: "",
        key: "",
        qrCode: ""
      }
    };
  }
};
</script>
