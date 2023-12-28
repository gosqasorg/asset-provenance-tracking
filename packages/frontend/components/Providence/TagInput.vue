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
        this.tags = $value;
        this.$emit('updateTags', $value);
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