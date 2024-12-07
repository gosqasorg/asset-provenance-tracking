<!-- 
Copyright (C) 2024 GOSQAS
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
    This is the section of "Interested in learning more?" at the end of pages
-->


<template>

    <div class="row" id="learn-more">
        <h2 class="text-iris"> Interested in learning more? </h2>
        <p class ="mb-0" style="font-weight: 400;"> Learn more about Global Open Source Quality Assurance System (GOSQAS) by emailing us at 
        <span style="font-weight: 400; overflow-wrap: break-word;" class="learn-more-desc text-decoration-underline text-iris"> gosqasystem@gmail.com</span> 
                    or visiting the links below.</p>
        <div>
            <button-component class="button first learn-more" buttonText="How It Works" color="#322253" onclick="window.location.href='how-it-works'"
        backgroundColor="#ffffff00" margin="20px 20px 0px 0px"></button-component>
            <button-component class="button middle learn-more" buttonText="Data & Privacy" color="#322253" onclick="window.location.href='data-privacy'"
        backgroundColor="#ffffff00" margin="20px 20px 0px 0px"></button-component>
            <button-component class="button learn-more" buttonText="GDT GitHub" color="#322253" onclick="window.location.href='https://github.com/gosqasorg/asset-provenance-tracking'"
        backgroundColor="#ffffff00" margin="20px 0px 0px 0px"></button-component>
        </div>
        
    </div>

</template>


<script lang="ts">
    export default {
        name: "learn_more"
    }

</script>
