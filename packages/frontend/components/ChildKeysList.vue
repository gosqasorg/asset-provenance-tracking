<template>
    <div>
    Child Keys:
    <div v-for="childkey in childkeys">
     <a :href="`/provenance/${childkey}`">{{childkey}}</a>
    </div>
    </div>
</template>

<script>
import { myDate } from '~/utils/dateUtility';

export default {
    name: 'ChildKeysList',
    props: ['childkeys']
};
</script>
