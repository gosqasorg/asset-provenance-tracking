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

            <p> <span class="p-text-color" style="font-weight:600">Our current products</span> <br>
                Global Distributed Tracking - an open source software enabling closed-loop tracking for products, information, and logistics.</p>
        </div>

         <div class="row" >
          <h3>Global Distributed Tracking</h3>
          <p style="font-weight: 400;">The Global Open Soruce Quality Assurance System proudly presents Global Distributed Tracking (GDT)&mdash;a free and open-source tracking platform. By reducing fraud, theft, counterfeiting, and lost shipments with secure encryption and a simple user interface, GDT helps create trust through transparency for your organization. </p>
               <iframe src="https://player.vimeo.com/video/1083699280?h=941a4ccf67&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                       style="width: 100%; height: 480px;"
                       frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" title="Global Distributed Tracking">
               </iframe>
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
}

</style>
