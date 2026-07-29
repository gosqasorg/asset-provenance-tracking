<!-- index.vue
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
    This is the home page for GOSQAS
-->
<script setup lang="ts">
    const route = useRoute()
</script>

<template>
    <div class="container-fluid">
        <div class="row odd-stripe" id="first-row">
            <div class="col-12 col-md-7" id="first-row-col">
                <div class="row"> <h1 class="dark-mode-heading">Trust and transparency when you need it most.</h1> </div>
                <div class="row"> <h4 class="dark-mode-heading">Explore Global Distributed Tracking (GDT), our open source software enabling closed-loop tracking for products, information, and logistics.</h4> </div>
                <div class="row" style="display:inline-flex">
                    <form id="viewRecordButton" style="margin-right: 8px; width:40%; width: 190px; padding-right: 0px; margin-top: 20px;" @submit.prevent="trackDivVisible = !trackDivVisible">
                        <button-component class="button purple_btn" id="homeTrackButton" buttonText="View Record" type="submit" style="opacity:100;"
                            backgroundColor="#4E3681" borderColor="#4E3681" color="white" padding="18px 22px"></button-component>
                    </form>

                    <div id="createRecordButton" style="width: 60%; width: 230px; margin-top: 20px;">
                        <RouterLink to="/gdt"><button-component class="button blue_btn" id="homeCreateButton" buttonText="Create Record" backgroundColor="#CCECFD"
                            borderColor="#CCECFD" color="#1E2019" padding="18px 22px" margin="0px 0px 0px 0px"></button-component></RouterLink>
                    </div>

                    <div v-if=trackDivVisible id="homeTrackAssetDiv" style="height: auto; padding-bottom: 20px;">
                        <TrackAsset inputWidth="75%"></TrackAsset>
                    </div>
                    <div v-else style="padding-bottom: 20px;"></div>
                </div>
            </div>
        </div>


        <div class="row second-row" id="gdt-section">
            <div style="display:flex; flex-direction:column; gap: 17px;">
                <h3>Global Distributed Tracking</h3>    
                <p style="font-weight: 400;">The Global Open Source Quality Assurance System proudly presents Global Distributed Tracking (GDT)&mdash;a free and open-source tracking platform. By reducing fraud, theft, counterfeiting, and lost shipments with secure encryption and a simple user interface, GDT helps create trust through transparency for your organization. </p>
            </div>

            <div id="latest-news-banner">
                <img class="dmdm-image" src="/dmdm-logo.png">
                <div id="news-text-container">
                    <h4>Latest News</h4>
                    <p>See the latest updates from Distributed Medical Device Manufacturing (DMDM), where GDT is a foundational element of their FDA-required quality management system.</p>
                    <NavButton to="/dmdm" text="See our latest updates" id="news-button"/>
                </div>
            </div>

            <div>
                <iframe src="https://player.vimeo.com/video/1083699280?h=941a4ccf67&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                    style="width: 100%; display: block; aspect-ratio: 7 / 4;"
                    frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" title="Global Distributed Tracking">
                </iframe>
                <p id="video-caption" style="font-size: 14px;">Video production by <a href="https://www.prodigium-pictures.com/" style="font-size: 14px;">Prodigium Pictures</a></p>
            </div>  
        </div>

        <div class="row odd-stripe"  >
            <div class="row rowtest">
                <div class="col wrap-word" id="second-row-cols" v-for="item in second_row">
                    <h3 id="second-row-cols-h3">{{item.title}}</h3>
                    <p style="font-weight: 400;">{{ item.descr }}</p>
                </div>
            </div>
            <div class="col" style="text-align: center; margin-top: 50px; gap: 10px">
                <NavButton to="/about" text="About Us" id="about-button" margin="0" padding="18px 22px" style="margin: 10px 0;"/>
            </div>

        </div>

        <div class="row second-row" >
          <div class="ieeecontainer">
            <img src="/IEEE.png" alt="IEEE Logo" class="ieeeimage" />
            <div id="flexright">
              <h3>GDT Paper Published in the Institute of Electrical and Electronics Engineers</h3>
              <p class="text" style="font-size:20px; line-height:30px; font-weight: 400;">Our paper “Global Distributed Tracking of Supplies via Free-Libre Open Source Cryptography Obviating Authentication” was recently published in the October 2025 publication of IEEE.
              </p>
              <div class="col" >
                <button id="ieee-button" @click="getPDF()">Read the paper now</button>
                <NavButton to="/heatmap" text="See Our Global Impact" id="dmdm-button" margin="0" padding="18px 22px" style="margin: 0 10px;"/>
              </div>
            </div>

          </div>
          
        </div>

        <Learn_more id="learn-more"></Learn_more>

    </div>

