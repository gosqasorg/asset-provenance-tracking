<template>
    <div>
        <!-- check state -->
        <div v-if="step === 'checking'">
            <p class="header">Verifying...</p>
        </div>

        <!-- code input state -->
        <div v-else-if="step === 'code'">
            <h4 class="header">Enter Verification Code</h4>
            <p>Enter the code sent to your email.</p>
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

            <p v-if="error">{{ error }}</p>
        </div>

        <!-- success -->
        <div v-else-if="step === 'success'">
            <h4 class="header">You're subscribed!</h4>
            <p>verif complete. Blah blah blah</p>
            <button @click="goToRecord">Go to Record</button>
        </div>

        <!-- expired -->
        <div v-else-if="step === 'expired'">
            <h4 class="header">Code Expired</h4>
            <p>ur verification code has expired, get new one</p>
            <button @click="goBack">Go Back</button>
        </div>
    </div>
</template>

<script lang="ts">

import { getPendingVerification, postVerifyCode } from '~/services/azureFuncs';

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
        async resendCode() {
            // implement
        },
        goToRecord() {
            // implement later
            // goes to record
        },
        goBack() {
            // implement later :)
            // goes back to emial subscription page for this record
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