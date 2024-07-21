<!--
TagInput.vue -- Analyzing User Tag
Copyright (C) 2024 Nora Moor, Katie Pryal, and GOSQAS Team
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
  <input :value="editableValue" @input="onInput" />
</template>

<script>
import { getDecipheredForbiddenTags } from '~/utils/forbiddenTags';

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
        this.$emit ('updateTags', cleanArray);
      },
    },
  },
  methods: {
    cleanArray(arr) { //check to see if correct
        const forbiddenWords = getDecipheredForbiddenTags();
        const cleanedArray = arr.filter (tagName => !forbiddenWords.includes (tagName.toLowerCase ()));
        return cleanedArray;
    },
    onInput(event) {
      this.editableValue = event.target.value;
    },
  },
};
</script>