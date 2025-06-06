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
    <div class="gdt" id="gdt-container">
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


            <div class="col" style="text-align: center; margin-top: 50px;">
              <RouterLink to="/how-it-works"><button class="baseButton button" id="about-button" style="
                  border-width: 2px;
                  border-style: solid;
                  padding: 10px 20px;
                  margin: 0px;
                  font-size: 20px;
                  border-radius: 10px;
                "
              >
              How It Works
              </button></RouterLink>
              <RouterLink to="/about"><button class="baseButton button" id="about-button" style="
                  border-width: 2px;
                  border-style: solid;
                  padding: 10px 20px;
                  margin: 0px;
                  font-size: 20px;
                  border-radius: 10px;
                "
              >
              Our Pilot Program
              </button></RouterLink>
          </div>


            <p class="my-4 mb-5 form-control">
                The Global Open Source Quality Assurance System (GOSQAS) enables transparent documentation through our Global Distributed Tracking (GDT) system, allowing secure data logging for low-resource settings and promoting global communication in humanitarian response, open source hardware, and scientific research.
            </p>


        </div>
    </div>
 </template>

<script lang="ts">

export default {

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
    #gdt-container {
        background-color: #1E2019
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
}

</style>
