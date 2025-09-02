<!-- about.vue
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
    This is the About Us page for GOSQAS
-->
<script setup lang="ts">
    const route = useRoute()
</script>


<template>
    <div class="container-fluid" id="about-container">
        <h1>About Us</h1>
        <div class="row">
            <p style="font-weight: 400; margin-bottom: 30px;" > The Global Open Source Quality Assurance System (GOSQAS) creates
                opportunities for better practices across the diverse humanitarian
                response, open-source hardware, and scientific research
                communities. We employ open-source tools and principles to centralize
                user solutions, despite location or resource environment. </p>

      <p>
        <span class="p-text-color" style="font-weight: 600">Our team</span> <br />
        Our team is part of Public Invention, a volunteer-based organization making a difference
        by inventing in the public, for the public. <br />
        <a class="team-desc" href="https://www.pubinv.org/gosqas-team/"
          >Learn more about our team</a
        >
      </p>

            <p> <span class="p-text-color" style="font-weight:600">Our current products</span> <br>
                Global Distributed Tracking - an open source software enabling closed-loop tracking for products, information, and logistics.</p>
                <iframe src="https://player.vimeo.com/video/1083699280?h=941a4ccf67&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                       style="width: 100%; height: 600px; border: none; display: block;"
                       frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" title="Global Distributed Tracking">
               </iframe>
               <p id="video-caption" style="font-size: 14px;">Video production by <a href="https://www.prodigium-pictures.com/" style="font-size: 14px;">Prodigium Pictures</a></p>
        </div>

        <div class="row" >
        <RouterLink to="/how-it-works"><button class="baseButton button first about-button" id="about-button" style="
                  border-width: 2px;
                  border-style: solid;
                  padding: 10px 20px;
                  margin: 20px 20px 0px 0px;
                  font-size: 18px;
                  border-radius: 10px;
                  width: 100%;
                ">
                    How It Works
                </button></RouterLink>
        
        <div class="dmdm" >
                  <img src="../assets/images/dmdm-lightmode.svg" style="width: 100%; margin-bottom:20px; margin-top:20px" class="dmdm-image lightmode-dmdm">
                 <img src="../assets/images/dmdm-darkmode.svg" style="width: 100%; margin-bottom:20px; margin-top:20px" class="dmdm-image darkmode-dmdm">
                <div class="dmdm-description" style="max-width: 100%;">
                    <p class="dmdm-header">Decentralized Medical Device Manufacturing (DMDM)</p>
                    <p class="dmdm-text">Inspired by the need for life-saving tourniquets in Sudan and Gaza, the FDA–registered Decentralized Medical Device Manufacturing (DMDM) team in Arizona piloted Global Distributed Tracking as an essential tool in their open-source manufacturing process. Explore how the DMDM and GOSQAS partnership expands open-source technology access for medical device compliance and distribution.</p>
                </div>
        </div>
                

        <RouterLink to="/dmdm"><button class="baseButton button first about-button" id="about-button" style="
                  border-width: 2px;
                  border-style: solid;
                  padding: 10px 20px;
                  margin: 20px 20px 0px 0px;
                  font-size: 18px;
                  border-radius: 10px;
                  width: 100%;
                ">
                    View our pilot program
                </button></RouterLink>
        </div>

        <div class="row">
            <h2 id="subtitle">Our Mission: Trust Through Transparency</h2>
            <p>As an open-source organization, GOSQAS prioritizes transparency in all projects. Because we know that
                openness and clarity build trust and promote wide user adoption, our commitment to Trust Through Transparency
                (TTT) ensures our initiatives are enacted with integrity and accountability.</p>
        </div>

        <div class="row">
            <h2 id="subtitle">Our Values</h2>
            <p> <span class="p-text-color" style="font-weight:600">Data Ownership</span> <br>
                Users maintain full ownership of the data generated within the GOSQAS flagship product, Global Distributed Tracking.
                We do not have access to any user data, ensuring complete privacy and independent ownership.</p>
            <p> <span class="p-text-color" style="font-weight:600">Simplicity & Accessibility</span> <br>
                All users, especially laypersons in limited resource environments, have access to GOSQAS projects.
                We believe that open-source projects should be simple to use and understand.</p>
            <p> <span class="p-text-color" style="font-weight:600">Open Source</span> <br>
                Our projects are created for the public good and are available either free of charge or at minimal cost,
                reinforcing our dedication to community benefit and accessibility.</p>
        </div>

            <Learn_more></Learn_more>

    </div>

</template>


<script lang="ts">
import ButtonComponent from '~/components/ButtonComponent.vue';
import Learn_more from '~/layouts/learn_more.vue';

export default {
    components: {
        ButtonComponent
    }
};
</script>

<style scoped>


/* For screens smaller than 768px */
@media (max-width: 768px) {
    #about-container{
        padding: 20px 20px 40px 20px;
    }
    .row{
        margin-top:32px;
    }
    #subtitle{
        margin-bottom:16px
    }
    .dmdm{
        flex-direction: column;
        align-items: center;
    }

    .dmdm-description {
        max-width: 100%;
        margin-top: 15px;
        font-size: 18px;
    }

    .dmdm-image {
        height: auto;
        width: 100%;
        height:390px;
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
    #subtitle{
        margin-bottom:20px
    }
    .dmdm-image {
        height: auto;
        width: 100%;
        height: 235px;
    }
    .dmdm-description {
        max-width: 100%;
        margin-top: 15px;
        font-size: 18px;
        margin-left:40px;
    }
    .team-desc {
        font-size: 20px;
    } 
}

.dmdm {
    display: flex;
    align-items: center; 
  }

.lightmode-dmdm,
.darkmode-dmdm {
    display: none;
}


/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #about-container {
        background-color: #1E2019
    }
    h1,
    h2 {
        color: #CCECFD;
    }
    .p-text-color {
        color: #E6F6FF;
    }
    p {
        color: #FFFFFF;
    }
    #about-button {
        color: white;
        background-color: #1E2019;
        border: 2px solid #CCECFD;
    }
    .dmdm-header {
        margin-bottom:12px;
        margin-top:-20px;
        font-weight: 600;
        color: #CCECFD;
    }
    .darkmode-dmdm {
        display: inline;
    }
    #video-caption {
      color: #FFFFFF; 
    }
    #video-caption a {
      color: #CCECFD; 
    }
  .team-desc {
    color: #CCECFD; 
  }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #about-container {
        background-color: #FFFFFF;
    }
    h1,
    h2 {
        color: #4E3681;
    }
    .p-text-color {
        color: #4E3681;
    }
    p {
        color: #1E2019;
    }
    #about-button {
        color: #322253;
        background-color: #FFFFFF;
        border: 2px solid #322253;
    }
    .dmdm-header {
        margin-bottom:15px;
        margin-top:-20px;
        font-weight: 600;
        color: #4E3681;
    }
    .dmdm-text {
        margin-bottom:5px;
        color: #1E2019;
    }
    .lightmode-dmdm {
        display: inline;
    }
  .team-desc {
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