</template>



<script lang="ts">
import Learn_more from '~/layouts/learn_more.vue';
import ButtonComponent from '~/components/ButtonComponent.vue';
import NavButton from '~/components/Buttons/NavButton.vue';
let showTrack = false;

const second_row = [
    { title: "Simplicity & Accessibility", descr: "We believe that open-source projects should be simple to use and understand."},
    { title: "Data Ownership", descr: "We do not have access to any user data, ensuring complete privacy and independent ownership."},
    { title: "Open Source", descr:"Our projects are created for the public good and are available free of charge."}
];

export default {
    components: { NavButton },
    data() {
    return {
    trackDivVisible: false
    }
    },

methods: {
    getPDF() {
        window.open('/Global_Distributed_Tracking.pdf', '_blank')
    }
}
}
</script>


<style scoped>

#latest-news-banner {
    max-width: 100%;
    display: flex;
    flex-direction: row;
    gap: 52px;
    padding: 30px 40px;
    border-radius: 15px;
    align-items: center;
    margin-left: 0.75rem;
}

#news-text-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
}

#news-text-container h4 {
    font-size: 24px;
    font-weight: 500;
    line-height: 36px;
    margin: 0;
}

#news-text-container p {
    font-size: 20px;
    font-weight: 400;
    line-height: 30px;
    margin: 0;
}

:deep(#news-button) {
    width: fit-content;
    padding: 18px 22px !important;
    border-radius: 10px;
}

#ieee-button {
    padding: 18px 22px;
    border-radius: 10px;
    border-width: 2px;
    border-style: solid;
    cursor: pointer;
    font-size: 20px;
}

#gdt-section {
    display: flex;
    flex-direction: column;
    gap: 50px;
}

.ieeecontainer {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;       /* Allows wrapping onto a new line */
    align-items: stretch;
    justify-content: space-around;
}

.ieeeimage {
  max-width: 12em;
  max-height: 12em;
  width: 100%;
  height: auto;
  border-radius: 10px;
  background-color: #FFFFFF;
}

.dmdm-image {
    width: 158px;
    height: 158px;
    background-color: #FFFFFF;
    border-radius: 10px;
}

#flexright {
    max-width: 70%;
    display: flex;
    flex-direction: column;
    gap: 20px
}

#first-row {
    /* Set the hand background image on the homepage */
    /*background-image: url(../assets/images/hand-icon.png);*/
    background-repeat: no-repeat;
    background-position-x: 85%;
    background-position-y: bottom;
    background-size: 60%;

    height: auto;
    display: flex;
    flex-wrap: wrap;
}

.odd-stripe {
    padding: 30px 39px;
}

/* For screens less than 991px resize hand logo*/
@media (max-width: 991px) {
    #first-row {
        background-size: 50% !important;
        height: auto;
    }
    .odd-stripe {
        background-size: 50% !important;
        height: auto;
    }
    h1 {
        font-size: 32px !important;
        line-height: 50px !important;
    }
    /* Remove extra padding on the right of the top white box */
    #first-row-col {
        width: 100% !important;
    }
    .dmdm-image {
        display: none;
    }
    :deep(#news-button) {
        display: block !important;
        text-decoration: none !important;
        font-size: 18px !important;
        margin: 0 auto !important;
        padding: 14px 18px !important;
    }

    #news-text-container h4 {
    font-size: 22px;
    line-height: 33px;
    }

    #news-text-container p {
        font-size: 18px;
        line-height: 27px;
    }

    #flexright {
        max-width: 100%;
    }

    #ieee-button {
        display:block;
        margin: 0 auto;
        padding: 14px 18px;
    }
}

