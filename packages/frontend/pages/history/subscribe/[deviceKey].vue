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
            <input 
                type="text" 
                class="form-control" 
                v-model="email" 
                disabled
            />
            <input 
                type="tel" 
                class="form-control" 
                v-model="code" 
                placeholder="123456" 
                maxlength="6"
            />
            <button @click="verifyCode" :disabled="isSubmitting">
                Verify
            </button>
            <a @click="sendCode">Resend code</a>
        </div>
    
        
        <!-- TODO: part 3 success -->
        <!-- confirmation msg -->
        <div v-else-if="step === 'success'">
            <h4 class="header">You're subscribed!</h4>
            <p>Verification complete. You'll receive notifications for this record.</p>
        </div>

    </div>
</template>

<script lang="ts">
    import { postNotificationEmail,  postVerifyCode } from '~/services/azureFuncs';

    export default {
        data() {
            return {
                step: 'email' as 'email' | 'code' | 'success',
                email: '',
                code: '',
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
            },

            async verifyCode() {
                if (!this.code) return;
                this.isSubmitting = true;
                this.error = null;
                try {
                    await postVerifyCode(this.email, this.code);
                    this.step = 'success';
                } catch(error) {
                    this.$snackbar.add({
                        type: 'error',
                        text: `Failed to verify code: ${error}`
                    });
                } finally {
                    this.isSubmitting = false;
                }
            }
        }
    }
     
</script>

<style scoped>

.header {
    color: whitesmoke;
    font-size: 24px;
    margin-bottom: 20px;
}

</style>