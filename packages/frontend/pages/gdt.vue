<!-- gdt.vue

© 2024 Global Open Source Quality Assurance System. All rights reserved.
We are committed to keeping our code open source, but all GOSQAS and GDT
branding, including logos, is subject to the copyright above.

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
    This is the landing page where you can create a new record to track
-->
<template>
    <div v-if="!isLoading" class="gdt" id="gdt-container">
        <div class="container-md">
            <h1 class="my-4 fs-1">Global Distributed Tracking</h1>


            <!-- create toggle for single or group  -->
            <ButtonsLargeToggle
                @toggle-change="toggleView"
                :left-label="'New Record'"
                :right-label="'New Group'"
            />

            <!-- <div>Create a Single Asset:</div> -->
            <div id="create_record"><FormsCreateDevice/></div>
            <!-- <CreateDevice/> -->
            <!-- <div>Or, if you want to create a group of keys:</div> -->
            <!-- <div></div> -->

            <div id="create_group" style="display:none"><FormsCreateContainer/></div>


            <div class="col" style="text-align: left;">
              <HowItWorks margin="25px 15px 0 0"/>

              <RouterLink to="/dmdm"><button class="baseButton button" id="learn-more-button" style="
                  border-width: 2px;
                  border-style: solid;
                  padding: 10px 20px;
                  margin: 15px 15px 0px 0px;
                  font-size: 20px;
                  border-radius: 10px;
                "
              >
              Our Pilot Program
              </button></RouterLink>

              <a class="baseButton button" id="learn-more-button" href="user_manual.pdf"
                style="
                  border-width: 2px;
                  border-style: solid;
                  padding: 10px 20px;
                  margin: 15px 0px 0px 0px;
                  font-size: 20px;
                  border-radius: 10px;
                  text-decoration: none;
                  white-space: nowrap;
                  display: inline-block;
                "
              >
              User Manual
              </a>
          </div>


            <p class="my-4 mb-5 form-control">
                Global Distributed Tracking is a free, open source, and fully encrypted software solution enabling closed-loop tracking for products, information, and logistics.
            </p>


        </div>
    </div>
    <div v-else id="loading-screen">
        <p class="text-center pb-5 pt-5">Creating record(s)...</p>
    </div>
 </template>

<script lang="ts">
import { EventBus } from '~/utils/event-bus';
import HowItWorks from '~/components/Buttons/HowItWorks.vue';

export default {
    components: { HowItWorks },
    data() {
        return {
            isLoading: false,
        }
    },
    mounted() {
        // switch to loading screen when a form is submitted
        EventBus.on('isLoading', () => {
            this.isLoading = true;
        })
    },
    methods: {
        toggleView() {
            const toggle = document.getElementById("toggle") as HTMLInputElement;
            const createRecord = document.getElementById("create_record");
            const createGroup = document.getElementById("create_group");
            if (toggle.checked) {
                createRecord.style.display = "none";
                createGroup.style.display = "block";
            } else {
                createRecord.style.display = "block";
                createGroup.style.display = "none";
            }
        }
    }
}

</script>


<style scoped>

/* Hide the original checkbox */
.toggleCheckbox {
    display: none;
}

/* Container for the toggle switch */
.toggle-container {
    display: flex;
    justify-content: left;
    margin: 0 auto;
    padding: 10px;
    width: 500px;
    height: 70px;
    border-radius: 20px 0px 20px 0px;
}

/* Custom toggle switch */
.toggle-label {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: fit-content;
    border-radius: 25px;
    cursor: pointer;
    overflow: hidden; /* Ensure no overflow */
}

/* Create the toggle slider */
.toggle-label::before {
    content: '';
    position: absolute;
    width: 50%; /* Half of the label width */
    height: 100%;
    top: 0;
    left: 0;
    border-radius: 25px;
    transition: left 0.3s;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3); /* Add a shadow for better visibility */
}

/* Text containers */
.toggle-label div {
    padding: 10px;
    text-align: center;
    z-index: 1;
    font-weight: bold;
}

/* Adjust text colors when checked */
.toggleCheckbox:checked + .toggle-label::before {
    left: 50%;
}

.my-4 {
    margin: 1.5rem 0;
}

.fs-1 {
    font-size: 48px;
}

.ms-1 {
    margin-left: 0.25rem;
}

.mb-3 {
    margin-bottom: 1rem;
}

#gdt-container,
#loading-screen {
    width: 100%;
}

@media (min-width:768px) {
    .fs-1 {
        font-size: 32px;
    }
}

#gdt-container {
        padding: 5px 5px 5px 5px
    }

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    #gdt-container,
    #loading-screen {
        background-color: #1E2019;
    }
    h1 {
        color: #CCECFD;
    }
    p {
        color: #FFFFFF;
        background-color: #1E2019;
    }
    .form-control {
        background-clip: padding-box;
        background-color: #1E2019;
    }
    #learn-more-button:hover {
        background-color: #CCECFD;
        color: black;
    }
    #learn-more-button {
        color: #CCECFD;
        background-color: #1E2019;
        border: 2px solid #CCECFD;
    }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    #gdt-container {
        background-color: #FFFFFF;
    }
    h1 {
        color: #4E3681;
    }
    p {
        color: black;
        background-color: #FFFFFF;
    }
    .form-control {
        background-clip: padding-box;
        background-color: #FFFFFF;
    }
    #learn-more-button:hover {
        background-color: #4e3681;
        color: white;
    }
    #learn-more-button {
        color: #322253;
        background-color: #FFFFFF;
        border: 2px solid #4E3681;
    }
}

</style>
