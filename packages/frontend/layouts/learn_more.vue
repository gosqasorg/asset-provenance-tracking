<!-- 
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
<!--
    This is the section of "Interested in learning more?" at the end of pages
-->

<template>
  <div class="row" id="learn-more">
    <h2>Interested in learning more?</h2>
    <p class="mb-0" style="font-weight: 400">
      Learn more about Global Open Source Quality Assurance System (GOSQAS) by emailing us at
      <a class="learn-more-desc" href="mailto:info@gosqas.org">info@gosqas.org</a>
      or visiting the links below.
    </p>
    <div>
      <RouterLink to="/how-it-works" v-if="$route.path !== '/how-it-works'">
        <button
          class="baseButton button first learn-more"
          id="learn-more-button"
          style="
            border-width: 2px;
            border-style: solid;
            padding: 10px 20px;
            margin: 20px 20px 0px 0px;
            font-size: 18px;
            border-radius: 10px;
          "
        >
          How It Works
        </button>
      </RouterLink>

      <RouterLink to="/data-privacy" v-if="$route.path !== '/data-privacy'">
        <button
          class="baseButton button middle learn-more"
          id="learn-more-button"
          style="
            border-width: 2px;
            border-style: solid;
            padding: 10px 20px;
            margin: 20px 20px 0px 0px;
            font-size: 18px;
            border-radius: 10px;
          "
        >
          Data & Privacy
        </button>
      </RouterLink>

      <button
        class="baseButton button learn-more"
        id="learn-more-button"
        onclick="window.location.href='https://github.com/gosqasorg/asset-provenance-tracking'"
        style="
          border-width: 2px;
          border-style: solid;
          padding: 10px 20px;
          margin: 20px 20px 0px 0px;
          font-size: 18px;
          border-radius: 10px;
        "
      >
        GDT GitHub
      </button>

      <a
        class="baseButton button learn-more"
        id="learn-more-button"
        href="user_manual.pdf"
        style="
          border-width: 2px;
          border-style: solid;
          padding: 10px 20px;
          margin: 20px 20px 0px 0px;
          font-size: 18px;
          border-radius: 10px;
          text-decoration: none;
          white-space: nowrap;
          display: inline-block;
        "
        >User Manual
      </a>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'learn_more',
  data() {
    return {
      currentUrl: '/'
    };
  },
  watch: {
    $route(to) {
      this.currentUrl = to.path;
      console.info('Learn More Layout sees us as on: ', this.currentUrl);
    }
  }
};
</script>

<style scoped>
.learn-more-desc {
  font-weight: 400;
  overflow-wrap: break-word;
}

@media (min-width: 768px) {
  .learn-more-desc {
    font-size: 20px;
    line-height: 30px;
  }
}

/* Dark mode version*/
@media (prefers-color-scheme: dark) {
  #learn-more {
    background-color: #1e2019;
  }
  h2 {
    color: #ccecfd;
  }
  p {
    color: #ffffff;
  }
  .learn-more-desc {
    color: #ccecfd;
  }
  #learn-more-button {
    color: #ccecfd;
    background-color: #1e2019;
    border: 2px solid #ccecfd;
  }
  #learn-more-button:hover {
    background-color: #ccecfd;
    color: black;
  }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
  #learn-more {
    background-color: #ffffff;
  }
  h2 {
    color: #4e3681;
  }
  p {
    color: #1e2019;
  }
  .learn-more-desc {
    color: #4e3681;
  }
  #learn-more-button {
    color: #322253;
    background-color: #ffffff;
    border: 2px solid #4e3681;
  }
  #learn-more-button:hover {
    background-color: #4e3681;
    color: white;
  }
}
</style>
