<template>
    <div>
        <nav class="navbar navbar-expand-lg bg-frost">
            <div class="container-fluid">
                <a href="/" class="navbar-brand" >
                    <img src="../assets/styles/gosqas_logo.png" id="logo">
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav"
                    aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation" id="button-toggler">
                    <span class="navbar-toggler-icon" id="menu-icon"></span>
                    <span class="close-icon" id="close-icon"><svg xmlns="http://www.w3.org/2000/svg" width="25.5px" height="19.5px" fill="currentColor" class="bi bi-x-lg" >
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                      </svg></span>
                </button>
                <div class="collapse navbar-collapse justify-content-end" id="main-nav">
                    <ul class="navbar-nav">
                        <li class="nav-item mobile-nav">
                            <a class="nav-link" href="/about">Home</a>
                        </li>
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
                            <li style="margin:10px 0px">
                                <a class="mobile-link" href="#">GDT GitHub</a>
                            </li>
                            <li style="margin:10px 0px 20px 0px">
                                <a class="mobile-link" href="#">Technical Documents</a>
                            </li>
                        </div>
                        <span>
                            <ButtonComponent buttonText="Track an Asset" padding="12px 16px" margin="0px 20px 0px 0px" style="font-size: 18px"></ButtonComponent>
                            <div class="mobile-nav">
                                    <ButtonComponent buttonText="Create a Device" backgroundColor="#e6f6ff" color="#4e3681" padding="12px 16px" style="font-size: 18px"></ButtonComponent>
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

    #logo {
        width: 100%;
        max-width: 25vw;
        min-width: 262px;
        height: auto;
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

    .navbar-toggler,
    .navbar-toggler:focus,
    .navbar-toggler:active,
    .navbar-toggler-icon:focus {
        border: none;
        box-shadow: none;
    }


    .navbar-collapse .nav-link:hover,
    .navbar-collapse .nav-link.active,
    .mobile-link:hover,
    .mobile-link.active {
        color: #4e3681;
    }

    #button-toggler[aria-expanded='true'] {
        #menu-icon {
            display: none;
        }
        #close-icon {
            display: inline-block;
        }
    }

    #button-toggler[aria-expanded='false'] {
        #menu-icon {
            display: inline-block;
        }
        #close-icon {
            display: none;
        }
    }

    /* For screens less than 992px*/
    /* This number differs from our traditional 768px because the nav bar
        list options look too cluttered in medium screens*/
    @media (max-width: 992px) {
        .mobile-nav {
            display: inline-block;
        }
        .container-fluid {
            padding:28px 30px;
        }
        li .mobile-link{
            padding: 30px 0;
        }
        .navbar-collapse.show {
            transition: all 0.5s;
            height: 100vh;  
        }
        .navbar-collapse {
            padding-top: 20px;
            padding-left: 6px; /* plus 30px padding from container fluid = 36px*/
        }
        .nav-link {
            font-size: 32px;
            font-weight: 600;  
            color: #1E2019;
        }
        .mobile-link {
            font-size: 28px;
            font-weight: 500;
            color: #1E2019;
            text-decoration: none;
        }
        
    
    }


    /* For screens bigger than 992px*/
    @media (min-width: 992px) {
        .mobile-nav {
            display: none;
        }
        .container-fluid {
            padding:24.5px 40px;
            position: relative;
        }
        #main-nav{
            position:absolute;
            padding:24.5px 20px;  /* right margin is 40 but Track Asset button has a 20px margin */
        }
        .nav-link {
            font-size: 20px;
            font-weight: 400;        
            color: #1E2019;
        }
        li {
            align-content: center;
            margin-right: 15px; /* Need a smaller margin so it does not collide with logo */
        }    
    }


</style>