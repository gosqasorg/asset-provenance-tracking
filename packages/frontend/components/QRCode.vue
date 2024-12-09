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
        size: {
            type: Number,
            default: 300
        },
        recordKey: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            qrCode: null as HTMLElement | null,
            qrCodeStyling: null as QRCodeStyling | null,
            options: {
                width: this.size,
                height: this.size,
                data: this.getQrCodeUrl(),
                imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: 0.2,
                    margin: 40,
                    crossOrigin: 'Anonymous'
                },
                dotsOptions: {
                    type: 'square' as 'square',  // Cast to specific type
                    color: '#000000'
                },
                cornersSquareOptions: {
                    type: 'square' as 'square',  // Cast to specific type
                    color: '#000000'
                },
                cornersDotOptions: {
                    type: 'square' as 'square',  // Cast to specific type
                    color: '#4e3681'  // Color of the dot corners
                },
            }
        };
    },
    mounted() {
        this.qrCode = this.$refs.qrCode as HTMLElement;
        const { $qrCodeStyling } = useNuxtApp();
        this.qrCodeStyling = $qrCodeStyling(this.options) as QRCodeStyling;

        if (this.qrCode) {
            this.qrCodeStyling.append(this.qrCode);
        } else {
            console.error('QR Code element not found');
        }

        // Add event listener to download QR Code on click
        const canvas = this.qrCode?.querySelector('canvas');
        canvas?.addEventListener('click', () => {
            this.downloadQRCode();
        });
        // Show a pointer cursor on hover to indicate the QR Code is clickable
        if (canvas) {
            canvas.style.cursor = 'pointer';
        }
    },
    computed: {
        qrCodeUrl() {
            this.getQrCodeUrl();
        }
    },
    methods: {
        downloadQRCode() {
            this.qrCodeStyling?.download({
                name: this.recordKey,
                extension: 'png'
            });
        },
        getQrCodeUrl() {
            const baseUrl = useRuntimeConfig().public.frontendUrl;
            const qrUrl = `${baseUrl}/provenance/${this.recordKey}`;
            console.log('qrUrl', qrUrl);
            return qrUrl;
        }
    }
}
</script>

<style scoped>
svg {
    width: 100%;
    height: 100%;
}
</style>
