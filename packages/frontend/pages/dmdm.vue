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
            <p style="font-weight: 400;" >
                Manufacturing open source medical hardware at scale, while meeting quality assurance standards, 
                can sometimes be a mysterious process to the outside observer. Through the GOSQAS-sponsored 
                pilot program with Distributed Medical Device Manufacturing 
                (<a href="https://dmdm.icu/" class="dmdm-link">DMDM</a>), 
                this process is becoming more transparent and accessible.
            </p><br>
            <p style="font-weight: 400; margin-bottom: 30px;">
                As a non-profit, FDA-registered cooperative, DMDM is committed to manufacturing trustworthy and 
                reliable humanitarian aid while honoring democratic operation, flexibility and resilience. 
                While manufacturing the open source Glia tourniquet for Sudan, Gaza, and Lebanon, DMDM used 
                Global Distributed Tracking (GDT) as part of their open source Quality Management System (QMS) 
                and logistics management. Watch our video to learn how the GDT Group Record helps document 
                their open source process.
            </p>
        </div>

        <div class="row"  style="font-weight: 400;">
    <h3>Open Source:</h3>
            <div class="flexcontainer">
<ul>
    <li>Design</li>
</ul>
<ul>
    <li>QMS</li>
</ul>
<ul>
    <li>Product Testing</li>
</ul>
<ul>
    <li>Logistics Management</li>
</ul>
    </div>
        </div>

    <iframe src="https://player.vimeo.com/video/1086646484?h=f0cbc7fd6d&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
        style="width: 100%; display: block; aspect-ratio: 7 / 4;"
        frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" title="How to Create a Group Record with Distributed Medical Device Manufacturing (DMDM)"></iframe>
    <p id="video-caption" style="font-size: 14px;">Video production by <a href="https://www.prodigium-pictures.com/" style="font-size: 14px;">Prodigium Pictures</a></p>

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

.dmdm-link {
    font-weight: 400;
    overflow-wrap: break-word;
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
    .dmdm-link {
        font-size: 20px;
    }
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #dmdm-container {
        background-color: #1E2019
    }
    h1,h3 {
        color: #CCECFD;
    }

    p,li {
        color: #FFFFFF;
    }
    .dmdm-link {
        color: #CCECFD;
    }
    #video-caption {
      color: #FFFFFF; 
    }
    #video-caption a {
      color: #CCECFD; 
    }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #dmdm-container {
        background-color: #FFFFFF;
    }
    h1,h3 {
        color: #4E3681;
    }
    p,li {
        color: #1E2019;
    }
    .dmdm-link {
        color: #4E3681;
    }
    #video-caption {
    color: #1E2019; 
    }  
    #video-caption a {
    text-decoration: underline;
    color: #4E3681; 
    }
}
</style>
