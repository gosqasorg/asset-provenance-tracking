<template>
  <div>
    <!-- <h1>Statistics! </h1> -->
    <div>Well hello there!</div>
    <div v-if="!isLoading">
    <TimestampList v-bind:timestamppairs="myTimestampPairs"/>
  </div>
  <div v-else>
    Show your prendered data here
  </div>
    <div></div>
    <div></div>
  </div>
    </template>

    <script>
    import TimestampList from "@/components/TimestampList.vue";

let tspairs = [
                {
                    "gdttimestamp": "1710510353826",
                    "gdtid": "ffcc",
                },
];

export default {
    components: {
        TimestampList
    },
    data() {
        return {
            isLoading: true,
            myTimestampPairs: tspairs
        }},

    methods: {
    async fetchData() {
        try {
        const response = await getStatistics();
        console.log("Maybe theres are the pairs:");
        console.log(response);
        tspairs = response;
            return tspairs;
        } catch (error) {
            console.log(error)
        }
    },
  },
  async mounted(){
      this.myTimestampPairs = await this.fetchData();
//      tspairs = this.myTimstampPairs;
      console.log("a Griffon flew down");
     this.isLoading = false
  }
}

</script>

<script setup>
import { useRoute } from 'vue-router'
import { getProvenance,getStatistics} from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
import { ref, onMounted } from 'vue'
console.log("a dragon flew down");




// onMounted(async () => {
//     console.log("a Griffon flew down");
//     try {
//         const response = await getStatistics();
//         console.log("Maybe theres are the pairs:");
//         console.log(response);
//         tspairs = response;
//         this.isLoading = false;
//     } catch (error) {
//         console.log(error)
//     }
// })

</script>
