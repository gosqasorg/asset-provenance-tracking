<!-- LargeToggle.vue -->
<template>
  <div class="ms-1 mb-3 toggle-container">
            <input type="checkbox" id="toggle" class="toggleCheckbox" @change="toggleView">
            <label for="toggle" class="toggle-label">
                <div class="toggle-text toggle-left">New Device</div>
                <div class="toggle-text toggle-right">New Container</div>
            </label>
        </div>
</template>

<script lang="ts">
export default {
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

/* Container for the toggle switch */
.toggle-container {
    display: flex;
    justify-content: left;
    margin: 0 auto;
    padding: 10px;
    width: 500px;
    height: 70px;
    border-radius: 20px 0px 20px 0px;
}

/* Custom toggle switch */
.toggle-label {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: fit-content;
    border: 2px solid #4a148c;
    border-radius: 25px;
    background: white;
    cursor: pointer;
    overflow: hidden; /* Ensure no overflow */
}

/* Create the toggle slider */
.toggle-label::before {
    content: '';
    position: absolute;
    width: 50%; /* Half of the label width */
    height: 100%;
    top: 0;
    left: 0;
    background: #4a148c;
    border-radius: 25px;
    transition: left 0.3s;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3); /* Add a shadow for better visibility */
}

/* Text containers */
.toggle-label div {
    padding: 10px;
    text-align: center;
    z-index: 1;
    color: white;
    font-weight: bold;
}

/* Adjust text colors when checked */
.toggleCheckbox:checked + .toggle-label::before {
    left: 50%;
}

.toggleCheckbox:checked + .toggle-label .toggle-left {
    color: #4a148c; /* Inactive text color */
}

.toggleCheckbox:checked + .toggle-label .toggle-right {
    color: black; /* Active text color */
}

.toggleCheckbox + .toggle-label .toggle-left {
    color: white; /* Active text color */
}

.toggleCheckbox + .toggle-label .toggle-right {
    color: black; /* Inactive text color */
}

.ms-1 {
    margin-left: 0.25rem;
}

.mb-3 {
    margin-bottom: 1rem;
}

</style>
