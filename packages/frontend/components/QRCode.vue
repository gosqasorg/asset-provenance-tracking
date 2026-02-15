<!-- QRCode.vue -- Component to render QR Codes
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
  <div ref="qrCode"></div>
</template>

<script lang="ts">
import { useNuxtApp } from '#app';
import type QRCodeStyling from 'qr-code-styling';

export default {
  props: {
    url: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      qrCode: null as HTMLElement | null,
      qrCodeStyling: null as QRCodeStyling | null,
      options: {
        width: 322,
        height: 361,
        type: 'canvas',
        data: this.url,
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.2,
          margin: 40,
          crossOrigin: 'Anonymous'
        },
        dotsOptions: {
          type: 'square' as 'square', // Cast to specific type
          color: '#000000'
        },
        cornersSquareOptions: {
          type: 'square' as 'square', // Cast to specific type
          color: '#000000'
        },
        cornersDotOptions: {
          type: 'square' as 'square', // Cast to specific type
          color: '#4e3681' // Color of the dot corners
        }
      }
    };
  },
  mounted() {
    this.qrCode = this.$refs.qrCode as HTMLElement;
    const { $qrCodeStyling } = useNuxtApp();
    this.qrCodeStyling = $qrCodeStyling(this.options) as QRCodeStyling;

    if (this.qrCode) {
      this.qrCodeStyling.append(this.qrCode);
    }
  },
  watch: {
    url(newValue: string | undefined) {
      if (newValue) {
        this.options.data = newValue;
        this.qrCodeStyling?.update(this.options);
      }
    }
  },
  methods: {
    showWithText() {
      // Check if temp canvas already exists, if so, don't create another
      const existingTempCanvas = document.getElementById('temp-canvas-with-text');
      if (existingTempCanvas) return;
      // Get the QR code canvas
      const qrCanvas = this.$refs.qrCode.querySelector('canvas');

      if (!qrCanvas) return;

      // Create a new canvas for the combined image
      const finalCanvas = document.createElement('canvas');
      finalCanvas.id = 'temp-canvas-with-text'; // get id of canvas to keep track of it
      const ctx = finalCanvas.getContext('2d');

      // Set dimensions (add space for text)
      const textHeight = 60;
      finalCanvas.width = qrCanvas.width;
      finalCanvas.height = qrCanvas.height + textHeight;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Add text
      let text = 'QR Text';
      let limitedText = text.substring(0, 32); // limit text to 32 characters

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(limitedText, finalCanvas.width / 2, 40);

      // Draw the QR code below the text
      ctx.drawImage(qrCanvas, 0, textHeight);

      // Hide the original canvas
      qrCanvas.style.display = 'none';

      // Append the final canvas with text
      this.$refs.qrCode.appendChild(finalCanvas);
    },

    resetToDefault() {
      // Remove temporary canvas with text
      const tempCanvas = document.getElementById('temp-canvas-with-text');
      if (tempCanvas) {
        tempCanvas.remove();
      }

      // Show original canvas
      const qrCanvas = this.$refs.qrCode.querySelector('canvas');
      if (qrCanvas) {
        qrCanvas.style.display = 'block';
      }
    },
    downloadQRCode() {
      this.qrCodeStyling?.download({
        name: 'vqr',
        extension: 'png'
      });
    },
    downloadQRCodeWithText() {
      setTimeout(() => {
        // Get the QR code canvas
        const qrCanvas = this.$refs.qrCode.querySelector('canvas');

        // Create a new canvas for the combined image
        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');

        // Set dimensions (add space for text)
        const textHeight = 60;
        finalCanvas.width = qrCanvas.width;
        finalCanvas.height = qrCanvas.height + textHeight;

        // Fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Add text
        let text = 'QR Text';
        let limitedText = text.substring(0, 32); // limit text to 32 characters

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(limitedText, finalCanvas.width / 2, 40);

        // Draw the QR code below the text
        ctx.drawImage(qrCanvas, 0, textHeight);

        qrCanvas.remove();

        // Append the final canvas with text
        this.$refs.qrCode.appendChild(finalCanvas);
        // Download the combined image
        finalCanvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'vpr-with-text.png';
          link.click();
          URL.revokeObjectURL(url); // cleanup to free up blob data in memory
        });
      }, 500);
    }
  }
};
</script>

<style scoped>
svg {
  width: 100%;
  height: 100%;
}
</style>
