<template>
    <div v-for="keyRecord in keys">
        <div v-for="key in keyRecord">
        <a :href="`/provenance/${key}`">{{key}}</a>
        </div>
    </div>

</template>

<script>

export default {
    name: 'KeyList',
    props: ['keys']
};
</script>
