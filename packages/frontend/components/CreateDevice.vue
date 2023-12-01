<!-- 
    This component is a form used to create a new device that we will track the 
    providence for. 

    Resourses:
    https://test-utils.vuejs.org/guide/essentials/forms
-->

<template>
    <form enctype="multipart/form-data" @submit.prevent="submitForm"> 
        <h3>Create New Device</h3>
        <div id="device-form">
            <input type="text" class="form-control" v-model="name" required placeholder="Device Name">
            <input type="text" class="form-control mt-3" v-model="description" required placeholder="Device Description">
            <div style="display: block;">
                <label>Device Image (optional):    </label>
                <input type="file" class="form-control" accept="image/*" @change="onFileChange" capture="environment" />
            </div>
            <div style="display: block;">
                <input type="checkbox" v-model="saveDeviceKey">
                <label for="save-device-key"> Save device key (demo devices only!)</label>
            </div>
        </div>
        <button id="submit-button" type="submit">Submit</button>
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
            this.form.picture = e.target.files[0];
        },
        async submitForm() {
            // Handle form submission here
            console.log(this.name, this.description, this.saveDeviceKey);
            // Reset form inputs
            this.name = '';
            this.description = '';
            this.picture = null;
            this.saveDeviceKey = false;

            const deviceKey = 

            //Routing to display the device QR code etc. 
            this.$router.push(`/device-birth/${deviceKey}`);
        }
    }
    // server.post('/', async (request, reply) => {
    //     const fields = await getFormFields(request);

    //     const name = fields.get('name') as string;
    //     const description = fields.get('description') as string;
    //     const picture = fields.get('picture') as Attachment | undefined;
    //     const saveDeviceKey = fields.get('save-device-key') === "on";

    //     const deviceKey = encodeKey(crypto.randomBytes(16));
    //     if (saveDeviceKey) {
    //         await deviceRepo.createDevice(name, deviceKey);
    //     }
    //     await recordRepo.createRecord(deviceKey, description, {
    //         name,
    //         tags: ['creation'],
    //         attachments: picture ? [picture] : undefined,
    //     })

    //     reply.redirect(`/device/${deviceKey}`);
    // });
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



