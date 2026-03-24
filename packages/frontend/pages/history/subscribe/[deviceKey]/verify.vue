<!-- Idea: Add a resend code cooldown option -->

<template>
    <div>
        <!-- check state -->
        <div v-if="step === 'checking'">
            <p class="header">Verifying</p>
        </div>

        <!-- code input state -->
        <div v-else-if="step === 'code'">
            <h4 class="header">Enter Verification Code</h4>
            <p class="subtext">Enter the code sent to your email.</p>
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

            <button @click="resendCode">
                Resend Code
            </button>

            <p v-if="error">{{ error }}</p>
        </div>

        <!-- success -->
        <div v-else-if="step === 'success'">
            <h4 class="header">You're subscribed!</h4>
            <p class="subtext">verif complete. Blah blah blah</p>
            <button @click="goToRecord">Go to Record</button>
        </div>

        <!-- expired -->
        <div v-else-if="step === 'expired'">
            <h4 class="header">Code Expired</h4>
            <p class="subtext">ur verification code has expired, get new one</p>
            <button @click="goBack">Go Back</button>
        </div>
    </div>
</template>

<script lang="ts">

import { getPendingVerification, postResendCode, postVerifyCode } from '~/services/azureFuncs';

export default {
    data() {
        return {
            step: 'checking' as 'checking' | 'code' | 'success' | 'expired',
            code: '',
            error: null as string | null,
            isSubmitting: false,
        }
    },
    async mounted() {
        const { token, code } = this.$route.query;

        // check if token is valid 
        try {
            await getPendingVerification(token as string);
        } catch {
            this.step = 'expired';
            return;
        }

        // auto verify if code is in url params
        // else user inputs code manually
        if (code) {
            try {
                // should be successful- already accounting for expiration above
                await postVerifyCode(token as string, code as string);
                this.step = 'success';
            } catch {
                this.step = 'code';
            }
            return;
        }

        this.step = 'code';
    },

    methods: {
        async verifyCode() {
            if (!this.code) return;
            this.isSubmitting = true;
            this.error = null;
            try {
                const token = this.$route.query.token as string;
                await postVerifyCode(token, this.code);
                this.step = 'success';
            } catch {
                this.error = 'Invalid or expired code.';
            } finally {
                this.isSubmitting = false;
            }
        },
        // using the current token, have the associated user recieve a new code and a new token?
        async resendCode() {
            try {
                const deviceKey = this.$route.params.deviceKey as string;
                const token = this.$route.query.token as string;
                await postResendCode(token);
                this.$snackbar.add({
                    type: 'success',
                    text: 'Code resent! Check your email.'
                });
            } catch(error) {
                this.$snackbar.add({
                    type: 'error',
                    text: `Failed to resend code: ${error}`
                });
            }
        },
        goToRecord() {
            const deviceKey = this.$route.params.deviceKey as string;
            this.$router.push(`/history/${deviceKey}`);
        },
        goBack() {
            const deviceKey = this.$route.params.deviceKey as string;
            this.$router.push(`/history/subscribe/${deviceKey}`);
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

.subtext {
    color: whitesmoke;
    font-size: 16px;
}

</style>