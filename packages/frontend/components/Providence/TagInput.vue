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
        // console.log('set', transformedValues); // Uncomment for debugging
          
        this.$emit('updateTags', transformedValues);
      },
    },
  },
  methods: {
    onInput(event) {
      this.editableValue = event.target.value;
    },
  },
};
</script>