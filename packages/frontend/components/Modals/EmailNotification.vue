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
                    <button type="button" class="btn btn-primary" @click="sendCode" :disabled="isSubmitting">Turn on notifications</button>
                </div>
            </div>
        </div>

        <!-- code verify state -->
        <div v-if="step === 'signup'" class="modal-content content">
            <h5 class="modal-title title" id="notifModalLabel">{{verifyTitle}}</h5>
            <div class="body">
                <p style="line-height: 30px; margin-bottom: 0;">{{verifyBody}}</p>
                <input 
                    type="tel"
                    class="form-control" 
                    v-model="code" 
                    placeholder="Verification Code"
                    maxlength="6"
                />
                <p v-if="error">{{ error }}</p>
            </div>
            <div class="footer">
                <div class="btn-container">
                    <button type="button" class="btn btn-secondary" @click="step = 'signup'">Go Back</button>
                    <button type="button" class="btn btn-primary" @click="verifyCode" :disabled="verifyDisabled">{{verifyLabel}}</button>
                </div>
                <div class="resend-container">
                    <p>Didn't receive a code?</p>
                    <button @click="resendCode" :disabled="resendDisabled">{{ resendLabel }}</button>
                </div>
            </div>
        </div>


        <!-- success state -->


        <!-- invalid code state? -->


        <!-- expired code state -->
         <div v-if="step === 'expired'" class="modal-content content">
            <h5 class="modal-title title" id="notifModalLabel">This link is no longer valid</h5>
            <div class="body">
                <p style="line-height: 30px; margin-bottom: 0;">This verification link has expired or is no longer active. Please request a new code to complete your verification.</p>
            </div>
            <div class="footer">
                <div class="btn-container">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Go Back</button>
                    <button type="button" class="btn btn-primary" @click="sendCode" :disabled="isSubmitting">Request a new code</button>
                </div>
            </div>
        </div>

        </div>
    </div>

</template>


<script lang="ts">
    import { getPendingVerification, postNotificationEmail } from '~/services/azureFuncs';

    export default {
        data() {
            return {
                step: 'signup' as 'signup' | 'code' | 'success' | 'failure' | 'expired'  ,
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
                // TODO
                return 'Resend Code'
            },
            verifyLabel(): string {
                // TODO
                return 'Verify';
            },
            verifyTitle(): string {
                // TODO
                return 'Check your email'
            },
            verifyBody(): string {
                // TODO
                return `A 6-digit verification code was sent to ${this.email}. It will expire in 10 minutes.`
            }
        },

        async mounted() {
            const { token, code } = this.$route.query;

            //check if token is valid
            try {
                await getPendingVerification(token as string);

            } catch {
                this.step =  'failure';
                return;
            }

            // autoverify if code is in url (will have to modify to incorporate modal usage)
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

.btn-container{
    display: flex;
    flex: 1 1 0;
    gap: 14px;
   
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

@media (prefers-color-scheme: dark) {

}

</style>
