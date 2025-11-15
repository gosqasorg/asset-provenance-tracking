<!-- HowItWorks.vue -->

<template>                                                                      
    <RouterLink to="/how-it-works">                                   
        <button class="baseButton button" id="how-it-works-button" 
            :style="{
            borderWidth: '2px',
            borderStyle: 'solid',
            padding: '10px 20px',
            margin,
            fontSize, // defaults to 20px
            borderRadius: '10px'
      }"                                    
        >

            How It Works

        </button>                                                       
    </RouterLink>         
</template>

<script setup lang="ts">
import { computed } from 'vue'

    const props = defineProps<{ 
        margin?: string 
        fontSize?: string | number
    }>()
    
    const margin = props.margin ?? '0px'

    const fontSize = computed(() => {
        if (props.fontSize === undefined || props.fontSize === null) {
            return '20px'
        }

        if (typeof props.fontSize === 'number') {
            return props.fontSize + 'px'
        }

        return props.fontSize
    })
</script>
                                                                                
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
    #how-it-works-button {                                                        
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
    #how-it-works-button {                                                        
        color: #322253;                                                         
        background-color: #FFFFFF;                                              
        border: 2px solid #4E3681;                                              
    }                                                                           
}                                                                               
                                                                                
</style>                                            

