<template>
  <div class="buttons-container" :style="containerStyles">
    <button class="btn notify-btn device-btn" :style="btnStyles" @click="openDialog">
      Get email notifications
    </button>

    <div v-if="showDialog" class="email-dialog-overlay" @click.self="closeDialog">
      <div class="email-dialog">
        <h2 class="email-dialog-title">Turn on email notifications</h2>

        <p class="email-dialog-copy">
          You’re turning on email notifications for this record.
          Please enter your email below to begin receiving notifications.
          You can unsubscribe at any time through the link in your notification emails.
        </p>

        <input
          v-model.trim="email"
          type="email"
          class="email-input"
          placeholder="Email"
        />

        <div class="email-actions">
          <button class="btn dialog-btn dialog-btn-secondary" :disabled="isSubmitting" @click="closeDialog">
            Go back
          </button>
          <button class="btn dialog-btn dialog-btn-primary" :disabled="isSubmitting" @click="submit">
            {{ isSubmitting ? 'Turning on...' : 'Turn on notifications' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// TODO: revisit colors!!! 
// TODO: size of emeail text box
import { postNotificationEmail } from '~/services/azureFuncs';

export default {
  props: {
    recordKey: { type: String, required: true },
    fontSize: { type: [String, Number], default: () => '20px' },
    height: { type: [String, Number], default: () => '66px' },
    width: { type: [String, Number], default: () => 48 }
  },
  data() {
    return {
      showDialog: false,
      email: '',
      isSubmitting: false
    }
  },
  computed: {
    btnStyles() {
      return { fontSize: this._fontSize, height: this._height }
    },
    containerStyles() {
      return { width: this._width }
    },
    _fontSize() {
      return /^\d+$/.test(String(this.fontSize)) ? this.fontSize + 'px' : this.fontSize
    },
    _height() {
      return /^\d+$/.test(String(this.height)) ? this.height + 'px' : this.height
    },
    _width() {
      return /^\d+$/.test(String(this.width)) ? this.width + '%' : this.width
    }
  },
  methods: {
    openDialog() { this.showDialog = true },
    closeDialog() {
      this.showDialog = false
      this.email = ''
    },
    async submit() {
      const value = this.email.trim()
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      if (!isValid) {
        this.$snackbar.add({ type: 'error', text: 'Please enter a valid email address' })
        return
      }

      try {
        this.isSubmitting = true
        await postNotificationEmail(this.recordKey, this.email);
        this.$snackbar.add({ type: 'success', text: 'You are subscribed to email notifications' })
        this.closeDialog()
      } catch (error) {
        this.$snackbar.add({ type: 'error', text: 'Failed to subscribe. Please try again.' })
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.buttons-container {
  margin-top: 20px;
  margin-bottom: 20px;
}

.notify-btn {
  padding: 18px 22px;
  font-size: 20px;
  border-radius: 10px;
  margin-right: 0;
  height: 66px;
  width: 100%;
}

@media (max-width: 991px) {
  .buttons-container {
    width: 100% !important;
  }

  .device-btn {
    width: 100%;
    margin-right: 0;
  }
}

@media (prefers-color-scheme: dark) {
  .notify-btn {
    background-color: #1E2019;
    border: 2px solid #FFFFFF;
    color: white;
  }

  .notify-btn:hover {
    background-color: white;
    color: black;
  }
}

@media (prefers-color-scheme: light) {
  .notify-btn {
    background-color: #CCECFD;
    border: #CCECFD;
    color: black;
  }

  .notify-btn:active {
    background-color: #CCECFD;
  }

  .notify-btn:hover {
    background-color: #e6f6ff !important;
  }
}

.email-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
}

.email-dialog {
  width: min(92vw, 760px);
  border-radius: 22px;
  padding: 36px 30px 24px;
  border: 2px solid #4E3681;
  background: #f3f4f8;
  color: #1e2019;
}

.email-dialog-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.1;
  margin: 0 0 18px;
  color: #322253;
  white-space: nowrap;
}

.email-dialog-copy {
  font-size: 18px;
  line-height: 1.4;
  margin: 0 0 18px;
}

.email-input {
  width: 100%;
  height: 56px;
  border: 1px solid #c9cdd6;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 16px;
  background: #fff;
  color: #1e2019;
  margin-bottom: 18px;
}

.email-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.dialog-btn {
  height: 64px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 500;
}

.dialog-btn-secondary {
  background: transparent;
  border: 2px solid #4E3681;
  color: #4e3681;
}

.dialog-btn-primary {
  background: #4e3681;
  border: 2px solid #4e3681;
  color: #fff;
}

@media (prefers-color-scheme: dark) {
  .email-dialog {
    background: #1E2019;
    border-color: #ccecfd;
    color: #fff;
  }

  .email-dialog-title {
    color: #d8e9f5;
  }

  .email-input {
    background: #f5f5f5;
    color: #1e2019;
    border-color: #e3e5ea;
  }

  .dialog-btn-secondary {
    border-color: #ffffff;
    color: #ffffff;
  }

  .dialog-btn-primary {
    background: #ccecfd;
    border-color: #ccecfd;
    color: #1e2019;
  }
}

@media (max-width: 991px) {
  .email-dialog {
    width: min(95vw, 680px);
    padding: 26px 20px 18px;
  }

  .email-dialog-title {
    font-size: 24px;
  }

  .email-dialog-copy {
    font-size: 16px;
  }

  .email-input,
  .dialog-btn {
    font-size: 16px;
  }
}
</style>