<template>
    <div class="root-div">

        <nav class="navbar navbar-expand-lg bg-frost">
            <div class="container-fluid" id="nav">
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
                <div class="collapse navbar-collapse flex-column" id="main-nav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item mobile-nav">
                            <a class="nav-link" href="/home">Home</a>
                        </li>
                        <li class="nav-item">

                            <a class="nav-link" href="/about">About</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/how_it_works">How It Works</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/data_privacy">Data & Privacy</a>
                        </li>
                        <div class="mobile-nav">
                            <li style="margin:10px 0px">
                                <a class="mobile-link" href="https://github.com/gosqasorg/asset-provenance-tracking">GDT GitHub</a>
                            </li>
                            <li style="margin:10px 0px 20px 0px">
                                <a class="mobile-link" href="https://docs.google.com/document/d/1CkJ3Tz7I6DO1TV4CgKxCUxyvJEqqtBEu/edit#heading=h.gjdgxs">Technical Documents</a>
                            </li>
                        </div>
                        <span>
                            <ButtonComponent @click="trackingForm()" id="trackButton" buttonText="Track an Asset" padding="12px 16px" margin="0px 20px 0px 0px" style="font-size: 18px"></ButtonComponent>
                            <div class="mobile-nav">
                                    <ButtonComponent buttonText="Create a Device" backgroundColor="#e6f6ff" color="#4e3681" padding="12px 16px" style="font-size: 18px"></ButtonComponent>
                            </div>
                        </span>
                    </ul>
                    <div class="me-0 ms-auto" id="trackAssetDiv" style="display:none;">
                        <TrackAsset inputWidth="75%" id="trackAssetInput"></TrackAsset>
                    </div>
                </div>
            </div>
        </nav>

        <div class="content">
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
                        <a href="/home" class="me-3">Home</a>
                        <a href="/how_it_works" class="me-3">How It Works</a>
                        <a href="https://github.com/gosqasorg/asset-provenance-tracking" class="me-3">GDT GitHub</a>

                        </div>
                    </div>
                    <div class="col-md-4 text-md-start custom-row-about">
                        <div class="row">
                            <a href="/about" class="me-3">About</a>
                            <a href="/data_privacy" class="me-3">Data & Privacy</a>
                            <a href="https://docs.google.com/document/d/1CkJ3Tz7I6DO1TV4CgKxCUxyvJEqqtBEu/edit#heading=h.gjdgxs">Technical Documents</a>
                        </div>
                    </div>
                </div>
                
                <div class="row custom-copy-right">
                    <div class="mt-10">
                    <p class="text-muted">© 2024 Global Open Source Quality Assurance System   |   Please review our <a href="">Terms and Conditions</a>.</p>
                    <p class="text-muted">The purple hand logo and the GOSQAS are marks of the Global Open Source Quality Assurance System, all rights reserved. However, our software is open source software. </p> 
                   </div>
            </div>
            </div>
        </footer>

    </div>
</template>

 
 

<script lang="ts">
let showTrack = false;

export default {
    methods: {
        // Function to have the 'Track an asset' input field appear
        async trackingForm() {
            let trackAssetDiv = <HTMLDivElement>document.getElementById("trackAssetDiv");
            let trackButton = <HTMLDivElement>document.getElementById("trackButton");
            let nav = <HTMLDivElement>document.getElementById("nav")

            if (!showTrack) { //if showTrack is false
                showTrack = true;
                trackAssetDiv.style.display="inline"; //make text input available
                trackButton.style.backgroundColor = "#322253";
                trackButton.style.borderColor = "#322253";
                nav.style.paddingBottom = "80px";

            } else { 
                showTrack = false; 
                trackAssetDiv.style.display="none";
                trackButton.style.backgroundColor = "#4E3681";
                trackButton.style.borderColor = "#4E3681";
                nav.style.paddingBottom = "24.5px";

            }
        },
    }
}

</script>


 
<style scoped>
    .root-div {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .content {
        flex: 1 0 auto;
    }

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

    .navbar-toggler:focus {
        outline: none;
        box-shadow: none;
    }

    .navbar .container-fluid {
        display: flex;
        align-items: center; /* Aligns navbar content vertically */
    }

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
        #trackAssetInput {
            padding: 20px 0px 0 0;            
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

        #trackAssetDiv {
            min-width: 600px;
        }

        #trackAssetInput {
            padding: 20px 20px 0 0;
        }
    }


    /* Footer Styling */
    @media (max-width:420px) {
        .custom-logo img {
            max-width: 70%;
            height: auto; /* Ensures the image maintains its aspect ratio */
        }
        .custom-row-home, .custom-row-about {
            display: none; /* Hide the sections */
        }
        .text-muted {
            font-size: 7px; /* Smaller font size for the copyright text */
        }
        .custom-copy-right {
            position: relative; /* Allows the use of top and left properties for positioning */
            top: -40px; /* Moves the element upwards */
            left: -60px; /* Moves the element to the left */
            width: 100%;
            text-align: left; /* Aligns text to the left */
            margin-top: 0;  /* Remove flexbox margins */
            margin-left: 0; /* Reset any margin issues */        /* Adjust this value to move it right */

        }
        .custom-nav { /* mobile view */
            padding: 0px 7px 0px 20px;
            height: 101px;
        }
    
    }

    @media (min-width: 768px) { /* desktop view */
        .custom-nav {
            padding: 0px 30px 0px 30px;
            height: 101px;
        }
        
    .custom-copy-right {
            position: relative; /* Allows the use of top and left properties for positioning */
            top: -30px; /* Moves the element upwards */
            left: -60px; /* Moves the element to the left */
            width: 100%;
            text-align: left; /* Aligns text to the left */
            margin-top: 0;  /* Remove flexbox margins */
            margin-left: 0; /* Reset any margin issues */        /* Adjust this value to move it right */

            }  
    }

    .footer {
        width: 100%;
        padding: 40px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        flex-shrink: 0;
    }


    .footer a {
        color: #333;
        text-decoration: none;
    }


    .footer p {
        margin: 0;
        color: #666;
    }



    /* Shift the row slightly to the left */
    .custom-container {
        padding-left: 0px; /* Remove padding to move content close to the left edge */
        margin-left: -15px;/* Adjust the padding to move the content more to the left */
        text-align: left; /* Ensure the content is left-aligned */
    }
    .custom-row-home {
        position: relative;
        left: 80px; /* Move it to the right by 20px, adjust as necessary */
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


    /* Smaller copyright text */
    .text-muted {
        font-size: 15px; /* Smaller font size for the copyright text */
        
    }




</style>
