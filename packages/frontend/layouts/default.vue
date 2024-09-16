<template>
    <div>
        <nav class="navbar navbar-expand-md navbar-light bg-frost custom-nav">
            <div class="container-fluid p-0 d-flex align-items-center">
                <a href="/" class="navbar-brand">
                    <img src="../assets/styles/gosqas_logo.png" height="42px" alt="Logo">
                </a>
 
                <!-- toggle button for mobile -->
                <button class="navbar-toggler border-0 custom-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav"
                aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
 
                <div class="collapse navbar-collapse justify-content-end align-items-center" id="main-nav">
                    <ul class="navbar-nav ms-2">
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
        <!-- Footer Section -->

        <footer class="footer footer-light bg-frost">
            <div class="container custom-container">
                <div class="row custom-row-position">
                    <div class="col-md-4 text-md-start mb-3 mb-md-0 custom-logo">
                        <a href="/">
                            <img src="../assets/styles/gosqas_logo.png" height="42px" alt="Global Open Source Quality Assurance System">
                        </a>
                    </div>
                    <div class="col-md-4 text-md-start custom-row-home">
                        <div class="row">
                        <a href="/" class="me-3">Home</a>
                        <a href="#" class="me-3">How It Works</a>
                        <a href="#" class="me-3">GDT GitHub</a>

                        </div>
                    </div>
                    <div class="col-md-4 text-md-start custom-row-about">
                        <div class="row">
                            <a href="/about" class="me-3">About</a>
                            <a href="#" class="me-3">Data & Privacy</a>
                            <a href="#">Technical Documents</a>
                        </div>
                    </div>
                </div>
                
                <div class="row custom-copy-right">
                    <div class="mt-8">
                    <p class="text-muted">The purple hand logo and the GOSQAS are marks of the Global Open Source Quality Assurance System, all rights reserved. However, our software is open source software. </p>
                    </div>
            </div>
            </div>
        </footer>

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

.navbar .container-fluid {
    display: flex;
    align-items: center; /* Aligns navbar content vertically */
}

@media (max-width:420px) {
    /* Dynamically resize image + toggle past this point */
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

/* Footer Styling */
.footer {
    width: 1440px;
    width: 100%;
    height: 250px; /* Ensures the footer maintains the correct height */
    padding: 40px; /* Adds padding around the content */
    display: flex;
    justify-content: space-between; /* Space between elements */
    
}


.footer a {
    color: #333;
    text-decoration: none;
}


.footer p {
    margin: 0;
    color: #666;
}
.custom-row-position {
    margin-top: -10px; /* Moves the row upwards */
}



/* Shift the row slightly to the left */
.custom-container {
    padding-left: 0px; /* Remove padding to move content close to the left edge */
    margin-left: -15px;/* Adjust the padding to move the content more to the left */
    text-align: left; /* Ensure the content is left-aligned */
}

.custom-copy-right {
    display: flex;
    justify-content: center;  /* Center horizontally */
    align-items: center;      /* Center vertically */
    text-align: center;       /* Ensures text is centered */
    width: 100%;              /* Ensures the container spans the full width */
    margin-top: 70px;  
    margin-left: 100px;        /* Adjust this value to move it right */

}

.mt-3 {
    margin: 0; /* Ensures no additional margin is added */
}


.mt-3 {
    margin: 0; /* Ensures no additional margin is added */
}
/* Smaller copyright text */
.small-text {
    font-size: 12px; /* Smaller font size for the copyright text */
    margin-top: 20px; /* Add some space above the copyright text */
    
}

</style>