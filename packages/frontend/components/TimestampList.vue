<template>
    <div>
    <div v-for="event in timestamppairs">{{ myDate(event.gdttimestamp) }}, {{event.gdtid}}</div>
    </div>
</template>

<script>
import { getStatistics} from '~/services/azureFuncs';
import { EventBus } from '~/utils/event-bus';
import { myDate } from '~/utils/dateUtility';

export default {
    name: 'TimestampList',
    props: ['timestamppairs']
};
</script>
