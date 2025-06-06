<!-- dmdm.vue
Copyright (C) 2025 GOSQAS
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
    This is the Decentralized Medical Device Manufacturing (DMDM) page for GOSQAS
-->
<script setup lang="ts">
    const route = useRoute()
</script>


<template>
    <div class="container-fluid" id="dmdm-container">
        <h1>Making a Difference with DMDM</h1>
        <div class="row">
            <p style="font-weight: 400; margin-bottom: 30px;" >
    Manufacturing open source medical hardware at scale, while meeting quality assurance standards,
    can sometimes be a mysterious process to the outside observer. Through GOSQAS-sponsored
    pilot program with Decentralized Medical Device Manufacturing (DMDM), this process is
    becoming more tranparent and accessible.
            </p>
        </div>

        <div class="row"  style="font-weight: 400;">
    <h3>Open Source:</h3>
            <div class="flexcontainer">
<ul>
  <li>Design</li>
  <li>QMS</li>
</ul>
 <ul>
  <li>Product Testing</li>
  <li>Logistics Management</li>
</ul>
    </div>
        </div>

        <iframe src="https://player.vimeo.com/video/1083699280?h=941a4ccf67&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                       style="width: 100%; height: 540px;"
                       frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" title="Global Distributed Tracking">
         </iframe>

    </div>
</template>



<style scoped>

.flexcontainer {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;       /* Allows wrapping onto a new line */
  align-items: stretch;
  justify-content: space-between;
}

.dmdm-btn {
    font-size: 18px;
    font-weight: 400;
    line-height: 31px;

    /*background-color: #4e3681;
    border: #4e3681;
    color: white;*/
    padding: 10px 20px;
    border-radius: 10px;

    display: block;
    width: 100%;
    white-space: normal;
}

@media (min-width: 768px) {
   .dmdm-btn {
        font-size: 20px;
        font-weight: 400;
        line-height: 34px;
   }
}

/* For screens smaller than 768px */
@media (max-width: 768px) {
    #dmdm-container{
        padding: 20px 20px 40px 20px;
    }
    .row{
        margin-top:32px;
    }
}

/* For screens larger than 768px */
@media (min-width: 768px) {
    #dmdm-container{
        padding: 80px 200px 100px 200px;
    }
    .row{
        margin-top:32px;
    }
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #dmdm-container {
        background-color: #1E2019
    }
    h1 {
        color: #CCECFD;
    }
    p {
        color: #FFFFFF;
    }
    .dmdm-btn {
        background-color: #CCECFD;
        border: #CCECFD;
        color: black;
    }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #dmdm-container {
        background-color: #FFFFFF;
    }
    h1 {
        color: #4E3681;
    }
    p {
        color: #1E2019;
    }
    .dmdm-btn {
        background-color: #4e3681;
        border: #4e3681;
        color: white;
    }
}
</style>
