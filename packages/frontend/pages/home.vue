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

        <div class="row" id="try">
            <div class="col-12 col-md-7" style="padding-top:60px; padding-left:78px;">
                <div class="row"> <h1>Trust and transparancy when you need it most.</h1> </div>
                <div class="row" style="padding: 18px 22px; margin-bottom: 60px;">
                    **buttons go here**
                </div>
                
            </div>

        </div>

        <div class="row bg-frost" style="padding: 70px 126px;" >
            <div class="row gx-4">
                <div class="col" v-for="item in second_row">
                    <h4 class="text-iris">{{item.title}}</h4>
                    <p class="text-eggplant" style="font-weight: 400;">{{ item.descr }}</p>         
                </div>
            </div>
            <div class="row justify-content-center pt-3">
                **This is where button goes.**
            </div>
        </div>

        <div class="row">
            This is the third row
        </div>



    </div>

</template>



<script lang="ts">
import { ref, onMounted } from 'vue'

const second_row = [
    { title: "Simplicity & Accessibility", descr: "We belive that open-source projects should be simple to use and understand."},
    { title: "Data Ownership", descr: "We do not have access to any user data, ensuring complete privacy and independent ownership."},
    { title: "Open Source", descr:"Our projects are created for the public good and are available either free of charge or at minimal cost."}
];


</script>


<style>

#try {
    background-image: url(../assets/images/hand-icon.png);
    background-repeat: no-repeat;
    background-position-x: 85%;
    background-position-y: bottom;
    background-size: 60%;
}



</style>
