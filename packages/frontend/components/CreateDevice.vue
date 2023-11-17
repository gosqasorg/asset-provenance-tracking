<!-- 
    This component is a form used to create a new device that we will track the 
    providence for. 
-->

<template>
    <form method="POST" class="col-md-8 card p-3 text-bg-secondary" enctype="multipart/form-data" @submit.prevent="submitForm">
        <h3>Create New Device</h3>
        <div id="device-form">
            <input type="text" class="form-control" v-model="name" required placeholder="Device Name">
            <input type="text" class="form-control mt-3" v-model="description" required placeholder="Device Description">
            <div style="display: block;">
                <label class="form-label mt-2" for="file">Device Image (optional):    </label>
                <input type="file" class="form-control" accept="image/*" @change="onFileChange" capture="environment" />
            </div>
            <div style="display: block;">
                <input type="checkbox" id="save-device-key" v-model="saveDeviceKey">
                <label for="save-device-key"> Save device key (demo devices only!)</label>
            </div>
        </div>
        <button id="submit-button" type="submit" class="btn btn-primary">Submit</button>
    </form>
</template>

<script>
export default {
    data() {
        return {
            name: '',
            description: '',
            picture: null,
            saveDeviceKey: false
        }
    },
    methods: {
        onFileChange(e) {
            this.picture = e.target.files[0];
        },
        submitForm() {
            // Handle form submission here
        }
    }
}
</script>

<style scoped>
    form {
        background-color: rgb(145, 193, 248);
        border-radius: 10px;
        padding: 30px;
        width: 70%;
        display: block;
        margin-left: auto;
        margin-right: auto;
        
    }
    #device-form > * {
        padding: 5px;
        margin: 5px;
        display: flex;
        flex-direction: column;
        width: 70%
    }
    #submit-button {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 50%;
        margin-top: 30px;
        
    }
</style>



