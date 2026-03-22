<template>
    <div>

        <!-- TODO: part 1 email input -->
        
        <div v-if="step === 'email'">
            <!-- TODO: Add the usual tag input stuff later -->
            <h4 class="header">Stage 1: Submit Email</h4>
            <input 
                type="text" 
                class="form-control" 
                v-model="email" 
                placeholder="your@email.com"
            />
            <button @click="sendCode" :disabled="isSubmitting">
                Send Verification Code
            </button>
            <p v-if="error">{{ error }}</p>
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
        <!-- <button @click="nextStep('code')" v-if="step === 'email'">Next</button>
        <button @click="nextStep('success')" v-if="step === 'code'">Next</button>
        <button @click="nextStep('email')" v-if="step === 'success'">Next</button> -->

    </div>
</template>

<script lang="ts">
    import { postNotificationEmail } from '~/services/azureFuncs';

    export default {
        data() {
            return {
                step: 'email' as 'email' | 'code' | 'success',
                email: '',
                error: null as string | null,
                isSubmitting: false,
            }
        },
        methods: {
            async sendCode() {
                if (!this.email) return;
                this.isSubmitting = true;
                this.error = null;
                try {
                    const deviceKey = this.$route.params.deviceKey as string;
                    await postNotificationEmail(this.email, deviceKey);
                    this.step = 'code';
                } catch(error) {
                    this.$snackbar.add({ 
                        type: 'error', 
                        text: `Failed to send code: ${error}` 
                    });
                } finally {
                    this.isSubmitting = false;
                }
            }
        }
    }
     
    // TODO: verifyCode()
    // POST to VerifyCode
</script>

<style scoped>

.header {
    color: whitesmoke;
    font-size: 24px;
    margin-bottom: 20px;
}

</style>