<!-- how_it_works.vue
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
    This is the How it Works page for GOSQAS
-->

<script setup lang="ts">
const route = useRoute()
</script>

<template>
    <div class="container-fluid" id="how-it-works-container">
        <h1 style="margin-bottom:32px;">How It Works</h1>
        <div class="row" id="how-it-works">
            <p>Designed by Global Open Source Quality Assurance System (GOSQAS),
                Global Distributed Tracking (GDT) is a software platform enabling closed-loop tracking for products,
                information, and logistics.<br><br>

                Our development process is led by the mission of “Trust Through Transparency”. We've optimized Global
                Distributed Tracking to function in low-resource environments where internet and electricity access is
                limited.</p>

            <div class="row" id="targets">
                <ul style="font-size: 20px; font-weight: 600;">Global Distributed Tracking targets solutions in:</ul>
                <div class="col mx-2">
                    <li>Last mile verification</li>
                    <li>Fraud and theft prevention</li>
                </div>
                <div class="col">
                    <li>Quality Assurance</li>
                    <li>Donor/NGO Communication</li>
                </div>
            </div>

            <div class="row" id="features">
                <ul style="font-size: 20px; font-weight: 600;">Features include:</ul>
                <div class="col mx-2">
                    <li>Completely free service with no hidden fees</li>
                    <li>Fully encrypted data</li>
                    <li>Open source transparency</li>
                </div>
                <div class="col">
                    <li>No downloads</li>
                    <li>No-hassle security</li>
                    <li>Tamper-proof, append-only records</li>
                </div>
            </div>

        </div>

        <div class="row" id="overview">
            <h2 style="margin-bottom:25px">Overview</h2>
            <div class="col text-center" id="overview-cols">
                <img src="../assets/images/cross-icon.svg" style="height:50px; margin-bottom:20px" class="light-icon">
                <img src="../assets/images/darkmode-cross.svg" style="height:50px; margin-bottom:20px"
                    class="dark-icon">
                <p>1. Manufacturer creates a GDT identifier to share with testing agency</p>
            </div>
            <div class="col text-center" id="overview-cols">
                <img src="../assets/images/upload-icon.svg" style="height:40px; margin-bottom:30px" class="light-icon">
                <img src="../assets/images/darkmode-upload.svg" style="height:40px; margin-bottom:30px"
                    class="dark-icon">
                <p>2. Testing agency uploads documentation</p>
            </div>
            <div class="col text-center" id="overview-cols">
                <img src="../assets/images/check-icon.svg" style="height:50px; margin-bottom:20px" class="light-icon">
                <img src="../assets/images/darkmode-check.svg" style="height:50px; margin-bottom:20px"
                    class="dark-icon">
                <p>3. Distributor views information within GDT and verifies product</p>
            </div>
            <div class="col text-center" id="overview-cols">
                <img src="../assets/images/gosqas-icon.svg" style="margin-top: -55px;"
                    class="light-icon">
                <img src="../assets/images/darkmode-gosqas.svg"
                    style="margin-top: -55px;" class="dark-icon">
                <p>4. Medical staff received verified product and records shipment receipt in GDT</p>
            </div>

        </div>
        <div class="row" id="tutorials">
            <h2 style="margin-bottom:25px">Tutorials</h2>
            <div class="videos">
                <iframe
                    src="https://player.vimeo.com/video/1083699274?h=ff0b41174c&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                    style="width: 100%; height: 480px;" frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    title="Tutorial: Creating A Record"></iframe>
                <div class="divider"> </div>
                <iframe
                    src="https://player.vimeo.com/video/1083699286?h=e63a8e8c21&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                    style="width: 100%; height: 480px;" frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    title="Tutorial: Using A Record"></iframe>
                <div class="divider"> </div>
                <iframe src="https://player.vimeo.com/video/1086646484?h=f0cbc7fd6d&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                    style="width: 100%; height: 480px;" frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    title="Tutorial: How to Create a Group Record with Decentralized Medical Device Manufacturing (DMDM)"></iframe>
                <div class="divider"> </div>
            </div>
        </div>

        <Learn_more id="learn"></Learn_more>
    </div>
</template>

<script lang="ts">
import Learn_more from '~/layouts/learn_more.vue';
</script>

<style scoped>
.videos {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-around;
}

li {
    font-weight: 400;
    text-indent: -20px;
    margin-left: 20px;
}

#overview {
    margin-top: 48px;
}

#features {
    margin-top: 20px;
}

#learn {
    margin-top: 20px;
}



/* For screens smaller than 768px */
@media (max-width: 768px) {
    #how-it-works-container {
        padding: 20px 20px 40px 20px;
    }

    #overview-cols {
        min-width: 390px;
    }
}

/* For screens larger than 768px */
@media (min-width: 768px) {
    #how-it-works-container {
        padding: 80px 200px 100px 200px;
    }
}

.light-icon,
.dark-icon {
    display: none;
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #how-it-works-container {
        background-color: #1E2019;
    }

    div {
        background-color: #1E2019;
    }


    #tutorials {
        background-color: #1E2019;
    }

    .videos {
        background-color: #1E2019;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: space-around;
    }

    .dark-icon {
        display: inline;
    }

    h1,
    h2 {
        color: #CCECFD;
    }

    ul {
        color: #E6F6FF;
    }

    p,
    .col mx-2,
    .col {
        color: #FFFFFF;
    }
}

/* Light mode version*/
@media (prefers-color-scheme: light) {

    div {
        background-color: white;
    }

    .divider {
        background-color: #F1FAFE;
        width: 100%;
        height: 2em;
    }

    .videos {
        background-color: #F1FAFE;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: space-around;
    }

    #tutorials {
        background-color: #F1FAFE;
    }

    #how-it-works-container {
        background-color: #F1FAFE;
    }

    #how-it-works-container {
        background-color: #FFFFFF;
    }

    .light-icon {
        display: inline;
    }

    h1,
    h2 {
        color: #4E3681;
    }

    ul {
        color: #4E3681;
    }

    p,
    .col mx-2,
    .col {
        color: #1E2019;
    }
}
</style>
