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
    <form enctype="multipart/form-data" class="bg-frost p-3" @submit.prevent="submitForm">
        <h4 class="text-iris mt-1 mb-3">Create New Container</h4>
        <div>
            <input type="text" class="form-control" v-model="name" required placeholder="Container Name">
            <input type="text" class="form-control mt-3" v-model="description" id="device-description" placeholder="Container Description">
            <h4 class="text-iris form-label mt-3 mb-3" for="file">Container Image (optional)</h4>
            <input type="file" class="form-control" accept="*" @change="onFileChange" capture="environment" multiple />
           
            <h4 class="mt-3 mb-3 text-iris">Add Tags (optional)</h4>
            <ProvenanceTagInput class="form-control mt-1 " placeholder="Device Tag" v-model="tags" @updateTags="handleUpdateTags"/>
            <div>
                <span v-for="(tag, index) in tags" :key="tag"> {{ tag }}{{ index !== tags.length - 1 ? ', ' : '' }}</span>
            </div>
 
 
 
 
            <h4 class="text-iris my-4 mb-0" for="children-keys">Number of Contained Devices (optional)
                <input type="number" class="form-inline" id="children-keys" v-model="childrenKeys" min="0" max="500" @change="displayFields">
            </h4>
 
 
            <br>
            <h4 class="text-iris p-1 mt-0 mb-0 ">
                <input type="checkbox" class="form-check-input" id="customize-yes" name="customize"  @change="displayFields"/> Customize Contained Device Names?
            </h4>
 
 
            <div class="text-iris" id="num-fields" style="display:none" >
                <label for="input"></label>
            </div>
 
 
            <br>
            <h4 class="text-iris p-1 mt-0 mb-0 ">
                <input type="checkbox" class="form-check-input" id="report-key" v-model="createReportingKey" /> Create Reporting Key?
            </h4>
 
 
            <br>
            <h4 class="text-iris p-1 mt-0">
                <input type="checkbox" class="form-check-input" id="notify-all"/> Notify all Children?
            </h4>

        </div>
       
        <!--TODO: Replace this with button component!-->
        <!-- <div class="d-grid">      
            <button class="btn my-3 bg-iris text-white mb-0" type="submit">Create Container</button>
        </div> -->
        <div class="d-grid">
            <button-component class="my-4 mb-0" buttonText="Create Container" type="submit" />
        </div>


        <!--DIDNT ADD: components: { ButtonComponent, } in export default {} below-->
    </form>
 </template>

<script lang="ts">
import { postProvenance } from '~/services/azureFuncs';
import { makeEncodedDeviceKey } from '~/utils/keyFuncs';

import ButtonComponent from '../ButtonComponent.vue';

export default {
    data() {
        return {
            name: '',
            description: '',
            tags: [] as string[],
            childrenKeys: 0,
            createReportingKey: false,
            hasParent: false, // states whether this device is contained within a box/container
            pictures: [] as File[] | null,
        }
    },
    methods: {
        handleUpdateTags(tags: string[]) {
            // console.log('handle Update Tags', tags);
            this.tags = tags;
        },
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
                    newInput.style.border = "0px";
                    newInput.style.borderRadius = "4px";
                    newInput.style.margin = "3px"
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

            } else {
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

            if ((<HTMLInputElement>document.getElementById("notify-all")).checked) {
                console.log("notifying all children");
                this.tags = (this.tags).concat(['notify_all'])
            } 

            if (hasReportingKey) {
                reportingKey =  await makeEncodedDeviceKey(); //reporting key = public key
                let tag_set = (this.tags).concat(['reportingkey']);

                await  postProvenance(reportingKey, {
                    blobType: 'deviceInitializer',
                    deviceName: this.name,
                    // Is this a proper description? Should it say "reporting key" or something?
                    description: this.description,
                    tags: tag_set,
                    children_key: [],
                    children_name: [],
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
                childrenDeviceName.push(this.name);
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
                        description: this.description,  // need to see if we want a special description when making a child
                        tags:this.tags,
                        children_key: [],
                        children_name: [],
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
            postProvenance(deviceKey, {
                blobType: 'deviceInitializer',
                deviceName: this.name,
                description: this.description,
                tags:this.tags,
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
        border-radius: 10px;
        padding: 30px;
        width: 100%;
        display: block;
        margin-left: auto;
        margin-right: auto;

    }
    /* Style for the placeholder text */
    .form-control::placeholder {
    color: gray;
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
    input[type=number] {
        border: 0px;
        border-radius: 4px;
    }
    input[type=checkbox] {
        width:25px;
        border: 0px;
        margin-right: 15px;
    }
    .num-fields {
        border: 0px;
        border-radius: 4px;
        border-color:red;
    }
    input[type=text] {
        border:5px;
        border-color:red;
    }
</style>
