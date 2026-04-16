<!-- home.vue
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
    <div class="container-fluid" id="data-privacy-container">
    <video ref="video" autoplay muted playsinline></video>
    <canvas ref="canvas"></canvas>
    <input type="button" @click="qrCameraOffline" accept="image/*" capture="environment" />

        <h1>Data & Privacy</h1>
        <div class="row"> <p>
            Global Distributed Tracking encrypts user data and ensures its accessibility only through the unique record key, 
            which is linked to a QR code. A cryptographic hash function securely references data via the record key. 
            AES encryption with 128 bit keys is used along with SHA-256 for cryptographic hashing. 
            This process is performed in a zero-knowledge manner, ensuring that the Global Distributed Tracking team never stores or knows a key. 
            Only Global Distributed Tracking users, and individuals with whom they share a record key, have access to record history stored 
            within the key.
        </p> </div>


        <h1>API Overview</h1>
        <div class="row"> <p>
            Global Distributed Tracking exposes our services by API, allowing simple integration with user software systems. 
        </p> </div>

        <div class="docs-section">
            <SwaggerUI />
        </div>
    
        <learn_more></learn_more>

    </div>

</template>

<script lang="ts">
import Learn_more from '~/layouts/learn_more.vue';
import jsQR from 'jsqr';
import { ref, onMounted, onBeforeUnmount } from 'vue'

const video = ref()
const canvas = ref()
export default {

methods: {
    qrCameraOffline () {

        try {
            navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}}).then((stream) => {
                video.value.srcObject = stream;
                video.value.play()
            })


            if (video.value.readyState === video.value.HAVE_ENOUGH_DATA) {
                canvas.value.width = video.value.videoWidth;
                canvas.value.height = video.value.videoHeight;

                const ctx = canvas.value.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.value.width, canvas.value.height);
                const imageData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
                const qrdata = jsQR(imageData.data, imageData.width, imageData.heigth);
            }
        } 
        catch (error) {
            alert(error);
        }


        }
            }
        }




</script>

<style scoped>
/* For screens smaller than 768px */
@media (max-width: 768px) {
    #data-privacy-container{
        padding: 20px 20px 40px 20px;
    }
    .row{
        margin-top:20px;
    }


}

/* For screens larger than 768px */
@media (min-width: 768px) {
    #data-privacy-container{
        padding: 80px 200px 100px 200px;
    }
    .row{
        margin-top:32px;
    }

}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #data-privacy-container {
        background-color: #1E2019;
    }
    h1 {
        color: #CCECFD;
    }
    p {
        color: #FFFFFF;
    }
  
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #data-privacy-container {
        background-color: #FFFFFF;
    }
    h1 {
        color: #4E3681;
    }
    p {
        color: #1E2019;
    }
}

</style>

