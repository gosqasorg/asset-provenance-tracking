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
                <div class="row" style=" margin-bottom: 60px;">
                    <div class="col">
                        <button-component buttonText="Track an Asset"></button-component>
                    </div>
                    <div class="col">
                        <button-component buttonText="Create a Device" backgroundColor="#CCECFD" 
                            borderColor="#CCECFD" color="#1E2019"></button-component>
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
            <div class="row justify-content-center pt-3">
                <button-component buttonText="Learn more" color="#322253"
                    backgroundColor="#ffffff00"></button-component>
            </div>
        </div>

        <Learn_more  id="learn-more"></Learn_more>

    </div>

</template>



<script lang="ts">
import { ref, onMounted } from 'vue'
import Learn_more from '~/layouts/learn_more.vue';
import ButtonComponent from '~/components/ButtonComponent.vue';

const second_row = [
    { title: "Simplicity & Accessibility", descr: "We belive that open-source projects should be simple to use and understand."},
    { title: "Data Ownership", descr: "We do not have access to any user data, ensuring complete privacy and independent ownership."},
    { title: "Open Source", descr:"Our projects are created for the public good and are available either free of charge or at minimal cost."}
];


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
