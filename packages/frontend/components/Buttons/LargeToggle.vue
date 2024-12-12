<!-- LargeToggle.vue -->
<template>
    <div class="ms-1 mb-3 toggle-border form-control">
      <input type="checkbox" id="toggle" class="toggleCheckbox" @change="toggleView">
      <label for="toggle" class="toggle-label">
        <div class="toggle-text toggle-left">{{ leftLabel }}</div>
        <div class="toggle-text toggle-right">{{ rightLabel }}</div>
      </label>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    props: {
      leftLabel: {
        type: String,
        required: true
      },
      rightLabel: {
        type: String,
        required: true
      }
    },
    methods: {
      toggleView() {
        this.$emit('toggle-change');
      }
    }
  }
  </script>

<style scoped>
/* Hide the original checkbox */
.toggleCheckbox {
    display: none;
}

.toggle-border {
  width: fit-content;
  border: 2px solid #4a148c;
  border-radius: 12px;
  padding: 4px;
}

/* Toggle Border and Layout */
.toggle-label {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: fit-content;
    background: white;
    cursor: pointer;
    
}



/* Create the toggle slider */
.toggle-label::before {
    content: '';
    position: absolute;
    width: 50%; /* Half of the label width */
    height: 100%;
    top: 0;
    left: 0;
    background: #4e3681;
    border-radius: 10px;
    padding: 14px 18px;
    transition: left 0.3s;
}

/* Text containers */
.toggle-label div {
    padding: 10px 15px 10px 15px;
    text-align: center;
    z-index: 1;
}

/* Adjust text colors when checked */
.toggleCheckbox:checked + .toggle-label::before {
  left: 50%;
}

.toggleCheckbox:checked + .toggle-label .toggle-left {
  color: black; /* Inactive text color */
}

.toggleCheckbox:checked + .toggle-label .toggle-right {
  color: white; /* Active text color */
}

.toggleCheckbox + .toggle-label .toggle-left {
  color: white; /* Active text color */
}

.toggleCheckbox + .toggle-label .toggle-right {
  color: black; /* Inactive text color */
}
</style>
