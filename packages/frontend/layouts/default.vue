<template>
    <div>
        <nav class="navbar navbar-expand-md navbar-light bg-sky">
            <div class="container">
                <a href="/" class="navbar-brand">
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
                        <li class="nav-item pe-4">
                            <a class="nav-link" href="#">Sample Devices</a>
                        </li>
                        <li class="nav-item pe-4">
                            <a class="nav-link" href="#">Contact</a>
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