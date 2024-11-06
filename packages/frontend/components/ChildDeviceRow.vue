
<template>
   <!-- newInput = document.createElement('input');
                    newInput.id = 'name-input-' + (i);
                    newInput.type = 'text';
                    newInput.style.border = "0px";
                    newInput.style.borderRadius = "4px";
                    newInput.style.margin = "3px"
                    newInput.required = true;
                    newLabel =  document.createElement('label');
                    newLabel.textContent = 'Device #'+ (i+1) +' Name:  ';
                    fieldset.appendChild(newLabel);
                    fieldset.appendChild(newInput);
                    fieldset.appendChild(document.createElement('br')); -->
    <input v-bind:value="text" type="text" class="form-control" required placeholder="Device Name" style="margin-bottom: 0.25em;">
</template>

<script>

export default {
    data() {
        return {
            text: "hello2"
        }
    },
    props: {
        deviceKey: {
            type: Number,
            required: true
        },
        name: {
            type: String,
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