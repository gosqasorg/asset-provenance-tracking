<!--
TagInput.vue -- Analyzing User Tag
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
    <ul id="tagsList" class="ulTagsList"><input ref="inputField" type="text" id="tagInp" class="form-control" placeholder="Record Tag" @input="updateTagsWithInput" :value="editableValue" /></ul>

    <!-- UI Toolkit (for x icon on tags) -->
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/thinline.css">

    <h5 class="mt-3 mb-1">Suggested Tags</h5>
    <div class="tag-container mb-2">
      <button class="tag" type="button" v-for="tag in TagName" v-bind:style="'color: '+textColorForTag(tag)+'; background-color: '+getColorForTag(tag)+';'" 
      @click="moveTagToForm(tag)">{{ tag }}</button>
    </div>
  </div>
</template>

<script>
import { TagName } from "~/utils/tags";
import { EventBus } from '~/utils/event-bus';
import { redrawTags, updateTags, cleanArray, updatePlaceholder } from "../../utils/tagFuncs.js";

let storedTags = [];  // only tags in bubbles
let createdTags = [];  // all tags in input field

export default {
  name: 'TagInput',
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
    editableValue: {
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
      let tagInput = document.getElementById("tagInp").value;

      // Update the stored tags (the colorful ones) in our input section
      this.editableValue = updateTags(storedTags, createdTags, tagInput, "tagsList", "tagInp");

      // Hide the placeholder if any tags are stored
      updatePlaceholder(storedTags, "tagInp", "Record Tag");
    },
    moveTagToForm(tag) {
      // Store the value that was clicked
      if (!storedTags.includes(tag)) {
        storedTags.push(tag);
        createdTags.splice(createdTags.length - 1, 0, tag);
      }

      updatePlaceholder(storedTags, "tagInp", "Record Tag");  // hide placeholder if tags are stored
      this.$emit ('updateTags', createdTags);  // update tags in other files
      
      redrawTags(storedTags, createdTags, "tagsList", "tagInp", "Record Tag");
    },
  },
};
</script>

<style>
  @import '../../assets/css/tag-input.css';
</style>