<template>
    <div v-for="key in keys">
        <a :href="`/provenance/${key}`">{{key}}</a>
    </div>

</template>

<script>

export default {
    name: 'KeyList',
    props: ['keys']
};
</script>
