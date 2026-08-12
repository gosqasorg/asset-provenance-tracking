<!-- QRCode.vue -- modal for adding additional text to a QR code before download
Copyright (C) 2024 GOSQAS
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. -->

<template>
    <!-- QR code additional text modal -->
    <div class="modal fade" id="qrCodeTextModal" tabindex="-1" aria-labelledby="qrCodeTextModalLabel" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-centered dialog">
            <div class="modal-content content">
                <h5 class="modal-title title" id="qrCodeTextModalLabel">Download QR Code</h5>

                <div class="body">
                    <p style="width: 100%; text-align: left;">Example of your QR code with added text:</p>
                    <div class="qr-preview">
                        <QRCode :url="url" ref="qrcode_component" />
                    </div>
                    <input
                        class="form-control"
                        v-model="additionalText"
                        @input="handleTextInput"
                        maxlength="100"
                        placeholder="Add Additional text"
                        aria-label="Additional Text"
                    />
                </div>

                <div class="footer">
                    <div class="btn-container">
                        <button type="button" class="btn btn-tertiary" data-bs-dismiss="modal" @click="goBack">Go Back</button>
                        <button type="button" class="btn btn-primary" @click="downloadWithText" :disabled="!additionalText.trim()">Download with text</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import QRCode from '~/components/QRCode.vue';

export default {
    components: {
        QRCode
    },

    props: {
        url: { type: String, required: true }
    },

    data() {
        return {
            additionalText: '',
            exampleText: 'Your additional text will go here. This is some example text.',
            modalEl: null as HTMLElement | null
        };
    },

    mounted() {
        this.modalEl = document.getElementById('qrCodeTextModal');
        this.modalEl?.addEventListener('shown.bs.modal', this.onModalShown);
    },

    beforeUnmount() {
        this.modalEl?.removeEventListener('shown.bs.modal', this.onModalShown);
    },

    methods: {
        onModalShown() {
            const qrCodeComponent = this.$refs.qrcode_component as any;
            qrCodeComponent?.showWithText(this.additionalText.trim() || this.exampleText);
        },

        handleTextInput() {
            const qrCodeComponent = this.$refs.qrcode_component as any;
            qrCodeComponent?.showWithText(this.additionalText.trim() || this.exampleText);
        },

        downloadWithText() {
            if (!this.additionalText.trim()) return;
            const qrCodeComponent = this.$refs.qrcode_component as any;
            qrCodeComponent?.downloadQRCodeWithText(this.additionalText);
        },

        goBack() {
            const qrCodeComponent = this.$refs.qrcode_component as any;
            qrCodeComponent?.resetToDefault();
            this.additionalText = '';
        }
    }
};
</script>

<style scoped>
.content {
  border-radius: 20px;
  border: none;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background-color: #F1F5F9;
}

.title {
    font-family: 'Poppins', sans-serif;
    font-size: 40px;
    font-weight: 500;
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
  align-items: center;
  gap: 20px;
}

.qr-preview {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 20px;
    border: 2px solid #4e3681;
    border-radius: 20px;
    opacity: 1;
    background-color: #ffffff;
    overflow: hidden;
    max-width: 100%;
}

.qr-preview > * {
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow: hidden;
}

.qr-preview :deep(canvas) {
    width: 75%;
    height: auto;
    display: block;
    margin: 0 auto;
}

.form-control {
    box-sizing: border-box;
    border: 1px solid #CBD5E1;
    border-radius: 6px;
    font-size: 18px;
    width: 601px;
    height: 108px;
    max-width: 100%;
    opacity: 1;
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
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 400;
  text-align: center;
  cursor: pointer;
  border: none;
  width: 100%;
}

.btn-primary:disabled {
    cursor: not-allowed;
    opacity: 0.33;
    pointer-events: none;
}

.btn-tertiary:disabled {
    cursor: not-allowed;
    pointer-events: none;
}

.btn-container {
    display: flex;
    flex: 1 1 0;
    gap: 14px;
}

@media (prefers-color-scheme: dark) {
    .content {
        background-color: #353535;
        border: 2px solid #CCECFD;
    }

    .title {
        color: #E6F6FF;
    }

    .body {
        color: #FFFFFF;
    }

    .btn-primary {
        background-color: #CCECFD;
        color: #1E2019;
    }

    .btn-primary:disabled {
        background-color: #CCECFD;
        color: #1E2019;
        opacity: 0.33;
    }

    .btn-primary:hover {
        background-color: #E6F6FF;
    }

    .btn-tertiary {
        background-color: #353535;
        color: #FFFFFF;
        border: 2px solid #FFFFFF;
    }

    .btn-tertiary:hover {
        background-color: #FFFFFF;
        color: #353535;
    }
}

@media (prefers-color-scheme: light) {
    .content {
        border: 2px solid #4E3681;
        background-color: #F1F5F9;
    }

    .title {
        color: #322253;
    }

    .body {
        color: #1E2019;
    }

    .btn-primary {
        background-color: #4E3681;
        color: #FFFFFF;
    }

    .btn-tertiary {
        background-color: #F1F5F9;
        color: #322253;
        border: 2px solid #4E3681;
    }

    .btn-primary:hover {
        background-color: #322253;
    }

    .btn-tertiary:hover {
        background-color: #4E3681;
        color: #FFFFFF;
    }
}

@media (max-width: 1140px) {
  .dialog {
    width: 340px;
  }

  .title {
    font-size: 28px;
    font-weight: 500;
    line-height: 42px;
  }

  .btn {
    height: 48px;
    padding: 12px auto;
    border-radius: 10px;
    font-size: 16px;
    line-height: 24px;
  }

  .form-control {
    border: 1px solid #CBD5E1;
    font-size: 16px;
    height: 36px;
  }

  .btn-container {
    flex-direction: column-reverse;
  }
}
</style>
