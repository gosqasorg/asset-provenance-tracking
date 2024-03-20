<template>
    <div>
    <div v-for="event in timestamppairs">{{ tzDate(event.timestamp) }}, {{event.deviceID}}</div>
    </div>
</template>

<script>
import { tzDate } from '~/utils/dateUtility';

export default {
    name: 'TimestampList',
    props: ['timestamppairs']
};
</script>
