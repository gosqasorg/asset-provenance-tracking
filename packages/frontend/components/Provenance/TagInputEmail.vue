<!--
TagInputField.vue -- Tag Input field without the Suggested Tags
Copyright (C) 2024 Nora Moor, Katie Pryal, and GOSQAS
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
  <div>
    <ul id ="emailTagsList" class="ulTagsList"><input ref="emailInputField" type="text" id="emailTagInp" class="form-control" placeholder="Tag(s) for Notifications" @input="updateTagsWithInput" :value="emailEditableValue" /></ul>

    <!-- UI Toolkit (for x icon on tags) -->
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/thinline.css">
  </div>
</template>

<script>
import { EventBus } from '~/utils/event-bus';
import { updateTags, cleanArray } from "../../utils/tagFuncs.js";

// TODO: confirm these fields are properly updated now that remove/create are in a diff. file (should be fine since post works)
let storedTags = [];  // only tags in bubbles
let createdTags = [];  // all tags in input field

export default {
  name: 'TagInputField',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    separator: {
      type: String,
      default: ' ',
    },
  },
  emits: ['updateTags'],
  data() {
    return {
      tags: this.modelValue,
    };
  },
  computed: {
    emailEditableValue: {
      get() {
        return this.tags.join(this.separator);
      },
      set(value) {
        const $value = value.trim() ? value.split(this.separator) : [];
        const uniqueValues = [...new Set($value)];
        const transformedValues = uniqueValues.map(tag => tag.toLowerCase().trim());
        this.tags = transformedValues;
        const cleanedArray = cleanArray(this.tags); // Calling forbidden tags method.

        createdTags = [];
        storedTags.forEach(tag => createdTags.push(tag));
        cleanedArray.forEach(tag => createdTags.push(tag));

        this.$emit ('updateTags', createdTags);
      },
    }
  },
  async mounted() {
    try {
      // reset tags when the page is refreshed
      EventBus.on('feedRefresh2', this.refreshFeed);
      createdTags = [];
      storedTags = [];
    } catch (error) {
        this.isLoading = false;
        this.recordKeyFound = false;
        this.hasReportingKey = false;
        console.log(error)
    }
  },
  beforeDestroy() {
      EventBus.off('feedRefresh2', this.refreshFeed);
  },
  methods: {
    updateTagsWithInput() {
      // Get our most recent changes to the tags input field
      this.emailEditableValue = document.getElementById("emailTagInp").value;

      // Update the stored tags (the colorful ones) in our input section
      this.emailEditableValue = updateTags(storedTags, createdTags, this.emailEditableValue, "emailTagsList", "emailTagInp", "Tag(s) for Notifications");
    },
  },
};
</script>

<style>
  @import '../../assets/css/tag-input.css';
</style>