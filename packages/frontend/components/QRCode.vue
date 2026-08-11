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
  <div ref="qrCode", class="qr"></div>
</template>

<script lang="ts">
import { useNuxtApp } from '#app';
import type QRCodeStyling from 'qr-code-styling';

// Styling for custom text
const CUSTOM_TEXT_MAX_LENGTH = 100;
const CUSTOM_TEXT_FONT = 'bold 20px Arial, sans-serif';
const CUSTOM_TEXT_LINE_HEIGHT = 24;

// Styling for url
const URL_FONT = '400 12px Poppins, sans-serif';
const URL_LINE_HEIGHT = 12;
const URL_TEXT_COLOR = '#1E2019';

const PADDING = 5; // Padding between text blocks and the QR code
const QR_SCALE_WITH_CUSTOM_TEXT = 0.9; // Scale down QR code when custom text is shown

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
    /* Splits text into lines that fit maxWidth. Breaks at spaces first; a single
    "word" too wide on its own (e.g. a URL) breaks at natural delimiters
    (/ . - _ : ? & = ,) next, and only falls back to a raw character-by-character
    break if a single delimiter-bounded segment is still too wide by itself. */
    wrapText(text: string, font: string, maxWidth: number): string[] {
      const measureCanvas = document.createElement('canvas');
      const measureCtx = measureCanvas.getContext('2d');
      measureCtx.font = font;
      const fitsWidth = (candidate: string) => measureCtx.measureText(candidate).width <= maxWidth;

      // Wraps segments onto lines, joining segments that fit with `joiner`.
      // Any single segment still too wide on its own is broken further via `breakSegment`.
      const wrapSegments = (segments: string[], joiner: string, breakSegment: (segment: string) => string[]): string[] => {
        const lines: string[] = [];
        let currentLine = '';

        segments.forEach((segment) => {
          if (!fitsWidth(segment)) {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = '';
            }
            const pieces = breakSegment(segment);
            lines.push(...pieces.slice(0, -1));
            currentLine = pieces[pieces.length - 1] || '';
            return;
          }

          const candidate = currentLine ? `${currentLine}${joiner}${segment}` : segment;
          if (!fitsWidth(candidate) && currentLine) {
            lines.push(currentLine);
            currentLine = segment;
          } else {
            currentLine = candidate;
          }
        });

        if (currentLine) lines.push(currentLine);
        return lines;
      };

      // Fallback: a single character always "fits" on its own line
      const breakByChar = (segment: string): string[] => wrapSegments(segment.split(''), '', (char) => [char]);

      // Prefer breaking at natural delimiters before resorting to a raw character break
      const breakAtDelimiters = (segment: string): string[] =>
        wrapSegments(segment.split(/(?<=[/.\-_:?&=,])/), '', breakByChar);

      return wrapSegments(text.split(' '), ' ', breakAtDelimiters);
    },

    //a reusable function that builds the canvas for text
    buildCanvasWithText(qrCanvas: HTMLCanvasElement, customText?: string, includeCustomText = true): HTMLCanvasElement {
      const qrScale = includeCustomText ? QR_SCALE_WITH_CUSTOM_TEXT : 1;
      const scaledQrHeight = qrCanvas.height * qrScale;
      const scaledQrWidth = qrCanvas.width * qrScale;

      // Custom text and the url appear together with url below the custom text
      let customLines: string[] = [];
      let customTextHeight = 0;
      let urlLines: string[] = [];
      let urlHeight = 0;
      if (includeCustomText) {
        const limitedText = (customText || 'QR Text').substring(0, CUSTOM_TEXT_MAX_LENGTH);
        customLines = this.wrapText(limitedText, CUSTOM_TEXT_FONT, qrCanvas.width - 20);
        customTextHeight = customLines.length * CUSTOM_TEXT_LINE_HEIGHT + 10;

        urlLines = this.wrapText(this.url, URL_FONT, qrCanvas.width - 20);
        urlHeight = urlLines.length * URL_LINE_HEIGHT + PADDING;
      }

      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');

      finalCanvas.width = qrCanvas.width;
      finalCanvas.height = scaledQrHeight + PADDING + customTextHeight + urlHeight;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      ctx.textAlign = 'center';

      // Draws the QR code at the top, scaled down only when custom text is also shown
      const qrX = (finalCanvas.width - scaledQrWidth) / 2; // Center horizontally
      ctx.drawImage(qrCanvas, qrX, 0, scaledQrWidth, scaledQrHeight);
      let cursorY = scaledQrHeight + PADDING;

      if (includeCustomText) {
        // Draws the custom text directly below the QR code
        ctx.fillStyle = '#000000';
        ctx.font = CUSTOM_TEXT_FONT;
        customLines.forEach((line, i) => {
          ctx.fillText(line, finalCanvas.width / 2, cursorY + CUSTOM_TEXT_LINE_HEIGHT * (i + 1));
        });
        cursorY += customTextHeight;

        // Draws the hardcoded url text below the custom text, at the very bottom
        ctx.fillStyle = URL_TEXT_COLOR;
        ctx.font = URL_FONT;
        urlLines.forEach((line, i) => {
          ctx.fillText(line, finalCanvas.width / 2, cursorY + URL_LINE_HEIGHT * (i + 1));
        });
      }

      return finalCanvas;
    },

    showWithText(customText?: string) {
      // Check if temp canvas already exists, if so, remove it to update with new text
      // Was previous adding multiple lines of text
      const existingTempCanvas = document.getElementById('temp-canvas-with-text');
      if (existingTempCanvas) {
        existingTempCanvas.remove();
      }
      // Get the QR code canvas
      const qrCanvas = this.$refs.qrCode.querySelector('canvas');

      if (!qrCanvas) return;

      const finalCanvas = this.buildCanvasWithText(qrCanvas, customText, true);
      finalCanvas.id = 'temp-canvas-with-text'; // get id of canvas to keep track of it

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

    downloadQRCodeWithText(customText?: string) {
      setTimeout(() => {
        // Get the QR code canvas
        const qrCanvas = this.$refs.qrCode.querySelector('canvas');
        if (!qrCanvas) return;

        const finalCanvas = this.buildCanvasWithText(qrCanvas, customText, true);

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

.qr {
  margin-bottom: 30px; 
}
</style>
