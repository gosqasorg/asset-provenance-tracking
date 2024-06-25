<!-- CreateContainer.vue -- Creation of Container
Copyright (C) 2024 GOSQAS Team
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. -->
<template>
    <form enctype="multipart/form-data" class="bg-sky p-3" @submit.prevent="submitForm">
        <p class="text-iris mt-1">Create New Container</p>
        <div>
            <input type="text" class="form-control" v-model="name" required placeholder="Container Name">
            <input type="text" class="form-control mt-2" v-model="description" id="device-description" placeholder="Container Description">
            <label class="text-iris form-label mt-3" for="file">Container Image (optional):</label>
            <input type="file" class="form-control" accept="image/*" @change="onFileChange" capture="environment" multiple />

            <span style="display: inline">
            <label class="text-iris mt-3 me-2" for="report-key">Create Reporting Key:</label>
            <input type="checkbox" id="report-key" v-model="createReportingKey" /> </span>

            <br>
            <label class="text-iris my-3 me-2" for="children-keys">Number of contained devices (optional):</label>
            <input type="number" id="children-keys" v-model="childrenKeys" min="0" max="500" @change="displayFields">

            <br>
            <span class="text-iris mt-4">
            Customize Contained Device Names?
            <div class="text-black p-1" style="display:inline"> 
                <input type="radio" id="customize-yes" name="customize"  @change="displayFields"/>Yes
                <input class="ms-1" type="radio" id="customize-no" name="customize"   @change="displayFields" checked/>No
            </div>
            </span>


            <div id="num-fields" style="display:none" >
                <label for="input"></label>
            </div>

        </div>
        <div class="d-grid">        
            <button class="btn my-3 bg-iris text-white" type="submit">Create Container</button>
        </div>    </form>
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
        displayFields() {
            const childrenNum = (<HTMLInputElement>document.getElementById("children-keys")).value;

            const customize_yes = (<HTMLInputElement>document.getElementById("customize-yes"));
            const customize_no = (<HTMLInputElement>document.getElementById("customize-no"));
            
            var newInput, newLabel;
            var wrapper_div = document.getElementById('num-fields') as HTMLInputElement;
            var fieldset = document.createElement('div') as HTMLInputElement;

            while (wrapper_div.hasChildNodes()) {
                wrapper_div.removeChild(wrapper_div.firstChild!);
            }

            for (var i=0; i<Number(childrenNum); i++) {
                    newInput = document.createElement('input');
                    newInput.id = 'name-input-' + (i);
                    newInput.type = 'text';
                    newInput.required = true;
                    newLabel =  document.createElement('label');
                    newLabel.textContent = 'Device #'+ (i+1) +' Name:  ';
                    fieldset.appendChild(newLabel);
                    fieldset.appendChild(newInput);
                    fieldset.appendChild(document.createElement('br'));
            }

            if (customize_yes.checked) {
                wrapper_div.append(fieldset);
                wrapper_div.style.display = "inline";

            } else if (customize_no.checked) {
                wrapper_div.style.display = "none";
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
                
                // let input_trial = (<HTMLInputElement>document.getElementById("name-input-1")).value;
                // console.log("this is the input trial", input_trial);

                const customize_yes = (<HTMLInputElement>document.getElementById("customize-yes"));
                var childName;

                for (let i = 0; i < Number(numChildren); i++) {
                    const childKey =  await makeEncodedDeviceKey();

                    if (customize_yes.checked) {
                        // user has selected to customize names. use the inputted names.
                        childName = (<HTMLInputElement>document.getElementById("name-input-" + i)).value
                    } else {
                        // user not customizing names. use default.                        
                        childName = this.name + " #" + String(i + 1);
                    }

                    await  postProvenance(childKey, {
                        blobType: 'deviceInitializer',
                        deviceName: childName,
                        description: "",  // need to see if we want a special description when making a child
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
        background-color: rgb(60, 179, 113); /* MediumSeaGreen */
        border-radius: 10px;
        padding: 30px;
        width: 100%;
        display: block;
        margin-left: auto;
        margin-right: auto;

    }
    #container-form > * {
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
        width: 100%;
        margin-top: 30px;

    }
</style>
