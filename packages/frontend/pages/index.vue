<!--
    This is the landing page where you can create a new device to track
-->
<template>
    <link href="https://fonts.google.com/specimen/Poppins" rel="stylesheet" type="text/css">
    <nav class="navbar navbar-expand-md navbar-light bg-sky">
        <div class="container">
            <a href="#" class="navbar-brand">
                <img src="../assets/styles/gosqas_logo.png" width="300">
            </a>

            <!-- toggle button for mobile -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav" 
            aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button> 

            <div class="collapse navbar-collapse justify-content-end align-center " id="main-nav">
                <ul class="navbar-nav ms-2">
                    <li class="nav-item pe-4">
                        <a class="nav-link" href="#">About</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Contact</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container-md">
        <div class="my-4 text-iris fs-1">Global Distributed Tracking</div>

        <!-- create toggle for single or container  -->
        
        <div class="ms-1 mb-3">
            <span style="display: inline">New Device
                <div class="form-check form-switch" style="display:inline-block" >
                    <input id="create_new" class="form-check-input" type="checkbox"  @change="displayForm" />
                    New Container
                </div>
            </span>
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
            displayForm(){
                const create_new = (<HTMLInputElement>document.getElementById("create_new"));
                const create_device = (<HTMLInputElement>document.getElementById("create_device"));
                const create_container = (<HTMLInputElement>document.getElementById("create_container"));
                if(create_new.checked) {
                    create_device.style.display = "none";
                    create_container.style.display = "inline";

                } else{
                    create_device.style.display = "inline";
                    create_container.style.display = "none";
                }
            },
    
        }
    }

</script>


<style scoped>

checkbox {
    color:aqua;
}

</style>

