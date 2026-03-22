<template>
    <!-- <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'> -->
    <div>

        <!-- TODO: part 1 email input -->
        
        <div v-if="step === 'email'">
            <input type="email" placeholder="your@email.com" required/>
            <!-- <input type="text" placeholder="tags" /> -->
            <!-- TODO: Add the usual tag input stuff later -->
             <!-- submit btn -> sendCode() -->
             <button>Send Code</button>
        </div>

        <!-- TODO: part 2 - verify email -->
        <!-- lock email field? -->
        <!-- code input -->
        <!-- verify btn  -->
        <!-- resend code btn -->
         <div v-else-if="step === 'code'">
            <p style="color: azure;">Code Verification</p>
        </div>
    
        
        <!-- TODO: part 3 success -->
        <!-- confirmation msg -->
        <div v-else-if="step === 'success'">
            <p style="color: azure;">Success!</p>
        </div>

        <!-- Maybe no fail? security issue -->

        <!-- Temp Test Button to make sure state changes -->
        <button @click="nextStep('code')" v-if="step === 'email'">Next</button>
        <button @click="nextStep('success')" v-if="step === 'code'">Next</button>
        <button @click="nextStep('email')" v-if="step === 'success'">Next</button>

    </div>
</template>

<script setup lang="ts">
    import { useRoute } from 'vue-router';
    // import { hasParent } from '~/utils/descendantList';
    import { ref } from 'vue';
    const route = useRoute()
    const recordKey = route.params.deviceKey as string;



    // TODO: verification states
    type Step = 'email' | 'code' | 'success';

    const step = ref<Step>('email');


    // temp func to test step change
    const nextStep = (next: Step) => {
        step.value = next;
    };    

    // TODO: sendCode()
    // POST to postNotificationEmail

    // TODO: verifyCode()
    // POST to VerifyCode
</script>