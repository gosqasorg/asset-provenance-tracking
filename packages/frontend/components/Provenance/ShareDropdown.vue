<!--
ShareDropdown.vue -- A share button and dropdown menu
Copyright (C) 2024 GOSQAS Team
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

<!--
    This component is used for the share button and dropdown.
    It is used in the history and record [deviceKey].vue pages.
-->
<template>
    <div class="buttons-container" :style="containerStyles">
        <div class="share-container">
            <button id="shareRecordBtn" class="btn share-btn device-btn" :style="btnStyles" data-bs-toggle="collapse"
                data-bs-target="#share-dropdown" @click="buttonFormat">
                Share Record Link
                <picture v-if="!shareDropdown">
                    <img id="hover-icon" src="../../assets/images/dropdown-icon.svg" style="display:none;">
                    <source srcset="../../assets/images/darkmode-dropdown.svg" media="(prefers-color-scheme: dark)" 
                      class="dropdown-image" style="display:inline;">
                    <img id="light-share-icon" src="../../assets/images/dropdown-icon.svg" class="dropdown-image" style="display:inline;">
                </picture>
                <picture v-else>
                    <img id="hover-icon" src="../../assets/images/up-dropdown-icon.svg" style="display:none;">
                    <source srcset="../../assets/images/darkmode-up-dropdown.svg" media="(prefers-color-scheme: dark)" 
                      class="dropdown-image" style="display:inline;">
                    <img src="../../assets/images/up-dropdown-icon.svg" class="dropdown-image" style="display:inline;">
                </picture>
            </button>

            <ul id="share-dropdown" class="collapse" style="padding: 5px 20px 15px 20px;">
                <li class="dropdown-item" style="padding: 7px">
                    <a @click="copy()" class="drop-text item-link">Copy</a>
                </li>
                <li class="dropdown-item" style="padding: 7px">
                    <a @click="text()" class="drop-text item-link">Messages</a>
                </li>
                <li class="dropdown-item" style="padding: 7px">
                    <a @click="mail()" class="drop-text item-link">Email</a>
                </li>
                <li class="dropdown-item" style="padding: 7px">
                    <a @click="whatsApp()" class="drop-text item-link">WhatsApp</a>
                </li>
                <li class="dropdown-item" style="padding: 7px">
                    <a @click="telegram()" class="drop-text item-link">Telegram</a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">

let dropdownVisible = false;

export default {
    props: {
        deviceName: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        fontSize: { type: [String, Number], default: () => "18px" },
        height: { type: [String, Number], default: () => "61px" },
        width: { type: [String, Number], default: () => "auto" }
    },
    computed: {
        btnStyles() {
            return {
               fontSize: this._fontSize,
               height: this._height
           }
        },
        containerStyles() {
            return {
               width: this._width
           }
        },
        _fontSize() {
           if (this.isNumeric(this.fontSize)) { return this.fontSize + "px"; }
           return this.fontSize;
        },
        _height() {
           if (this.isNumeric(this.height)) { return this.height + "px"; }
           return this.height;
        },
        _width() {
           if (this.isNumeric(this.width)) { return this.width + "%"; }
           return this.width;
        },
    },
    data() {
        return {
            shareDropdown: false
        }
    },
    methods: {
        buttonFormat() {
            let shareBtn = <HTMLDivElement>document.getElementById("shareRecordBtn");

            if (!dropdownVisible) { // button clicked, dropdown now visible
                dropdownVisible = true;
                this.shareDropdown = true;
                shareBtn.style.borderRadius = "10px 10px 0px 0px";
            } else {
                dropdownVisible = false;
                this.shareDropdown = false;
                shareBtn.style.borderRadius = "10px";
            }
        },
        getDescription() {
            return encodeURIComponent(`Device Name: "${this.deviceName}"\nDescription: "${this.description}"\nClick Link & View Records: ${window.location.href}`);
        },
        copy() {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    alert('Record Link copied to clipboard!');
                })
                .catch((error) => {
                    console.error('Failed to copy text: ', error);
                    alert('Failed to copy Record Link. Please try again.');
                });
        },
        mail() {
            var shareDescr = this.getDescription();
            window.location = "mailto:?subject=GOSQAS%20Asset%20History%20Record%20Link&body=" + shareDescr;
        },
        text() {
            var shareDescr = this.getDescription();
            window.location = "sms:?&body=Record Link: " + shareDescr;
        },
        whatsApp() {
            var shareDescr = this.getDescription();
            window.location = "https://wa.me/send?text=" + shareDescr;
        },
        telegram() {
            var shareLink = encodeURIComponent(window.location.href);
            var shareDescr = encodeURIComponent(`Device Name: "${this.deviceName}"\nDescription: "${this.description}"`);
            window.location = "https://t.me/share?url=" + shareLink + "&text=" + shareDescr;
        },
        isNumeric(value: any) {
           return /^\d+$/.test(value);
        }
    },
}
</script>

<style scoped>
.btn {
    padding: 18px 22px;
    font-size: 20px;
    border-radius: 10px;
    margin-right: 30px;
    height: 66px;
}

.share-btn {
    margin-right: 0px;
    width: 100%;
}

#share-dropdown {
    border-radius: 0px 0px 10px 10px;
    margin-left: auto;
    margin-right: 0;
    list-style-type: none;
    padding-left: 10px;
    padding-right: 10px;
}

.dropdown-item {
    text-align: center;
    border-radius: 10px;
    padding: 7px;
}

.item-link {
    text-decoration: none;
    cursor: pointer;
}

.buttons-container {
    margin-top: 20px;
    margin-bottom: 20px;
}

.share-container {
    width: 100%;
}

/* Switches to mobile sizing */
@media (max-width: 991px) {
    .share-container {
        width: 100%;
    }

    .buttons-container {
        width: 100% !important;
    }

    #share-dropdown {
        width: 100%;
    }

    .device-btn {
        width: 100%;
        margin-right: 0px;
    }
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
    h1,
    .h {
        color: #CCECFD;
    }

    .h5 {
        color: #FFFFFF;
    }

    #desc {
        color: #FFFFFF;
    }

    .share-btn {
        background-color: #1E2019;
        border: 2px solid #FFFFFF;
        color: white;
    }

    .share-btn:hover {
        background-color: white;
        color: black;
    }
    .dropdown-item:hover {
        background-color: white !important;
    }
    .dropdown-item:hover .drop-text {
        color: black;
    }

    #dropdown-item {
        background-color: #1E2019;
    }

    #share-dropdown {
        background-color: #1E2019;
        border: 2px solid #FFFFFF;
    }

    #shareRecordBtn:hover .dropdown-image {
        display: none !important;
    }

    #shareRecordBtn:hover #hover-icon {
        display: inline !important;
    }

    .drop-text {
        color: white;
    }

    .dropdown-item:hover {
        background-color: #4E3681;
    }
}

/* Light mode version*/
@media (prefers-color-scheme: light) {
    h1,
    .h {
        color: #4E3681;
    }

    .h5 {
        color: #1E2019;
    }

    #desc {
        color: #1E2019;
    }

    .share-btn {
        background-color: #CCECFD;
        border: #CCECFD;
        color: black;
    }

    #share-dropdown {
        background-color: #CCECFD;
    }

    .share-btn:active {
        background-color: #CCECFD;
    }

    .share-btn:hover {
        background-color: #e6f6ff !important;
    }

    .drop-text {
        color: black;
    }

    .dropdown-item:hover {
        background-color: #e6f6ff;
    }
}
</style>