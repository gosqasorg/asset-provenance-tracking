<!-- NavButton.vue -->

<template>
  <RouterLink v-if="isInternal" :to="to">
    <button
      class="baseButton button nav-button"
      :style="{
        borderWidth: '2px',
        borderStyle: 'solid',
        padding,
        margin,
        fontSize,
        borderRadius: '10px'
      }"
      v-bind="$attrs"
    >
      {{ text }}
    </button>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  to: string;
  text: string;
  margin?: string | number;
  fontSize?: string | number;
  padding?: string | number;
}>();

const isInternal = computed(() => {
  if (props.to.startsWith('/') && !props.to.startsWith('//')) {
    return true;
  }
  return false;
});

const margin = computed(() => {
  if (props.margin === undefined || props.margin === null) {
    return '20px 20px 0 0';
  }
  if (typeof props.margin === 'number') {
    return props.margin + 'px';
  }
  return props.margin;
});

const fontSize = computed(() => {
  if (props.fontSize === undefined || props.fontSize === null) {
    return '20px';
  }

  if (typeof props.fontSize === 'number') {
    return props.fontSize + 'px';
  }

  return props.fontSize;
});

const padding = computed(() => {
  if (props.padding === undefined || props.padding === null) {
    return '10px 20px';
  }
  if (typeof props.padding === 'number') {
    return props.padding + 'px';
  }
  return props.padding;
});
</script>

<style scoped>
/* Dark mode version*/
@media (prefers-color-scheme: dark) {
  .nav-button {
    color: #ccecfd;
    background-color: #1e2019;
    border: 2px solid #ccecfd;
  }
  .nav-button:hover {
    background-color: #ccecfd;
    color: black;
  }
}

/* Light mode version*/
@media (prefers-color-scheme: light) {
  .nav-button {
    color: #322253;
    background-color: #ffffff;
    border: 2px solid #4e3681;
  }
  .nav-button:hover {
    background-color: #4e3681;
    color: white;
  }
}
</style>
