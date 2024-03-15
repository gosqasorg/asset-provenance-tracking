<template>
  <div>
    <!-- <h1>Statistics! </h1> -->
    <div>Time Stamp List</div>
     <div>
    <span v-for="event in pairs">{{ event.gdttimestamp }}, {{event.gtdid}}</span>
     </div>
    <div></div>
    <div></div>
  </div>
</template>

<script>
import { getStatistics} from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';

export default {
    data() {
        return {
            pairs: []
        }
    },
    methods: {
        refreshPage() {
            console.log('Statistics refresh event received');
            getStatistics().then((response) => {
                console.log(response);
                console.log(response.body);
                this.pairs = response;
            }).catch(error =>  {
                console.log("Error in TimestampList Getstatitics!");
                console.log(error);
            })
        }
    }
};
</script>
