<template>
    <form enctype="multipart/form-data" @submit.prevent="submitForm">
        <h3>Create New Container</h3>
        <div id="container-form">
            <input type="text" class="form-control" v-model="name" required placeholder="Container Name">
            <input type="text" class="form-control mt-3" v-model="description" id="device-description" placeholder="Container Description">
            <label class="form-label mt-2" for="file">Container Image (optional)</label>
            <input type="file" class="form-control" accept="image/*" @change="onFileChange" capture="environment" multiple />

            <span style="display: inline">
            <label for="report-key">Create Reporting Key:&nbsp&nbsp</label>
            <input type="checkbox" id="report-key" v-model="createReportingKey" /> </span>


            <label for="children-keys">Number of contained devices (optional):</label>
            <input type="number" id="children-keys" v-model="childrenKeys" min="0" max="500" @change="displayFields">

            <!-- <br> -->
            <span style="display: inline">
            Customize Contained Device Names?
            <input type="radio" id="customize-yes" name="customize"  @change="displayFields"/>Yes
            <input type="radio" id="customize-no" name="customize"   @change="displayFields" checked/>No
            </span>

            <br><br>

            <div id="num-fields" >
                <label for="input"></label>
            </div>

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
