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

<!-- TODO: Implement picture enlargement feature -->
<!-- TODO: Enure css matches figma design -->
<!-- TODO:Add captions to images -->
<script setup lang="ts">
    const route = useRoute()

    const lightboxOpen = ref(false)
    const lightboxIndex = ref(0)

    const dmeImages = [
        { src: '/dmdm-decisiontree.png', alt: 'Decision Tree', caption: 'DME graph 1' },
        { src: '/dmdm-recordhistory.jpg', alt: 'Record History', caption: 'DME graph 2' },
    ]

    function openLightbox(index: number) {
        lightboxIndex.value = index
        lightboxOpen.value = true
    }

    function closeLightbox() {
        lightboxOpen.value = false
    }

    // Add functions to navigte images in the lightbox
    function prevImage() {
    }
    function nextImage() {
    }

</script>


<template>
    <div class="container-fluid" id="dmdm-container">
        <div class="row" id="hero-container">
            <div id="hero-text">
                <h1>Making a Difference with DMDM</h1>
                <p style="font-weight: 400;" >
                    Manufacturing open source medical hardware at scale, while meeting quality assurance standards,
                    can sometimes be a mysterious process to the outside observer. Through the GOSQAS-sponsored
                    pilot program with Distributed Medical Device Manufacturing
                    (<a href="https://dmdm.icu/" class="dmdm-link">DMDM</a>),
                    this process is becoming more transparent and accessible.
                </p><br>
                <p style="font-weight: 400;">
                    As a non-profit, FDA-registered cooperative, DMDM is committed to manufacturing trustworthy and
                    reliable humanitarian aid while honoring democratic operation, flexibility and resilience.
                </p>
            </div>
            <div id="hero-video">
                <iframe src="https://player.vimeo.com/video/1169447155?h=4b7f6c0213&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                    style="width: 100%; display: block; aspect-ratio: 16 / 9;"
                    frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" title="How to Create a Group Record with Distributed Medical Device Manufacturing (DMDM)"></iframe>
                <p id="video-caption" style="font-size: 14px !important;">Video production by <a href="https://www.prodigium-pictures.com/" style="font-size: 14px;">Prodigium Pictures</a></p>
            </div>
        </div>

    
        <div class="row even-stripe">
            <h3>Open Source QMS</h3>
            <p>Sponsored by a GOSQAS grant, DMDM has open sourced their FDA and ISO13485:2016 compliant quality management system (QMS) for the manufacturing of pre-market exempt, non sterile, class I and class II medical devices. The QMS was designed for adoption by any group focused on high quality manufacturing, but especially for open source, small-scale community manufacturing groups where quality management resource capacity is more constrained.</p>
            <button class="btn btn-tertiary">View the DMDM QMS here</button>
        </div>

        <div class="row" id="dme-container">
            <div id="dme-text">
                <h3>Distributed Manufacturing Ecosystem (DME)</h3>
                <p>DMDM is developing the Distributed Manufacturing Ecosystem (DME) as an open-source software suite for production line management. Built upon the Global Distributed Tracking (GDT) codebase, DME is intended for small-scale, community manufacturing where documenting quality processes is paramount for user adoption and trust.</p>
                <p>DME enables realtime manufacturing throughput visualization by recording batch workflows, defects, reworks and a comprehensive device history file (DHF). A customizable tiered-checklist gating system monitors each stage of the manufacturing process down to the component level. Records are updated through GDT, which easily allows mobile phone interface.</p>
                <button class="btn btn-primary">Browse the DME codebase</button>
            </div>

            <div id="dme-graphics">
                <!-- image card for each graphic hooked up to lightbox for fullscreen viewing -->
                <div
                    v-for="(img, i) in dmeImages"
                    :key="i"
                    class="dme-image-card"
                    @click="openLightbox(i)"
                >
                    <img :src="img.src" :alt="img.alt" class="dmegraph" />
                    <button class="enlarge-btn" @click.stop="openLightbox(i)">
                        <!-- From Lucide Icons: https://lucide.dev/icons/zoom-in -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in-icon lucide-zoom-in"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
                        Click to enlarge
                    </button>
                </div>
            </div>
        </div>

        <!-- Lightbox for fullscreen images -->
        <Teleport to="body">
            <div v-if="lightboxOpen" class="lightbox-overlay" @click.self="closeLightbox">
                <button class="lightbox-close" @click="closeLightbox">&#x2715;</button>
                <div class="lightbox-content">
                    <img :src="dmeImages[lightboxIndex]?.src" :alt="dmeImages[lightboxIndex]?.alt" class="lightbox-img" />
                </div>
                <p class="lightbox-footer">
                    Image {{ lightboxIndex + 1 }} of {{ dmeImages.length }}
                </p>
            </div>
        </Teleport>
        
        <div class="row even-stripe">
            <h3>GDT for Class 1 Medical Device Manufacturing</h3>
            <p>Since 2024, DMDM has been using GDT in their FDA-registered manufacturing facility. Now, DMDM has released a comprehensive report describing how GDT helps them create documentation for tool maintenance, product defects, batch records, materials tracking, and post-market surveillance.</p>
            <button class="btn btn-tertiary">Read the report</button>
        </div>
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

