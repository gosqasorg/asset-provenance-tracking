<template>
    <div>
        <nav class="navbar navbar-expand-md navbar-light bg-sky custom-nav">
            <div class="container-fluid p-0">
                <a href="/" class="navbar-brand" >
                    <img src="../assets/styles/gosqas_logo.png" height="42px">
                </a>

                <!-- toggle button for mobile -->
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav" 
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
.custom-nav { /* mobile view */
padding: 0px 40px 0px 40px;
  height: 101px;
}

@media (min-width: 768px) { /* desktop view */
  .custom-nav {
    padding: 0px 30px 0px 30px;
    height: 101px;
  }
}
</style>