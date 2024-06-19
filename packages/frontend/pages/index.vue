<!--
    This is the landing page where you can create a new device to track
-->
<template>
    <link href="https://fonts.google.com/specimen/Poppins" rel="stylesheet" type="text/css">

    <div class="container-md">
        <div class="my-4 text-iris fs-1">Global Distributed Tracking</div>

        <!-- create toggle for single or container  -->
        
        <div class="ms-1 mb-3">
            <span id="new-device" class="tab-span active" @click="displayForm('device')">New Device</span>
            <span id="new-container" class="tab-span" @click="displayForm('container')">New Container</span>
        </div>

        <!-- <div>Create a Single Asset:</div> -->
        <div id="create_device"><CreateDevice/></div>
        <!-- <CreateDevice/> -->
        <!-- <div>Or, if you want to create a group of keys:</div> -->
        <!-- <div></div> -->
        
        <div id="create_container" style="display:none"><CreateContainer/></div>

        <p class="my-4">
            The Global Open Source Quality Assurance System (GOSQAS) provides the opportunity to create truthful, transparent documentation via our open source provenance tracker, Global Distributed Tracking (GDT). Designed specifically for low-resource settings, GDT allows anyone with simple website access to securely record their project data. Our development philosophy of “Trust Through Transparency” (TTT) encourages better global communication within diverse communities- to include humanitarian response, open source hardware, and scientific research.
        </p>

    </div>
</template>

<script lang="ts">
    export default {

        methods: {
            displayForm(type = string){
                const create_device = document.getElementById("create_device");
                const create_container = document.getElementById("create_container");
                const new_device_button = document.getElementById("new-device");
                const new_container_button = document.getElementById("new-container");

                if (type === 'device') {
                    create_device.style.display = "inline";
                    create_container.style.display = "none";
                    new_device_button.classList.add('active');
                    new_container_button.classList.remove('active');
                } else {
                    create_device.style.display = "none";
                    create_container.style.display = "inline";
                    new_device_button.classList.remove('active');
                    new_container_button.classList.add('active');
                }

            },
    
        }
    }

</script>


<style scoped>
.container-md {
    font-family: 'Poppins', sans-serif;
}

.text-iris {
    color: #4a148c; /* Iris color */
}

.tab-span {
    padding: 10px 20px;
    background-color: #f5f5f5;
    color: black;;
    cursor: pointer;
    display: inline-block;
    border: 1px solid #ddd;
    border-radius: 5px 5px 0 0;
    margin-right: 5px;
    transition: background-color 0.3s, color 0.3s;
}

.tab-span:hover {
    background-color: #e0e0e0;
}

.tab-span.active {
    background-color: #4a148c;
    color: white;
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

