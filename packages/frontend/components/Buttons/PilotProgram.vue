<!-- PilotProgram.vue -->

<template>                                                                      
    <RouterLink to="/dmdm">                                   
        <button class="baseButton button w-100" id="learn-more-button" style="
            border-width: 2px;                                            
            border-style: solid;                                          
            padding: 10px 20px;                                           
            margin: 0px;                                                  
            font-size: 20px;                                              
            border-radius: 10px;"                                         
        >

            View Our Pilot Program

        </button>                                                       
    </RouterLink>         
</template>

                                                                                
<style scoped>

/* Dark mode version*/                                                          
@media (prefers-color-scheme: dark) {                                           
    #gdt-container {                                                            
        background-color: #1E2019                                               
    }                                                                           
    h1 {                                                                        
        color: #CCECFD;                                                         
    }                                                                           
    p {                                                                         
        color: #FFFFFF;                                                         
        background-color: #1E2019;                                              
    }                                                                           
    .form-control {                                                             
        background-clip: padding-box;                                           
        background-color: #1E2019;                                              
    }                                                                           
    #learn-more-button {                                                        
        color: #CCECFD;                                                         
        background-color: #1E2019;                                              
        border: 2px solid #CCECFD;                                              
    }                                                                           
}                                                                               
/* Light mode version*/                                                         
@media (prefers-color-scheme: light) {                                          
    #gdt-container {                                                            
        background-color: #FFFFFF;                                              
    }                                                                           
    h1 {                                                                        
        color: #4E3681;                                                         
    }                                                                           
    p {                                                                         
        color: black;                                                           
        background-color: #FFFFFF;                                              
    }                                                                           
    .form-control {                                                             
        background-clip: padding-box;                                           
        background-color: #FFFFFF;                                              
    }                                                                           
    #learn-more-button {                                                        
        color: #322253;                                                         
        background-color: #FFFFFF;                                              
        border: 2px solid #4E3681;                                              
    }                                                                           
}                                                                               
                                                                                
</style>                                            