/* For screens less than 768px */
@media (max-width: 768px) {
    #first-row-col{
        padding: 41px 33px 80px 33px;
    }
    .second-row{
        padding: 40px 30px;
    }
    #second-row-cols{
        gap: 20px;
    }
    #second-row-cols-h3 {
        font-weight: 600;
    }
    #learn-more{
        padding: 40px 30px;
    }
    .button{
        font-size: 18px;
    }
    #first-row {
        background-size: 60% !important;
    }
    #viewRecordButton {
        margin-right: 5px !important;
        width: 180px !important;
    }
    #createRecordButton {
        order: 1;
        margin-top: 0px !important;
    }
    :deep(#news-button) {
        text-align: center !important;
    }
}

/* For screens less than 381px resize hand logo */
@media (max-width: 381px) {
    #first-row {
        background-size: 90% !important;
        background-position-x: 95%;
    }
}

/* For screens greater than 768px */
@media (min-width: 768px) {
    #first-row-col{
        padding: 60px 78px;
    }
    .odd-stripe {
        padding: 60px 78px;
    }

    .second-row {
        padding: 70px 100px;
    }
    #second-row-cols{
        gap: 40px;
    }
    #learn-more{
        padding: 70px 100px;
    }
    .button{
        font-size: 20px;
        padding: 1px;

    }

}

@media (max-width: 1083px) {
    #first-row {
        background-size: 70%;
    }
}

/* Dark mode version of first row */
@media (prefers-color-scheme: dark) {
  .dark-mode-heading {
    color: #FFFFFF;
  }
  .odd-stripe{
        background-color: #1E2019;
  }
}

/* Dark mode version of second row */
@media (prefers-color-scheme: dark) {
    #first-row {
        background-image: url(../assets/images/darkmode-hand.png);
    }
    .second-row{
            background-color: #4E3681;
    }
    h3 {
        color: #FFFFFF;
    }
    p {
        color: #E6F6FF;
    }
    :deep(#about-button) {
        color: #FFFFFF;
        background-color: transparent;
        border: 2px solid #FFFFFF;
    }
    #ieee-button {
        color: #FFFFFF;
        background-color: #4E3681;
        border: 2px solid #FFFFFF;
    }
    .ieeeimage {
        border: 2px solid #FFFFFF;
    }
    #second-row-cols-h3 {
        color: #CCECFD;
    }
    :deep(#about-button:hover) {
        background-color: white;
        color: black;
    }

    :deep(#dmdm-button) {
        color: #FFFFFF;
        background-color: #4E3681;
        border: 2px solid #FFFFFF;
    }

    #ieee-button:hover {
        background-color: white;
        color: #4E3681;
    }
    #latest-news-banner {
        background-color: #1E2019;
    }

    #news-text-container h4 {
        color: #CCECFD;
    }

    #news-text-container p {
        color: #FFFFFF;
    }

    :deep(#news-button) {
        color: white !important;
        background-color: transparent !important;
        border: 2px solid white !important;
    }

    :deep(#news-button):hover {
        background-color: white !important;
        color: #000000 !important;
    }

    :deep(#dmdm-button:hover) {
        background-color: white;
        color: #4E3681;
    }
}
/* Light mode version of second row */
@media (prefers-color-scheme: light) {
    #first-row {
        background-image: url(../assets/images/hand-icon.png);
    }
    .second-row {
            background-color: #E6F6FF;
        }

    h3 {
        color: #4E3681;
    }
    p {
        color: #322253;
    }
    :deep(#about-button) {
        color: #1E2019;;
        background-color: #CCECFD;
        border: 2px solid #CCECFD;
    }
    #ieee-button {
        color: #322253;
        background-color: #E6F6FF;
        border: 2px solid #4E3681;
    }
    :deep(#about-button:hover) {
        background-color: #E6F6FF;
        border: 2px solid #E6F6FF;
    }

    :deep(#dmdm-button) {
        color: #322253;
        background-color: #E6F6FF;
        border: 2px solid #4E3681;
    }
    #ieee-button:hover {
        background-color: #4E3681;
        color: white;
    }
    #latest-news-banner {
        background-color: #4E3681;
    }

    #news-text-container h4 {
        color: #CCECFD;
    }

    #news-text-container p {
        color: #FFFFFF;
    }

    :deep(#news-button) {
        color: white !important;
        background-color: transparent !important;
        border: 2px solid white !important;
    }

    :deep(#dmdm-button:hover) {
        background-color: #4E3681;
        color: white;
    }

    :deep(#news-button):hover {
        background-color: white !important;
        color: #4E3681 !important;
    }
}

</style>
