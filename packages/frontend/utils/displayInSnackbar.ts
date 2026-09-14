import { createPinia, defineStore } from 'pinia'

export const displayInSnackbar = defineStore('snackbar', {
    state: () => ({
        show: false,
        message: '',
        color: 'success',
        timeout: 5000,
    }),
    actions: {
        trigger(message: string, color = 'success') {
            this.message = message,
            this.color = color,
            this.show = true
        },
        hide() {
            this.show = false
        }
    }
})