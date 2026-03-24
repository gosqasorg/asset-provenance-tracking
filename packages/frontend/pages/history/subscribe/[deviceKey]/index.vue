<!-- TODO: Move to the create record component [Last] -->

<template>
        
        <div>
            <!-- TODO: Add the usual tag input stuff later -->
            <h4 class="header">Submit Email</h4>
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
        
</template>

<script lang="ts">
    import { postNotificationEmail } from '~/services/azureFuncs';

    export default {
        data() {
            return {
                email: '',
                error: null as string | null,
                isSubmitting: false,
            }
        },
        methods: {
            async sendCode() {
                if (!this.email) return;

                // TODO:Add some basic email validation here. 
                this.isSubmitting = true;
                this.error = null;
                try {
                    const deviceKey = this.$route.params.deviceKey as string;
                    const token = await postNotificationEmail(this.email, deviceKey);
                    this.$router.push(`/history/subscribe/${deviceKey}/verify?token=${token}`);
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
     
</script>

<style scoped>

.header {
    color: whitesmoke;
    font-size: 24px;
    margin-bottom: 20px;
}


</style>