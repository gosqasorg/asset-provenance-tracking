<template>
    <div>
        <nav class="navbar navbar-expand-md navbar-light bg-frost custom-nav">
            <div class="container-fluid p-0">
                <a href="/" class="navbar-brand" >
                    <img src="../assets/styles/gosqas_logo.png" height="42px">
                </a>
 
 
                <!-- toggle button for mobile -->
                <button class="navbar-toggler border-0 custom-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav"
                aria-expanded="false" aria-label="Toggle navigation">
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
        </nav>
        <div>
            <slot/>
        </div>
    </div>
 </template>
 

 
<style scoped>

/* Styling for toggle bar */
.custom-toggler .navbar-toggler-icon {
    font-size: 30px;
    background-image: url(
 "data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(30, 32, 25, 1)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E");
}
 
.navbar-toggler:focus {
    outline: none;
    box-shadow: none;
}
 
 
@media (max-width:420px) {
    /* Dynamically resize image + toggle past this point*/
    img {
        max-width: 100%;
        height: auto;
    }
 
    .navbar-brand {
        width: 70%;
    }
 
    .navbar-toggler-icon {
        max-width: 100%;
    }
 
    .custom-toggler {
        width: 20%;
    }
 }
 

.custom-nav { /* mobile view */
    padding: 0px 7px 0px 20px;
    height: 101px;
}
 
 
@media (min-width: 768px) { /* desktop view */
  .custom-nav {
    padding: 0px 30px 0px 30px;
    height: 101px;
  }
}
 
</style>