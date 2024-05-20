<template>
    <form enctype="multipart/form-data" @submit.prevent="submitForm">
        <h3>Create New Container</h3>
        <div id="container-form">
            <input type="text" class="form-control" v-model="name" required placeholder="Container Name">
            <input type="text" class="form-control mt-3" v-model="description" id="device-description" placeholder="Container Description">
            <label class="form-label mt-2" for="file">Container Image (optional)</label>
            <input type="file" class="form-control" accept="image/*" @change="onFileChange" capture="environment" multiple />

            <span style="display: inline">
            <label for="checkbox">Create Reporting Key:&nbsp&nbsp</label>
            <input type="checkbox" id="checkbox" v-model="createReportingKey" /> </span>

            <label for="children-keys">Number of contained devices (optional):</label>
            <input type="number" v-model="childrenKeys" min="0" max="500">

        </div>
        <button id="submit-button" type="submit">Create Container Group</button>
    </form>
</template>

<script lang="ts">
import { postProvenance } from '~/services/azureFuncs';
import { makeEncodedDeviceKey } from '~/utils/keyFuncs';

export default {
    data() {
        return {
            name: '',
            description: '',
            childrenKeys: 0,
            createReportingKey: false,
            hasParent: false, // states whether this device is contained within a box/container
            pictures: [] as File[] | null,
        }
    },
    methods: {
        onFileChange(e: Event) {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            if (files) {
                this.pictures = Array.from(files);
            }
        },
        async submitForm() {
            const deviceKey = await makeEncodedDeviceKey();

            // This code is copied from Judith;
            // I am going to retain her names even though they are
            // redundant until I get this workin.
            const hasReportingKey = this.createReportingKey;
            const numChildren = this.childrenKeys as Number;
            const childrenDeviceList = [];
            const childrenDeviceName = [];
            let reportingKey;
            if (hasReportingKey) {
                reportingKey =  await makeEncodedDeviceKey(); //reporting key = public key

                await  postProvenance(reportingKey, {
                    blobType: 'deviceInitializer',
                    deviceName: this.name,
                    // Is this a proper description? Should it say "reporting key" or something?
                    description: this.description,
                    tags: ['creation', 'reportingkey'],
                    children_key: '',
                    hasParent: true,
                    isReportingKey: true,
                }, this.pictures || [])
                    .then(response => {
                        // Handle the successful response here
                        console.log('Create Reporting Key Successful:', response);
                    })
                    .catch(error => {
                        // Handle the error here
                        console.error('Create Reporting Key Failed:', error);
                    });
                childrenDeviceList.push(reportingKey);
                childrenDeviceName.push(name);
            }

            if (numChildren) {
                for (let i = 0; i < Number(numChildren); i++) {
                    const childKey =  await makeEncodedDeviceKey();
                    const childName = this.name + " #" + String(i + 1);
                    await  postProvenance(childKey, {
                        blobType: 'deviceInitializer',
                        deviceName: childName,
                        description: this.description,
                        tags:['creation'],
                        children_key: '',
                        hasParent: true,
                        isReportingKey: false
                    }, this.pictures || [])
                        .then(response => {
                            // Handle the successful response here
                            console.log('Create Child Key Successful:', response);
                        })
                        .catch(error => {
                            // Handle the error here
                            console.error('Create Child Key Failed:', error);
                        });
                    childrenDeviceList.push(childKey);
                    childrenDeviceName.push(childName);
                }
            };
            console.log("reportingKey",reportingKey);
            postProvenance(deviceKey, {
                blobType: 'deviceInitializer',
                deviceName: this.name,
                description: this.description,
                tags:['creation'],
                reportingKey: reportingKey,
                children_key: childrenDeviceList,
                children_name: childrenDeviceName,
                hasParent: false,
                isReportingKey: false
            }, this.pictures || [])
                .then(response => {
                    // Handle the successful response here
                    console.log('Post request successful:', response);
                })
                .catch(error => {
                    // Handle the error here
                    console.error('Error in post request:', error);
                });

            //Routing to display the device QR code etc.
            this.$router.push({ path: `/device/${deviceKey}` });
        },
    }

}
</script>

<style scoped>
    form {
        background-color: #e6f6ff;
        border-radius: 10px;
        padding: 30px;
        display: block;
        margin-left: auto;
        margin-right: auto;

    }
    #container-form > * {
        padding: 5px;
        margin: 5px;
        display: flex;
        flex-direction: column;
    }
    #submit-button {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 100%;
        margin-top: 30px;
        border-width: 0px;
        border-radius: 10px;
        padding: 7px;
        background-color: #4e3681;
        color: white;
    }
</style>
