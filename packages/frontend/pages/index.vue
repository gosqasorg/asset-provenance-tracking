<!-- index.vue -- adjusting container
Copyright (C) 2024 GOSQAS Team
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
    This is the landing page where you can create a new device to track
-->
<template>
    <link href="https://fonts.google.com/specimen/Poppins" rel="stylesheet" type="text/css">
 
 
    <div class="container-md">
        <h1 class="my-4 text-iris fs-1">Global Distributed Tracking</h1>
 
 
        <!-- create toggle for single or container  -->
        <ButtonsLargeToggle @toggle-change="toggleView" />
    
        <!-- <div>Create a Single Asset:</div> -->
        <div id="create_device"><FormsCreateDevice/></div>
        <!-- <CreateDevice/> -->
        <!-- <div>Or, if you want to create a group of keys:</div> -->
        <!-- <div></div> -->
       
        <div id="create_container" style="display:none"><FormsCreateContainer/></div>
 
 
        <h5 class="my-4">
            The Global Open Source Quality Assurance System (GOSQAS) provides the opportunity to create truthful, transparent documentation via our open source provenance tracker, Global Distributed Tracking (GDT). Designed specifically for low-resource settings, GDT allows anyone with simple website access to securely record their project data. Our development philosophy of “Trust Through Transparency” (TTT) encourages better global communication within diverse communities- to include humanitarian response, open source hardware, and scientific research.
        </h5>
 
 
    </div>
 </template>

<script lang="ts">

export default {
    
    methods: {
        toggleView() {
            const toggle = document.getElementById("toggle") as HTMLInputElement;
            const createDevice = document.getElementById("create_device");
            const createContainer = document.getElementById("create_container");
            if (toggle.checked) {
                createDevice.style.display = "none";
                createContainer.style.display = "block";
            } else {
                createDevice.style.display = "block";
                createContainer.style.display = "none";
            }
        }
    }
}

</script>


<style scoped>
/* General body styling for centering */
body {
  display: flex;
  border: 2px;
  align-items: left;
  justify-content: left;
  height: 100vh;
  background-color: #f5f5f5; /* Light background to see the toggle clearly */
  font-family: 'Poppins', sans-serif;
}

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
    border: 2px solid #4a148c;
    border-radius: 25px;
    background: white;
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
    background: #4a148c;
    border-radius: 25px;
    transition: left 0.3s;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3); /* Add a shadow for better visibility */
}

/* Text containers */
.toggle-label div {
    padding: 10px;
    text-align: center;
    z-index: 1;
    color: white;
    font-weight: bold;
}

/* Adjust text colors when checked */
.toggleCheckbox:checked + .toggle-label::before {
    left: 50%;
}

.toggleCheckbox:checked + .toggle-label .toggle-left {
    color: #4a148c; /* Inactive text color */
}

.toggleCheckbox:checked + .toggle-label .toggle-right {
    color: black; /* Active text color */
}

.toggleCheckbox + .toggle-label .toggle-left {
    color: white; /* Active text color */
}

.toggleCheckbox + .toggle-label .toggle-right {
    color: black; /* Inactive text color */
}
.my-4 {
    margin: 1.5rem 0;
}

.fs-1 {
    font-size: 2.5rem;
}

.ms-1 {
    margin-left: 0.25rem;
}

.mb-3 {
    margin-bottom: 1rem;
}


</style>