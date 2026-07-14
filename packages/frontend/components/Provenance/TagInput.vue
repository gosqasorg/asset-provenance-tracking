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
    <ul :id="tagListID" class="ulTagsList"><input ref="inputField" type="text" :id="inputID" class="form-control" :placeholder="placeholder" @input="updateTagsWithInput" :value="editableValue" /></ul>

    <!-- UI Toolkit (for x icon on tags) -->
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/thinline.css">

    <div v-if="showSuggested">
      <h5 class="mt-3 mb-1">Suggested Tags</h5>
      <div class="tag-container mb-2">
        <button class="tag" type="button" v-for="tag in TagName" v-bind:style="'color: '+textColorForTag(tag)+'; background-color: '+getColorForTag(tag)+';'" 
        @click="moveTagToForm(tag)">{{ tag }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getDecipheredForbiddenTags } from '~/utils/forbiddenTags';
import { TagName } from "~/utils/tags";
import { EventBus } from '~/utils/event-bus';
import { redrawTags } from "~/utils/tagFuncs";

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
    isGroup: {
      type: Boolean,
      default: false
    tagListID: {
      type: String,
      default: 'tagsList',
    },
    inputID: {
      type: String,
      default: 'tagInp',
    },
    showSuggested: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: "Record Tag"
    }
  },
  emits: ['updateTags'],
  data() {
    return {
      tags: this.modelValue,
      storedTags: [],  // only tags in bubbles
      createdTags: [],  // all tags in input field
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
        const cleanedArray = this.cleanArray(this.tags); // Calling forbidden tags method.

        this.createdTags = [];
        this.storedTags.forEach(tag => this.createdTags.push(tag));
        cleanedArray.forEach(tag => this.createdTags.push(tag));

        this.$emit ('updateTags', this.createdTags);
      },
    }
  },
  async mounted() {
    try {
      // reset tags when the page is refreshed
      EventBus.on('feedRefresh2', this.refreshFeed);
      this.createdTags = [];
      this.storedTags = [];

      // If we have tags from a redirect update our form to display/store them
      let stashedRecord = JSON.parse(sessionStorage.getItem("gdt-redirect-record") || '{}');
      let recordIsGroup = sessionStorage.getItem("gdt-redirect-isGroup");
      const previousUrl = window.history.state.back;

      if (JSON.stringify(stashedRecord) !== '{}' && stashedRecord.tags.length !== 0 && previousUrl === "/offline-edits") {
        // Display the tags either on the group page or the record page
        if ((this.isGroup && recordIsGroup === "true") || (!this.isGroup && recordIsGroup === "false")) {
          stashedRecord.tags.forEach((tag) => {
            let cleanTag = this.cleanArray([tag]);
            this.editableValue = '';

            if (tag == cleanTag[0]) {
              this.storedTags.push(tag);
              this.createdTags.push(tag);
              createTag();
            }
          })
        }
      }

    } catch (error) {
        this.isLoading = false;
        this.recordKeyFound = false;
        this.hasPublicKey = false;
        console.log(error)
    }
  },
  beforeDestroy() {
      EventBus.off('feedRefresh2', this.refreshFeed);
  },
  methods: {
    cleanArray(array) {
      // Remove any tags with forbidden words in them
      const forbiddenWords = getDecipheredForbiddenTags();
      const cleanedArray = array.filter(tagName => !forbiddenWords.includes(tagName.toLowerCase()));
      return cleanedArray;
    },
    moveTagToForm(tag) {
      // Store the Suggested Tag that was clicked
      if (!this.storedTags.includes(tag)) {
        this.storedTags.push(tag);
        this.createdTags.splice(this.createdTags.length - 1, 0, tag);
      }

      this.updatePlaceholder();  // hide placeholder if tags are stored
      this.$emit ('updateTags', this.createdTags);  // update tags in other files
      
      redrawTags(this.storedTags, this.createdTags, this.tagListID, this.inputID);
    },
    updateTags(tagInput) {
      // Get the last char of tag input, if it's a space then remove the space and add the tag to the list
      if (this.storedTags.includes(tagInput.substring(0, tagInput.length - 1)) || tagInput == ' ') {
        this.editableValue = "";
      } else if (tagInput[tagInput.length - 1] == ' ') {
        // Check to make sure the word is clean before creating the tag
        let tag = tagInput.substring(0, tagInput.length - 1);
        let cleanTag = this.cleanArray([tag]);

        if (tag == cleanTag[0]) {
          this.storedTags.push(tag);
          this.createdTags.push(tag);
          redrawTags(this.storedTags, this.createdTags, this.tagListID, this.inputID);
        }

        // Remove the text from the input field
        this.editableValue = "";
      }
    },
    updatePlaceholder() {
      // Only show the placeholder text if no tags are stored
      let input = document.getElementById(this.inputID);
      if (this.storedTags.length == 0 && input) {
        input.placeholder = this.placeholder;
      } else if (input) {
        input.placeholder = "";
      }
    },
    updateTagsWithInput() {
      // Get our most recent changes to the tags input field
      this.editableValue = document.getElementById(this.inputID).value;

      // Update the stored tags (the colorful ones) in our input section
      this.updateTags(this.editableValue);

      // Hide the placeholder if any tags are stored
      this.updatePlaceholder();
    },
  },
};
</script>

<style>
  .tag {
    color: #333;
    padding: 5px 10px;
    margin: 5px;
    border-radius: 15px;
    font-size: 14px;
    border: none;
  }

  input:focus {
    box-shadow: none !important;
  }

  .content ul.ulTagsList li i{
    font-size: 14px;
  }

  .content ul.ulTagsList{
    display: flex;
    flex-wrap: wrap;
    margin: 12px 0px 12px 0px;
    padding-left: 0px;
    border-radius: 5px;
    background-color: white;
  }

  .content ul.ulTagsList li{
    font-size: 14px;
    margin: 4px 3px;
    list-style: none;
    border-radius: 15px;
    padding: 5px 8px 5px 10px;
    cursor: pointer;
  }

  .content ul.ulTagsList input{
    flex: 1;
    border: none;
    outline: none;
  }

@media (prefers-color-scheme: dark) {
    h5 {
        color: #FFFFFF;
    }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
    h5 {
        color: #4E3681;
    }
}
</style>