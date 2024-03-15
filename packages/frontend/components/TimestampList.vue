<template>
  <div>
    <!-- <h1>Statistics! </h1> -->
    <div>Time Stamp List</div>
     <div>
    <div v-for="event in timestamppairs">{{ Date(event.gdttimestamp) }}, {{event.gdtid}}</div>
     </div>
    <div></div>
    <div></div>
  </div>
</template>

<script>
import { getStatistics} from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';

export default {
    name: 'TimestampList',
    props: ['timestamppairs']
};
</script>
