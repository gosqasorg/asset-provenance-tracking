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
import { useRoute } from 'vue-router'
import { getProvenance,getStatistics} from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
import { ref, onMounted } from 'vue'
import TimestampList from "@/components/TimestampList.vue";

export default {
    components: {
        TimestampList
    },
    data() {
        return {
            isLoading: true,
            myTimestampPairs: []
        }},

    methods: {
        async fetchData() {
            try {
                const response = await getStatistics();
                return response;
            } catch (error) {
                console.log(error)
            }
        },
    },
    async mounted(){
        this.myTimestampPairs = await this.fetchData();
        console.log("a Griffon flew down");
        this.isLoading = false
    }
}

</script>
