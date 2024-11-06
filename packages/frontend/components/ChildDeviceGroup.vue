
<template>
   <ChildDeviceRow v-for="i in numChildren" :key="i" :deviceKey="i" :name="bob" />

    <!-- TODO: Paginate with a maximum of 10 children displayed -->
</template>

<script>

export default {
    data() {
        return {
            maxDisplayedChildren: 10,
            bob: "hello"
        }
    },
    props: {
        numChildren: {
            type: Number,
            required: true
        }
    },
    computed: {
    },
    methods: {
        
    }
}
</script>



<style scoped>


</style>