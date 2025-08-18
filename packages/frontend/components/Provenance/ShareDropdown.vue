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
      <button
        id="shareRecordBtn"
        class="btn share-btn device-btn"
        :style="btnStyles"
        data-bs-toggle="collapse"
        data-bs-target="#share-dropdown"
        @click="buttonFormat"
      >
        Share Record Link
        <picture v-if="!shareDropdown">
          <source
            srcset="../../assets/images/darkmode-dropdown.svg"
            media="(prefers-color-scheme: dark)"
          />
          <img src="../../assets/images/dropdown-icon.svg" class="dropdown-image" />
        </picture>
        <picture v-else>
          <source
            srcset="../../assets/images/darkmode-up-dropdown.svg"
            media="(prefers-color-scheme: dark)"
          />
          <img src="../../assets/images/up-dropdown-icon.svg" class="dropdown-image" />
        </picture>
      </button>

      <ul id="share-dropdown" class="collapse" style="padding: 5px 20px 15px 20px">
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
      shareDropdown: false
    };
  },
  methods: {
    buttonFormat() {
      let shareBtn = <HTMLDivElement>document.getElementById('shareRecordBtn');

      if (!dropdownVisible) {
        // button clicked, dropdown now visible
        dropdownVisible = true;
        this.shareDropdown = true;
        shareBtn.style.borderRadius = '10px 10px 0px 0px';
      } else {
        dropdownVisible = false;
        this.shareDropdown = false;
        shareBtn.style.borderRadius = '10px';
      }
    },
    getDescription() {
      return encodeURIComponent(
        `Device Name: "${this.deviceName}"\nDescription: "${this.description}"\nClick Link & View Records: ${window.location.href}`
      );
    },
    copy() {
      navigator.clipboard
        .writeText(window.location.href)
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
      window.location =
        'mailto:?subject=GOSQAS%20Asset%20History%20Record%20Link&body=' + shareDescr;
    },
    text() {
      var shareDescr = this.getDescription();
      window.location = 'sms:?&body=Record Link: ' + shareDescr;
    },
    whatsApp() {
      var shareDescr = this.getDescription();
      window.location = 'https://wa.me/send?text=' + shareDescr;
    },
    telegram() {
      var shareLink = encodeURIComponent(window.location.href);
      var shareDescr = encodeURIComponent(
        `Device Name: "${this.deviceName}"\nDescription: "${this.description}"`
      );
      window.location = 'https://t.me/share?url=' + shareLink + '&text=' + shareDescr;
    },
    isNumeric(value: any) {
      return /^\d+$/.test(value);
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
    color: #ccecfd;
  }

  .h5 {
    color: #ffffff;
  }

  #desc {
    color: #ffffff;
  }

  .share-btn {
    background-color: #1e2019;
    border: 2px solid #ffffff;
    color: white;
  }

  #dropdown-item {
    background-color: #1e2019;
  }

  #share-dropdown {
    border: 2px solid #ffffff;
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

  .share-btn {
    background-color: #ccecfd;
    border: #ccecfd;
    color: black;
  }

  #share-dropdown {
    background-color: #ccecfd;
  }

  .share-btn:active {
    background-color: #ccecfd;
  }

  .drop-text {
    color: black;
  }

  .dropdown-item:hover {
    background-color: #e6f6ff;
  }
}
</style>
