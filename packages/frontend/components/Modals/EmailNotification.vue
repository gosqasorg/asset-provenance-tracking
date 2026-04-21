<template>
    <!-- Email notifications modal -->
    <div class="modal fade" id="notifModal" tabindex="-1" aria-labelledby="notifModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered dialog">
        <div class="modal-content content">
            <h5 class="modal-title title" id="notifModalLabel">Turn on email notifications</h5>
            <div class="body">
                <p style="line-height: 30px; margin-bottom: 0;">You're turning on email notifications for this record.<br>Please enter your email below to begin receiving notifications. You can unsubscribe at any time through the link in your notification emails.</p>
                <input 
                    type="text" 
                    class="form-control" 
                    v-model="email" 
                    placeholder="Email"
                />
            </div>
            <div class="footer">
                <div class="btn-container">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Go Back</button>
                    <button type="button" class="btn btn-primary">Turn on notifications</button>
                </div>
            </div>
        </div>
        </div>
    </div>

</template>


<script lang="ts">
    import { postNotificationEmail } from '~/services/azureFuncs';

    export default {
        data() {
            return {
                email: '',
                tags: [] as string[],
                error: null as string | null,
                isSubmitting: false,
            }
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
                    const token = await postNotificationEmail(this.email, deviceKey, this.tags);
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
