<template>
    <div>
        <!-- <nav class="navbar navbar-expand-md navbar-light bg-frost custom-nav">
            <div class="container-fluid p-0">
                <a href="/" class="navbar-brand" >
                    <img src="../assets/styles/gosqas_logo.png" height="42px">
                </a> -->
 
 
                <!-- toggle button for mobile -->
                <!-- <button class="navbar-toggler border-0 custom-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav">
                    <span class="navbar-toggler-icon"></span>
                </button>
 
 
                <div class="collapse navbar-collapse justify-content-end align-center" id="main-nav">
                    <ul class="navbar-nav ms-2" >
                        <li class="nav-item pe-4">
                            <a class="nav-link" href="/about">About</a>
                        </li>
                        <li class="nav-item pe-4">
                            <a class="nav-link" href="#">Sample Devices</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/contact">Contact</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav> -->

        <nav class="navbar navbar-expand-md bg-frost">
            <div class="container-fluid">
                <a href="/" class="navbar-brand" >
                    <img src="../assets/styles/gosqas_logo.png" height="42px" style="margin: 10px;">
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav5"
                    aria-controls="navbarNav5" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse justify-content-end" id="navbarNav5">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link" href="/about">About</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/how_it_works">How It Works</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Data & Privacy</a>
                        </li>
                        <div class="mobile-nav">
                            <li>
                                <a class="nav-link" href="#">GDT GitHub</a>
                            </li>
                            <li>
                                <a class="nav-link" href="#">Technical Documents</a>
                            </li>
                        </div>
                        <span>
                            <ButtonComponent buttonText="Track an Asset"></ButtonComponent>
                            <div class="mobile-nav">
                                    <ButtonComponent buttonText="Create a Device" backgroundColor="#e6f6ff" color="#4e3681"></ButtonComponent>
                            </div>
                        </span>
                    </ul>
                </div>
            </div>
        </nav>





        <div>
            <slot/>
        </div>
    </div>
 </template>
 

 
<style scoped>


nav{
    font-size: 20px;
    font-weight: 400;
    color: #1E2019;
}

.navbar-collapse {
    top: 0;
    left: 0;
    right: 0;
    z-index: 2; /* This is 2 because the LargeTogle.vue is 1 */
  }

.navbar-toggler,
.navbar-brand {
  z-index: 3;
}

.navbar-toggler:focus {
    box-shadow: none;
  }


.navbar-collapse .nav-link:hover,
.navbar-collapse .nav-link.active {
    color: #4e3681;
}

.navbar-collapse.show {
    transition: all 0.5s;
    height: 100vh;

}

@media (max-width: 768px) {
    .mobile-nav {
        display: inline-block;
    }
}

@media (min-width: 768px) {
    .mobile-nav {
        display: none;
    }
}


</style>