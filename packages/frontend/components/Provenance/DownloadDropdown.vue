<!--
DownloadDropdown.vue -- A download button and dropdown menu
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
    This component is used for the download button and dropdown.
    It is used in the history and record [deviceKey].vue pages.
-->
<template>
  <div class="buttons-container" :style="containerStyles">
    <div class="download-container">
      <button
        id="downloadRecordBtn"
        class="btn download-btn device-btn"
        :style="btnStyles"
        data-bs-toggle="collapse"
        data-bs-target="#download-dropdown"
        @click="buttonFormat"
      >
        Download Record
        <picture v-if="!downloadDropdown">
          <img id="hover-icon" src="../../assets/images/dropdown-icon.svg" style="display: none" />
          <source
            srcset="../../assets/images/darkmode-dropdown.svg"
            media="(prefers-color-scheme: dark)"
            class="dropdown-image"
            style="display: inline"
          />
          <img
            id="light-download-icon"
            src="../../assets/images/dropdown-icon.svg"
            class="dropdown-image"
            style="display: inline"
          />
        </picture>
        <picture v-else>
          <img
            id="hover-icon"
            src="../../assets/images/up-dropdown-icon.svg"
            style="display: none"
          />
          <source
            srcset="../../assets/images/darkmode-up-dropdown.svg"
            media="(prefers-color-scheme: dark)"
            class="dropdown-image"
            style="display: inline"
          />
          <img
            src="../../assets/images/up-dropdown-icon.svg"
            class="dropdown-image"
            style="display: inline"
          />
        </picture>
      </button>

      <ul id="download-dropdown" class="collapse" style="padding: 5px 10px 15px 10px">
        <li class="dropdown-item" style="padding: 7px">
          <a @click="downloadQRImage()" class="drop-text item-link">Download Image</a>
        </li>
        <li class="dropdown-item" style="padding: 7px">
          <a
            @click="downloadQRImageWithText()"
            class="drop-text item-link"
            @mouseenter="showWithText"
            @mouseleave="resetToDefault"
            >Download Image with Text</a
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
// let dropdownVisible = false;

export default {
  props: {
    downloadQRCodeMethod: {
      type: Function,
      required: true
    },
    downloadQRCodeWithTextMethod: {
      type: Function,
      required: true
    },
    showWithTextMethod: {
      type: Function,
      required: true
    },
    resetToDefaultMethod: {
      type: Function,
      required: true
    },
    fontSize: { type: [String, Number], default: () => '18px' },
    height: { type: [String, Number], default: () => '61px' },
    width: { type: [String, Number], default: () => 'auto' }
  },
  computed: {
    btnStyles() {
      return {
        fontSize: this._fontSize,
        height: this._height
      };
    },
    containerStyles() {
      return {
        width: this._width
      };
    },
    _fontSize() {
      if (this.isNumeric(this.fontSize)) {
        return this.fontSize + 'px';
      }
      return this.fontSize;
    },
    _height() {
      if (this.isNumeric(this.height)) {
        return this.height + 'px';
      }
      return this.height;
    },
    _width() {
      if (this.isNumeric(this.width)) {
        return this.width + '%';
      }
      return this.width;
    }
  },
  data() {
    return {
      downloadDropdown: false,
      dropdownVisible: false
    };
  },
  methods: {
    buttonFormat() {
      let downloadBtn = <HTMLDivElement>document.getElementById('downloadRecordBtn');

      if (!this.dropdownVisible) {
        // button clicked, dropdown now visible
        this.dropdownVisible = true;
        this.downloadDropdown = true;
        downloadBtn.style.borderRadius = '10px 10px 0px 0px';
      } else {
        this.dropdownVisible = false;
        this.downloadDropdown = false;
        downloadBtn.style.borderRadius = '10px';
      }
    },
    downloadQRImage() {
      this.downloadQRCodeMethod();
    },
    downloadQRImageWithText() {
      this.downloadQRCodeWithTextMethod();
    },
    isNumeric(value: any) {
      return /^\d+$/.test(value);
    },
    showWithText() {
      this.showWithTextMethod();
    },
    resetToDefault() {
      this.resetToDefaultMethod();
    }
  }
};
</script>

<style scoped>
.btn {
  padding: 18px 22px;
  font-size: 20px;
  border-radius: 10px;
  margin-right: 30px;
  height: 66px;
}

.download-btn {
  margin-right: 0px;
  width: 100%;
}

#download-dropdown {
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
  margin-right: 30px;
}

.download-container {
  width: 100%;
}

/* Switches to mobile sizing */
@media (max-width: 991px) {
  .download-container {
    width: 100%;
  }

  .buttons-container {
    width: 100% !important;
    margin-right: 0 !important;
  }

  #download-dropdown {
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
    color: #ccecfd;
  }

  .h5 {
    color: #ffffff;
  }

  #desc {
    color: #ffffff;
  }

  .download-btn {
    background-color: #1e2019;
    border: 2px solid #ffffff;
    color: white;
  }

  .download-btn:hover {
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
    background-color: #1e2019;
  }

  #download-dropdown {
    background-color: #1e2019;
    border: 2px solid #ffffff;
  }

  #downloadRecordBtn:hover .dropdown-image {
    display: none !important;
  }

  #downloadRecordBtn:hover #hover-icon {
    display: inline !important;
  }

  .drop-text {
    color: white;
  }

  .dropdown-item:hover {
    background-color: #4e3681;
  }
}

/* Light mode version*/
@media (prefers-color-scheme: light) {
  h1,
  .h {
    color: #4e3681;
  }

  .h5 {
    color: #1e2019;
  }

  #desc {
    color: #1e2019;
  }

  .download-btn {
    background-color: #ccecfd;
    border: #ccecfd;
    color: black;
  }

  #download-dropdown {
    background-color: #ccecfd;
  }

  .download-btn:active {
    background-color: #ccecfd;
  }

  .download-btn:hover {
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
