<template>
  <div>
    <!-- <h1>Statistics! </h1> -->
    <div>Well hello there!</div>
    <div></div>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getProvenance,getStatistics} from '~/services/azureFuncs';

const route = useRoute()

console.log("a dragon flew down");

onMounted(async () => {
    console.log("a Griffon flew down");
    try {
        const response = await getStatistics();
    console.log(response);
//        deviceInfo.value = response[response.length - 1].record
    } catch (error) {
        console.log(error)
    }
})

</script>