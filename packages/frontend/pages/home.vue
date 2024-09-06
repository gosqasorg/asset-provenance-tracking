<!-- home.vue
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
<!--
    This is the home page for GOSQAS
-->
<script setup lang="ts">
    const route = useRoute()
</script>

<template>
    <div class="container-fluid">

        <div class="row" id="first-row">
            <div class="col-12 col-md-7" id="first-row-col">
                <div class="row"> <h1>Trust and transparancy when you need it most.</h1> </div>
                <div class="row" style=" margin-bottom: 60px; margin-top:15px; ">
                    <form class="col-lg-5" style="margin-bottom: 20px;" @submit.prevent="trackingForm">
                        <button-component id="unclicked" buttonText="Track an Asset" type="submit" style="opacity:100;"></button-component>
                    </form>
                    <div class="col-lg-6" style="margin-bottom: 20px;">
                        <button-component buttonText="Create a Device" backgroundColor="#CCECFD" onclick="window.location.href='/'"
                            borderColor="#CCECFD" color="#1E2019" ></button-component>
                    </div>
                    <div id="trackAssetDiv" style="visibility: hidden;">
                        <TrackAsset inputWidth="60%"></TrackAsset>
                    </div>
                </div>
                
            </div>

        </div>

        <div class="row bg-frost" id="second-row" >
            <div class="row">
                <div class="col" id="second-row-cols" v-for="item in second_row">
                    <h4 class="text-iris" id="second-row-cols-h4">{{item.title}}</h4>
                    <p class="text-eggplant" style="font-weight: 400;">{{ item.descr }}</p>         
                </div>
            </div>
            <div class="col" style="text-align: center; margin-top: 50px;">
                <button-component buttonText="About Us" color="#322253" onclick="window.location.href='about'"
                    backgroundColor="#ffffff00"></button-component>
            </div>

        </div>

        <Learn_more  id="learn-more"></Learn_more>

    </div>

</template>



<script lang="ts">
import { ref, onMounted, type HtmlHTMLAttributes } from 'vue'
import Learn_more from '~/layouts/learn_more.vue';
import ButtonComponent from '~/components/ButtonComponent.vue';
let showTrack = false;

const second_row = [
    { title: "Simplicity & Accessibility", descr: "We belive that open-source projects should be simple to use and understand."},
    { title: "Data Ownership", descr: "We do not have access to any user data, ensuring complete privacy and independent ownership."},
    { title: "Open Source", descr:"Our projects are created for the public good and are available either free of charge or at minimal cost."}
];

export default {
    methods: {
        // Function to have the 'Track an asset' input field appear
        async trackingForm() {
            let trackAssetDiv = <HTMLDivElement>document.getElementById("trackAssetDiv");
            let trackButton = <HTMLDivElement>document.getElementById("unclicked");

            if (!showTrack) { //if showTrack is false
                showTrack = true;
                trackAssetDiv.style.visibility="visible"; //make text input available
                trackButton.style.backgroundColor = "#322253";

            } else { 
                showTrack = false; 
                trackAssetDiv.style.visibility="hidden";
                trackButton.style.backgroundColor = "#4E3681";
            }
        },
    }
}

</script>


<style scoped>

#first-row {
    background-image: url(../assets/images/hand-icon.png);
    background-repeat: no-repeat;
    background-position-x: 85%;
    background-position-y: bottom;
    background-size: 60%;
}

/* For screens less than 768px */
@media (max-width: 768px) {
    #first-row-col{
        padding: 41px 33px;
    }
    #second-row{
        padding: 40px 30px;
    }
    #second-row-cols{
        min-width: 370px;
        gap: 20px;
    }
    #second-row-cols-h4 {
        font-weight: 600;
    }
    #learn-more{
        padding: 40px 30px;
    }
    
}

/* For screens greater than 768px */
@media (min-width: 768px) {
    #first-row-col{
        padding: 60px 78px
    }
    #second-row {
        padding: 70px 126px;
    }
    #second-row-cols{
        gap: 40px;
    }
    #learn-more{
        padding: 70px 126px;
    }

}



</style>
