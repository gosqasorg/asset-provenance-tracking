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
  <div class="container">
    <ul class="ulTagsList"><input ref="inputField" type="text" class="tagInp form-control" placeholder="Record Tag" @input="updateTags" :value="editableValue" /></ul>

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
import { getDecipheredForbiddenTags } from '~/utils/forbiddenTags';
import { TagName } from "~/utils/tags";
import { EventBus } from '~/utils/event-bus';

let storedTags = [];  // only tags in bubbles
let createdTags = [];  // all tags in input field

function removeTag(inputField, tag) {
  // Remove tag from screen and storedList
  if (storedTags.includes(tag)) {
    storedTags.forEach((item, index) => {
      if (item == tag) {
          storedTags.splice(index, 1);
          createdTags.splice(index, 1);
      }
    });
  }

  // Reload visible tags
  createTag();

  // Updates tags in other files
  const event = new Event('input');
  inputField.dispatchEvent(event);
}

function createTag() {
  let ul = document.getElementsByClassName("ulTagsList");
  let input = document.getElementsByClassName("tagInp");

  ul = Object.entries(ul);
  input = Object.entries(input);

  // Add tags to all tag input fields
  ul.forEach(ul =>{
    ul = ul[1];
    input.forEach(input =>{
      input = input[1];
      ul.querySelectorAll("li").forEach(li => li.remove());
      
      storedTags.slice().reverse().forEach(tag =>{
        // Create new tag
        let liTag = document.createElement('li');
        liTag.style.color = textColorForTag(tag);
        liTag.style.backgroundColor = getColorForTag(tag);
        liTag.innerHTML = `${tag} <i class="uit uit-multiply"></i>`;
        
        // Create event listener for click
        liTag.addEventListener('click', function() {
          removeTag(input, tag);
        });

        if (ul) {
          ul.insertAdjacentElement("afterbegin", liTag);
        }
      });

      if (storedTags.length == 0) {
        input.placeholder = "Record Tag";
      } else {
        input.placeholder = "";
      }
    });
  });
}

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
        const cleanArray = this.cleanArray(this.tags); // Calling forbidden tags method.

        createdTags = [];
        storedTags.forEach(tag => createdTags.push(tag));
        cleanArray.forEach(tag => createdTags.push(tag));

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
    cleanArray(arr) { // checking to see if correct
        const forbiddenWords = getDecipheredForbiddenTags();
        const cleanedArray = arr.filter (tagName => !forbiddenWords.includes (tagName.toLowerCase ()));
        return cleanedArray;
    },
    moveTagToForm(tag) {
      // Store the value that was clicked
      if (!storedTags.includes(tag)) {
        storedTags.push(tag);
        createdTags.splice(createdTags.length - 1, 0, tag);
      }

      this.$emit ('updateTags', createdTags);  // update tags in other files
      
      createTag();
    },
    updateTags(event) {
      let tag = event.target.value;

      // Get the last char of a str, if it's a space then remove space and add to list
      if (storedTags.includes(tag.substring(0, tag.length - 1)) || tag == ' ') {
        event.target.value = "";
      } else if (tag[tag.length - 1] == ' ') {
        // Check to make sure the word is clean before creating tag
        tag = tag.substring(0, tag.length - 1);
        let cleanTag = this.cleanArray([tag]);
        this.editableValue = '';

        if (tag == cleanTag[0]) {
          storedTags.push(tag);
          createdTags.push(tag);
          event.target.value = "";
          createTag();
        } else {
          event.target.value = "";
        }
      }
      // Call set (which updates tags in other files)
      this.editableValue = event.target.value;
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

  .container {
    background-color: transparent;
    padding: 0px;
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