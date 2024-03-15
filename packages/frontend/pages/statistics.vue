<template>
  <div>
    <!-- <h1>Statistics! </h1> -->
    <div>Well hello there!</div>
     <div>
    <TimestampList/>
     </div>
    <div></div>
    <div></div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { getProvenance,getStatistics} from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';

const route = useRoute()

console.log("a dragon flew down");

onMounted(async () => {
    console.log("a Griffon flew down");
    try {
        const response = await getStatistics();
        console.log(response);
        console.log(response.body);
    } catch (error) {
        console.log(error)
    }
})

</script>
