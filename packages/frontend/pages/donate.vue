<!-- donate.vue
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
    This is the Donation page for GOSQAS
-->
<script setup lang="ts">
    const route = useRoute()
</script>


<template>
    <div class="container-fluid" id="donate-container">
        <h1>Support GOSQAS</h1>
        <div class="row">
            <p style="font-weight: 400; margin-bottom: 30px;" > The Global Open Source Quality Assurance System (GOSQAS)
                creates open-source technology to encourage better practices in the diverse humanitarian response,
                open-source hardware, and scientific research communities.<br><br>
                We believe that all communities, regardless of location or resource environment, deserve tools that
                increase accessibility to quality information and products.<br><br>
            </p>
        </div>

        <iframe src="https://player.vimeo.com/video/1083699280?h=941a4ccf67&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
            style="width: 100%; display: block; aspect-ratio: 7 / 4;"
            frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" title="Global Distributed Tracking">
         </iframe>
         <p id="video-caption" style="font-size: 14px;">Video production by <a href="https://www.prodigium-pictures.com/" style="font-size: 14px;">Prodigium Pictures</a></p>

        <form class="mt-3 mb-3" action="https://www.paypal.com/donate" method="post" target="_top">
            <input type="hidden" name="hosted_button_id" value="L4XU6TL2UYSA2" />
            <input type="submit" class="donate-btn" value="Make a Donation on Paypal" />
        </form>
        <div class="row">
          <p>
          GOSQAS/GDT is a project of Public Invention, a tax-exempt nonprofit organization under section
                501(c)(3) in the United States. Contributions by check should be made payable to “Public Invention”
                and include “GOSQAS” in the memo line to designate your support.<br><br>
                Our EIN is 83-4036254.<br><br>
                Mailing Address:<br>
                Public Invention<br>
                1709 Norris Dr.<br>
        Austin, TX, 78704, USA</p>
        </div>
    </div>
</template>



<style scoped>
.donate-btn {
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
   .donate-btn {
        font-size: 20px;
        font-weight: 400;
        line-height: 34px;
   }
}

/* For screens smaller than 768px */
@media (max-width: 768px) {
    #donate-container{
        padding: 20px 20px 40px 20px;
    }
    .row{
        margin-top:32px;
    }
}

/* For screens larger than 768px */
@media (min-width: 768px) {
    #donate-container{
        padding: 80px 200px 100px 200px;
    }
    .row{
        margin-top:32px;
    }
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #donate-container {
        background-color: #1E2019
    }
    h1 {
        color: #CCECFD;
    }
    p {
        color: #FFFFFF;
    }
    .donate-btn {
        background-color: #CCECFD;
        border: #CCECFD;
        color: black;
    }
    .donate-btn:hover {
        background-color: #e6f6ff;
    }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #donate-container {
        background-color: #FFFFFF;
    }
    h1 {
        color: #4E3681;
    }
    p {
        color: #1E2019;
    }
    .donate-btn {
        background-color: #4e3681;
        border: #4e3681;
        color: white;
    }
    .donate-btn:hover {
        background-color: #322253;
    }
}
</style>
