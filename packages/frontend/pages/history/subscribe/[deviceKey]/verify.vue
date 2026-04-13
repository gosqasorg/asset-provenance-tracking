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
            <button @click="verifyCode" :disabled="verifyDisabled">
                {{ verifyLabel }}
            </button>

            <button @click="resendCode" :disabled="resendDisabled">
                {{ resendLabel }}
            </button>

            <p v-if="error">{{ error }}</p>
        </div>

        <!-- success -->
        <div v-else-if="step === 'success'">
            <h4 class="header">You're subscribed!</h4>
            <p class="subtext">You'll receive an email when this record is updated.</p>
            <button @click="goToRecord">Go to Record</button>
        </div>

        <!-- expired -->
        <div v-else-if="step === 'expired'">
            <h4 class="header">Code Expired</h4>
            <p class="subtext">Your verification code has expired. Please go back and request a new one.</p>
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
            isResending: false,

            // resend cooldown: 3 free resends, then 1m wait time / 2m / 4m / 8m / 15m 
            resendCount: 0,
            resendCooldownUntil: 0,
            resendCooldownRemaining: 0,

            // invalid code cooldown, scales: 30s / 60s / 120s / 240s / 480s / 600s
            invalidAttempts: 0,
            verifyCooldownUntil: 0,
            verifyCooldownRemaining: 0,

            _cooldownInterval: undefined as ReturnType<typeof setInterval> | undefined,
        }
    },

    computed: {
        resendDisabled(): boolean {
            return this.isResending || this.resendCooldownRemaining > 0;
        },
        verifyDisabled(): boolean {
            return this.isSubmitting || this.verifyCooldownRemaining > 0;
        },
        resendLabel(): string {
            if (this.isResending) return 'Sending...';
            if (this.resendCooldownRemaining > 0) {
                return `Resend Code (${this.formatTime(this.resendCooldownRemaining)})`;
            }
            return 'Resend Code';
        },
        verifyLabel(): string {
            if (this.verifyCooldownRemaining > 0) {
                return `Verify (${this.formatTime(this.verifyCooldownRemaining)})`;
            }
            return 'Verify';
        },
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

    beforeUnmount() {
        if (this._cooldownInterval) clearInterval(this._cooldownInterval);
    },

    methods: {
        startCooldownTimer() {
            if (this._cooldownInterval) return;
            this._cooldownInterval = setInterval(() => {
                const now = Date.now();
                this.resendCooldownRemaining = Math.max(0, Math.ceil((this.resendCooldownUntil - now) / 1000));
                this.verifyCooldownRemaining = Math.max(0, Math.ceil((this.verifyCooldownUntil - now) / 1000));

                if (this.resendCooldownRemaining === 0 && this.verifyCooldownRemaining === 0) {
                    clearInterval(this._cooldownInterval);
                    this._cooldownInterval = undefined;
                }
            }, 1000);
        },

        // after 3 free resends: 1m, 2m, 4m, 8m, 15m 
        getResendCooldownMs(): number {
            if (this.resendCount <= 3) return 0;
            const extra = this.resendCount - 3; // 1-indexed 
            const minutes = Math.min(Math.pow(2, extra - 1), 15);
            return minutes * 60 * 1000;
        },

        // 30s, 60s, 120s, 240s, 480s, 600s 
        getVerifyCooldownMs(): number {
            const seconds = Math.min(30 * Math.pow(2, this.invalidAttempts - 1), 600);
            return seconds * 1000;
        },

        formatTime(totalSeconds: number): string {
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
            return `${s}s`;
        },

        async verifyCode() {
            if (!this.code || this.verifyCooldownRemaining > 0) return;
            this.isSubmitting = true;
            this.error = null;
            try {
                const token = this.$route.query.token as string;
                await postVerifyCode(token, this.code);
                this.step = 'success';
            } catch {
                this.invalidAttempts++;
                const cooldownMs = this.getVerifyCooldownMs();
                this.verifyCooldownUntil = Date.now() + cooldownMs;
                this.verifyCooldownRemaining = Math.ceil(cooldownMs / 1000);
                this.startCooldownTimer();
                this.error = `Invalid or expired code. Try again in ${this.formatTime(this.verifyCooldownRemaining)}.`;
            } finally {
                this.isSubmitting = false;
            }
        },

        async resendCode() {
            if (this.resendCooldownRemaining > 0) return;
            this.isResending = true;
            try {
                const token = this.$route.query.token as string;
                await postResendCode(token);
                this.resendCount++;
                const cooldownMs = this.getResendCooldownMs();
                if (cooldownMs > 0) {
                    this.resendCooldownUntil = Date.now() + cooldownMs;
                    this.resendCooldownRemaining = Math.ceil(cooldownMs / 1000);
                    this.startCooldownTimer();
                }
                this.$snackbar.add({
                    type: 'success',
                    text: 'Code resent! Check your email.'
                });
            } catch(error) {
                this.$snackbar.add({
                    type: 'error',
                    text: `Failed to resend code: ${error}`
                });
            } finally {
                this.isResending = false;
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
