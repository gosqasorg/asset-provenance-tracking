<template>
    <div>
    <div v-for="event in timestamppairs">{{ myDate(event.gdttimestamp) }}, {{event.gdtid}}</div>
    </div>
</template>

<script>
import { myDate } from '~/utils/dateUtility';

export default {
    name: 'TimestampList',
    props: ['timestamppairs']
};
</script>
