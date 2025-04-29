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
        <h2 class="h2-text"> Interested in learning more? </h2>
        <p class ="mb-0" style="font-weight: 400;"> Learn more about Global Open Source Quality Assurance System (GOSQAS) by emailing us at 
            <span class="learn-more-desc text-decoration-underline" id="p-text"> gosqasystem@gmail.com</span> 
                    or visiting the links below.</p>
        <div>
            <RouterLink to="/how-it-works"><button-component class="button first learn-more" buttonText="How It Works" margin="20px 20px 0px 0px"></button-component></RouterLink>
            <RouterLink to="/data-privacy"><button-component class="button middle learn-more" buttonText="Data & Privacy"
                margin="20px 20px 0px 0px"></button-component></RouterLink>
            <button-component class="button learn-more" buttonText="GDT GitHub" onclick="window.location.href='https://github.com/gosqasorg/asset-provenance-tracking'"
                margin="20px 0px 0px 0px"></button-component>
        </div>
        
    </div>

</template>


<script lang="ts">
    export default {
        name: "learn_more"
    }

</script>


<style scoped>
    .learn-more-desc {
        font-weight: 400;
        overflow-wrap: break-word;
    }

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #learn-more {
        background-color: #1E2019
    }
    .h2-text {
        color: #CCECFD;
    }
    .mb-0 {
        color: #FFFFFF;
    }
    .learn-more-desc {
        color: #CCECFD;
    }
    #button first learn-more {
        color: #FFFFFF;
        backgroundColor: #FFFFFF;
    }
    #button middle learn-more {
        color: #FFFFFF;
        backgroundColor: #FFFFFF;
    }
    #button learn-more {
        color: #FFFFFF;
        backgroundColor: #FFFFFF;
    }
  
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #learn-more {
        background-color: #FFFFFF;
    }
    .h2-text {
        color: #4E3681;
    }
    .mb-0 {
        color: #4E3681;
    }
    .learn-more-desc {
        color: #4E3681;
    }
    #button first learn-more {
        color: #322253;
        backgroundColor: #ffffff00;
    }
    #button middle learn-more {
        color: #322253;
        backgroundColor: #ffffff00;
    }
    #button learn-more {
        color: #322253;
        backgroundColor: #ffffff00;
    }
}

</style>