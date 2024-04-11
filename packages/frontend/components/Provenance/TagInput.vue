<template>
  <input :value="editableValue" @input="onInput" />
</template>

<script>
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
        // Call forbidden tags method.
        const cleanArray = cleanArray(words);
        // console.log('set', transformedValues); // Uncomment for debugging
        this.$emit ('updateTags', cleanArray);
      },
    },
  },
  methods: {
    onInput(event) {
      this.editableValue = event.target.value;
      // console.log('onInput', this.editableValue); // Uncomment for debugging
      // Write method here.
    },
    cleanArray (arr) { //check to see if correct
        const forbiddenWords = ['banana', 'apple', 'orange'];
        const cleanedArray = arr.filter (tagName => !forbiddenWords.includes (tagName.toLowerCase ()));
        return cleanedArray;
    }
  },
};
</script>