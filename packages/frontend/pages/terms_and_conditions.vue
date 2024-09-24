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
    <div class="container-fluid" id="about-container">
        <h1 class="text-iris">Terms & Conditions</h1>
        <div class="row"> <p>
            TK placeholder     TK 
        </p> </div>

    </div>

</template>

<style scoped>
/* For screens smaller than 768px */
@media (max-width: 768px) {
    #about-container{
        padding: 20px 20px 40px 20px;
    }
    .row{
        margin-top:20px;
    }


}

/* For screens larger than 768px */
@media (min-width: 768px) {
    #about-container{
        padding: 80px 200px 100px 200px;
    }
    .row{
        margin-top:32px;
    }

}

</style>