h3{
    font-size: 32px !important;
    line-height: 50px !important;
    font-weight: medium;
}


.dmdm-link {
    font-weight: 400;
    overflow-wrap: break-word;
}

.dme-image-card {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
}

.dmegraph {
    width: 100%;
    height: auto;
    border-radius: 8px;
    display: block;
    border: 2px solid #ccc;
}


.enlarge-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 14px;
    cursor: pointer;
}


/* Lightbox Stuff */
.lightbox-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    gap: 1rem;
}

.lightbox-close {
    position: fixed;
    top: 20px;
    right: 20px;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lightbox-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 90vw;
    max-height: 80vh;
}

.lightbox-img {
    max-width: 80vw;
    max-height: 80vh;
    border-radius: 8px;
    object-fit: contain;
}

.lightbox-nav {
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.lightbox-footer {
    font-size: 14px;
    margin: 0;
}

.btn {
  box-sizing: border-box;
  height: 58px;
  padding: 0 24px;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 400;
  text-align: center;
  cursor: pointer;
  border: none;
  width: fit-content;
}

#hero-container {
    display: flex !important;
    flex-direction: column;
    gap: 32px;
    padding: 20px 126px 100px 126px !important;
}

#hero-text {
    display: flex;
    flex-direction: column;
}

#hero-text > h1 {
    padding-bottom: 20px;
}

#hero-video {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

#dme-container {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
}

#dme-text {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
}

#dme-graphics {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
}

.row > h3, p {
    padding: 0;
}


/* For screens smaller than 768px */
@media (max-width: 768px) {
    .row{
        padding: 40px 30px!important;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .even-stripe{
        margin: 0 !important;
    }

    #hero-container {
        padding: 20px 20px 40px 20px !important;
    }

    #dmdm-container{
        padding: 0 !important;
    }
    
    #dme-container {
        grid-template-columns: 1fr;
    }

    h3 {
        font-size: 24px !important;
        line-height: 36px !important;
        font-weight: 600;
    }

    p {
        font-size: 18px !important;
        line-height: 27px !important;
    }

    button {
        font-size: 18px !important;
        line-height: 27px !important;
        padding: 14px 18px !important;
    }
}

/* For screens larger than 768px */
@media (min-width: 768px) {
    /* #dmdm-container{
        padding: 80px 200px 100px 200px;
    } */
    .row{
        margin-top:32px;
        padding: 70px 126px;
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
    .even-stripe{
        background-color: #4E3681;
    }

    .btn-primary {
        background-color: #CCECFD;
        color: #1E2019;
    }

    .btn-primary:hover {
        background-color: #E6F6FF;
    }

    .btn-primary:active {
        color: #1E2019;
    }

    .btn-tertiary {
        background-color: transparent;
        color: #CCECFD;
        border: 2px solid #CCECFD;
    }    

    .btn-tertiary:hover,
    .btn-tertiary:active {
        background-color: #CCECFD;
        color: #000000;
        mix-blend-mode: lighten;
    }

    .enlarge-btn {
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
    }

    .lightbox-overlay {
        background: rgba(0, 0, 0, 0.85);
    }

    .lightbox-close {
        background: #555;
        color: #fff;
    }

    .lightbox-close:hover {
        background: #777;
    }

    .lightbox-nav {
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
    }

    .lightbox-nav:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .lightbox-footer {
        color: #ccc;
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
    .even-stripe{
        background-color: #E6F6FF;
    }

    .btn-primary {
        background-color: #4E3681;
        color: #FFFFFF;
    }

    .btn-tertiary {
        background-color: transparent;
        color: #322253;
        border: 2px solid #4E3681;
    }

    .btn-primary:hover {
        background-color: #322253;
    }

    .btn-tertiary:hover {
        background-color: #4E3681;
        color: #FFFFFF;
    }

    .enlarge-btn {
        background: rgba(255, 255, 255, 0.8);
        color: #1E2019;
    }

    .lightbox-overlay {
        background: rgba(0, 0, 0, 0.75);
    }

    .lightbox-close {
        background: #ddd;
        color: #1E2019;
    }

    .lightbox-close:hover {
        background: #bbb;
    }

    .lightbox-nav {
        background: rgba(0, 0, 0, 0.1);
        color: #1E2019;
    }

    .lightbox-nav:hover {
        background: rgba(0, 0, 0, 0.2);
    }

    .lightbox-footer {
        color: white;
    }
}
</style>
