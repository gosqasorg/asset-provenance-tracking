<!--
ViewRecordDropdown.vue -- A view record button and dropdown menu
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
    This component is used for the view record button and dropdown.
    It is used on the homepage.
-->
<template>
    <div class="buttons-container" :style="containerStyles">
        <div class="view-container">
            <button id="viewRecordBtn" class="btn view-btn device-btn" :style="btnStyles" data-bs-toggle="collapse"
                data-bs-target="#view-dropdown" @click="buttonFormat">
                View Record
                <picture v-if="!viewDropdown">
                    <img src="~/assets/images/darkmode-dropdown.svg" class="dropdown-image" style="display:inline;">
                </picture>
                <picture v-else>
                    <img src="~/assets/images/darkmode-up-dropdown.svg" class="dropdown-image" style="display:inline;">
                </picture>
            </button>

            <ul id="view-dropdown" class="collapse" style="padding: 5px 20px 15px 20px;">
                <li class="dropdown-item" style="padding: 7px">
                    <a @click="enterKey()" class="drop-text item-link">Enter Key</a>
                </li>
                <li class="dropdown-item" style="padding: 7px">
                    <a @click="scanQR()" class="drop-text item-link">Scan QR</a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">

let dropdownVisible = false;

export default {
    props: {
        fontSize: { type: [String, Number], default: () => "18px" },
        width: { type: [String, Number], default: () => "auto" }
    },
    computed: {
        btnStyles() {
            return {
               fontSize: this._fontSize
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
        _width() {
           if (this.isNumeric(this.width)) { return this.width + "%"; }
           return this.width;
        },
    },
    data() {
        return {
            viewDropdown: false
        }
    },
    methods: {
        buttonFormat() {
            let viewRecordBtn = <HTMLDivElement>document.getElementById("viewRecordBtn");

            if (!dropdownVisible) { // button clicked, dropdown now visible
                dropdownVisible = true;
                this.viewDropdown = true;
                viewRecordBtn.style.borderRadius = "10px 10px 0px 0px";
            } else {
                dropdownVisible = false;
                this.viewDropdown = false;
                viewRecordBtn.style.borderRadius = "10px";
            }
        },
        enterKey() {
            this.$emit('toggleTrackDiv');
        },
        scanQR() {
            this.$emit('toggleCamera');
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
}

#viewRecordBtn {
    height: 70px;
}

.view-btn {
    margin-right: 0px;
}

#view-dropdown {
    border-radius: 0px 0px 10px 10px;
    margin-left: auto;
    margin-right: 0;
    list-style-type: none;
    padding-left: 10px;
    padding-right: 10px;
    margin-bottom: 0px;
}

.view-btn {
    background-color: #4E3681;
    border-color: #4E3681;
    color: white;
}

#view-dropdown {
    background-color: #4E3681;
}

.view-btn:active {
    background-color: #322253;
    border-color: #322253;
    color: white;
}

.view-btn:hover {
    background-color: #322253;
    border-color: #322253;
}

.dropdown-item {
    text-align: center;
    border-radius: 10px;
    padding: 7px;
}

.dropdown-item:hover {
    background-color: #322253;
}

.item-link {
    text-decoration: none;
    cursor: pointer;
}

.buttons-container {
    margin-top: 20px;
}

.drop-text {
    color: white;
}

/* Switches to mobile sizing */
@media (max-width: 768px) {
    #viewRecordBtn {
        height: 67px;
        font-size: 18px !important;
    }
}
</style>