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
    <div class="container-fluid" id="features-container">
        <h1>Data & Privacy</h1>
        <div class="row"> <p>
            Global Distributed Tracking encrypts user data and ensures its accessibility only through the unique record key, 
            which is linked to a QR code. A cryptographic hash function securely references data via the record key. 
            AES encryption with 128 bit keys is used along with SHA-256 for cryptographic hashing. 
            This process is performed in a zero-knowledge manner, ensuring that the Global Distributed Tracking team never stores or knows a key. 
            Only Global Distributed Tracking users, and individuals with whom they share a record key, have access to record history stored 
            within the key.
        </p> </div>


        <h1>API</h1>
        <div class="row"> 
            <h2>Overview</h2>
            <p>
                Integrating GDT into your product is easy. We offer API access to our services. This API is completely open. You don't even need an API key. 
            </p>
            <p>
                <strong>
                    The full docs and OpenAPI spec are available on our <a class="link bold-link" href="/docs">docs</a> page.
                </strong>
            </p>            

            <h2>Interactive API Examples</h2>
            <p>
                Explore the example below. These are real, live API requests. 
            </p>

<!--
            <h3>Example: Make a device key</h3>
            <p>
                For example, try this out. Each row is an endpoint. Look at the top row. Tap the blue "GET" button next to "/getNewDeviceKey". This opens the specs for this endpoint. Ignore these for now. At the top right, click the "Try it out" button. This will give you an execute button. Hit our backend services at that endpoint by tapping "Execute". 
            </p>
            <p>
                Scroll down, past the curl and url, until you see "Code" and "Details". Take a look at the response body. Note the seemingly random text that looks something like "F6K6PaqAzwibVohGtcw6HW". That's a new GDT Record Key. 
            </p>

            <p>
                Now go ahead and use the interactive spec to create a group: a GDT-labeled case of GDT-labeled items.
            </p>
-->

        </div>

        <div class="docs-section">
            <SwaggerUI spec-url="/openAPI-docs-sample.yaml" style="margin-bottom: 1.5rem;"/> 
        </div>
    

        <h1>Notification System</h1>
        <div class="row">
            <p>
                GDT is rolling out a Notification System, whereby users can receive email notifications whenever a record
                is updated. In any record or group, simply click the "Get Email Notifications" button. The process is easy:
            </p>
            <ol>
                <li>
                    First, a six digit code is sent to your email. Enter this into the dialog, and you're signed up!
                </li>
                <li>
                    Then, when the record receives an update, you'll receive an email.
                </li>
                <li>
                    Finally, if you wish to no longer receive updates, simply click the unsubscribe link in the email.
                </li>
            </ol>
            <p>
                Be sure to check your spam / all mail folder. 
            </p>
            <p>
                Note as of July 8th: we temporarily have limited email capacity, and are actively expanding over the next two weeks. 
            </p>
        </div>
    

        <h1>Coming Soon: Offline Mode</h1>
        <div class="row">
            <p>
                GOSQAS is working on adding an Offline Mode! This will allow our services to be used even when cell reception 
                drops: you'll be able to create records and groups, as well as edit existing records from your phone in the field. 
                Everything you make will be saved, and once you're back in a service area, just bring up the website and all 
                of what you made will be deployed.
            </p>
            <p>
                If you want to get an idea of how Offline Mode will work, take a look at our user guide, linked 
                <a class="link" href="/docs/GDT_Offline_PWA_User_Guide.pdf">here</a> and also below[1]. Please note that 
                this feature is a work in progress, and the steps shown in the guide will not work yet.
            </p>
            <p>
                GOSQAS Offline Mode will provide access to GDT in both emergency situations and everyday use in areas where coverage 
                can be inconsistent. When cell service is unreliable, Offline Mode will bridge the gaps between moments of 
                good reception.
            </p>
            <p>
                For example, imagine Alice and Bob are grassroots first responders in Western North Carolina who experienced 
                extensive cell/internet outage during a hurricane, especially in parts of the rural mountain areas that 
                historically struggle with good cell reception. Before going into the field, they set their phones up with 
                GOSQAS Offline Mode, providing them with uninterrupted documentation capabilities.
            </p>
            <ol>
                Links:
                <li>
                    <a class="link" href="/docs/GDT_Offline_PWA_User_Guide.pdf">https://gosqas.org/docs/GDT_Offline_PWA_User_Guide.pdf</a>
                </li>
            </ol>
        </div>


        <h1>Impact</h1>
        <div class="row"> 
            <p>
                Global Distributed Tracking is used around the world. Take a look <a class="link" href="/heatmap">here</a>.
            </p>
        </div>
        <learn_more></learn_more>

    </div>

</template>

<script lang="ts">
import Learn_more from '~/layouts/learn_more.vue';
</script>

<style scoped>
/* For screens smaller than 768px */
@media (max-width: 768px) {
    #features-container{
        padding: 20px 20px 40px 20px;
    }
    .row{
        margin-top:20px;
    }


}

/* For screens larger than 768px */
@media (min-width: 768px) {
    #features-container{
        padding: 80px 200px 100px 200px;
    }
    .row{
        margin-top:32px;
    }
    strong {
        font-size: 20px !important;
        line-height: 30px !important;
    }
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #features-container {
        background-color: #1E2019;
    }
    h1 {
        color: #CCECFD;
    }
    h2 {
        color: #CCECFD;
    }
    h3 {
        color: #CCECFD;
    }
    ol, li {
        color: #FFFFFF;
    }
    p {
        color: #FFFFFF;
    }
    .link {
        color: #CCECFD;
    }
  
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #features-container {
        background-color: #FFFFFF;
    }
    h1 {
        color: #4E3681;
    }
    h2 {
        color: #4E3681;
    }
    h3 {
        color: #4E3681;
    }
    ol, li {
        color: #1E2019;
    }
    p {
        color: #1E2019;
    }
    .link {
        color: #4E3681;
    }
}

ol {
    list-style-position: inside;
}

strong {
    font-size: 18px;
    line-height: 27px;
}

.link {
    overflow-wrap: break-word;
}

.bold-link {
    font-weight: bolder;
}

</style>

