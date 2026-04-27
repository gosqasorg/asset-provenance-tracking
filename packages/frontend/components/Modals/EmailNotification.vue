<template>
    <!-- Email notifications modal -->
    <div class="modal fade" id="notifModal" tabindex="-1" aria-labelledby="notifModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered dialog">

        <!-- email input state --> 
        <div v-if="step === 'signup'" class="modal-content content">
            <h5 class="modal-title title" id="notifModalLabel">Turn on email notifications</h5>
            <div class="body">
                <p style="line-height: 30px; margin-bottom: 0;">You're turning on email notifications for this record.<br>Please enter your email below to begin receiving notifications. You can unsubscribe at any time through the link in your notification emails.</p>
                <input 
                    class="form-control" 
                    v-model="email" 
                    placeholder="Email"
                />
            </div>
            <div class="footer">
                <div class="btn-container">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Go Back</button>
                    <button type="button" class="btn btn-primary" @click="sendCode" :disabled="isSubmitting || !email">Turn on notifications</button>
                </div>
            </div>
        </div>

        <!-- code verify state -->
        <div v-if="step === 'verify'" class="modal-content content">
            <h5 v-if="error"class="modal-title title" id="notifModalLabel">Incorrect Code</h5>
            <h5 v-else class="modal-title title" id="notifModalLabel">Check your email</h5>


            <div class="body">
                <p v-if="error" style="line-height: 30px; margin-bottom: 0;">
                    That code is incorrect or has expired. Please try again or request a new code to be sent to <strong>{{ email }}</strong>.
                </p>
                <p v-else style="line-height: 30px; margin-bottom: 0;">
                    A 6-digit verification code was sent to <strong>{{ email }}</strong>. It will expire in 10 minutes.
                </p>
                <input 
                    type="tel"
                    class="form-control" 
                    v-model="code" 
                    placeholder="Verification Code"
                    maxlength="6"
                />
                <p v-if="error && verifyCooldownRemaining !== 0" class="text-danger">{{ error }}</p>
            </div>
            <div class="footer">
                <div class="btn-container">
                    <button type="button" class="btn btn-secondary" @click="step = 'signup'">Go Back</button>
                    <button type="button" class="btn btn-primary" @click="verifyCode" :disabled="verifyDisabled">{{verifyLabel}}</button>
                </div>
                <div class="resend-container">
                    <p style="line-height: 30px; margin-bottom: 0;">Didn't receive a code?</p>
                    <button class="btn-link" @click="resendCode" :disabled="resendDisabled">{{ resendLabel }}</button>
                </div>
            </div>
        </div>


        <!-- success state -->
        <div v-if="step === 'success'" class="modal-content content">
            <h5 class="modal-title title" id="notifModalLabel">Email Verified</h5>
            <div class="body">
                <p style="line-height: 30px; margin-bottom: 0;">You're now subscribed to notifications for this record. You can unsubscribe at any time through the link in your notification emails.</p>
            </div>
            <div class="footer">
                <div class="btn-container">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Go back to record</button>
                </div>
            </div>
        </div>

        <!-- expired code state -->
         <div v-if="step === 'expired'" class="modal-content content">
            <h5 class="modal-title title" id="notifModalLabel">This link is no longer valid</h5>
            <div class="body">
                <p style="line-height: 30px; margin-bottom: 0;">This verification link has expired or is no longer active. Please request a new code to complete your verification.</p>
            </div>
            <div class="footer">
                <div class="btn-container">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Go Back</button>
                    <button type="button" class="btn btn-primary" @click="resendCode, step = 'signup'" :disabled="isSubmitting">Request a new code</button>
                </div>
            </div>
        </div>

        </div>
    </div>

</template>


<script lang="ts">
    import { getPendingVerification, postNotificationEmail, postResendCode, postVerifyCode } from '~/services/azureFuncs';

    export default {
        data() {
            return {
                step: 'signup' as 'signup' | 'verify' | 'success' | 'failure' | 'expired'  ,
                email: '',
                code: '',
                error: null as string | null,
                isSubmitting: false,
                isResending: false,

                // resend cooldown: 3 free resends, then 1m wait time /2m /4m. 8m. 15m
                resendCount: 0,
                resendCooldownUntil: 0,
                resendCooldownRemaining: 0,

                // invalid code cooldown, scales: 30s / 1m / 2m / 4m / 8m / 15m
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
                // TODO
                if (this.error) {
                    return 'Try Again';
                }
                return 'Verify';
            }
        },

        async mounted() {
            // remove prev mount cause no code attach to url
        },

        methods: {
            async sendCode() {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
                if (!this.email || !emailRegex.test(this.email)) {
                    this.$snackbar.add({ 
                        type: 'error', 
                        text: `Invalid Email` 
                    });
                   return; 
                } 

                this.isSubmitting = true;
                this.error = null;
                try {
                    const deviceKey = this.$route.params.deviceKey as string;
                    const token = await postNotificationEmail(this.email, deviceKey);
                    this.step = 'verify';
                } catch(error) {
                    this.$snackbar.add({ 
                        type: 'error', 
                        text: `Failed to send code: ${error}` 
                    });
                } finally {
                    this.isSubmitting = false;
                }
            }, 

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
        }
    }
     
</script>


<style scoped>

.content {
  border-radius: 20px;
  border: none;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 2px solid #4E3681;
  background-color: #F1F5F9;
}

.header {
    border-bottom: none;
    padding-bottom: 0px;
}

.title {
    font-family: 'Poppins', sans-serif;
    font-size: 40px;
    font-weight: 500;
    color: #322253;
    line-height: 60px;
    border-bottom: none;
    padding-bottom: 0px;
}

.dialog {
    max-width: 669px;
}

.body {
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  /* text-wrap: balance; */
}

.form-control {
    border: 1px solid #CBD5E1;
    font-size: 18px;;
}

.footer {
    display: flex;
    border-top: none;
    gap: 10px;
    justify-content: center;
    flex: 1 1 0;
    padding: 0;
    flex-direction: column;
}

.btn {
  box-sizing: border-box;
  height: 58px;
  padding: 14px auto;
  /*     margin: 5px;*/
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 400;
  text-align: center;
  cursor: pointer;
  border: none;
   width: 100%;
}

.btn-link {
    background: none;
    border: none;
    color: #4E3681;
    font-weight: bold;
    text-decoration: none;
    cursor: pointer;
    font-size: 20px;
}

.btn-container{
    display: flex;
    flex: 1 1 0;
    gap: 14px;
   
}

.resend-container {
    display: flex;
    justify-content: center;
}

.btn-primary {
  background-color: #4E3681;
  color: #FFFFFF;
}

.btn-secondary {
  background-color: #FFFFFF;
  color: #322253;
  border: 2px solid #4E3681;
}

.btn-primary:hover {
  background-color: #322253;
}

.btn-secondary:hover {
  background-color: #4E3681;
  color: #FFFFFF;
}

.text-danger {
    color: #DC2626;
    font-size: 14px;
    margin-top: -10px;
    margin-bottom: 10px;
}

@media (prefers-color-scheme: dark) {

}

</style>
