<!-- PilotProgram.vue -->

<template>
  <RouterLink to="/dmdm">
    <button
      class="baseButton button w-100"
      id="learn-more-button"
      style="
        border-width: 2px;
        border-style: solid;
        padding: 10px 20px;
        margin: 0px;
        font-size: 20px;
        border-radius: 10px;
      "
    >
      View Our Pilot Program
    </button>
  </RouterLink>
</template>

<style scoped>
/* Dark mode version*/
@media (prefers-color-scheme: dark) {
  #gdt-container {
    background-color: #1e2019;
  }
  h1 {
    color: #ccecfd;
  }
  p {
    color: #ffffff;
    background-color: #1e2019;
  }
  .form-control {
    background-clip: padding-box;
    background-color: #1e2019;
  }
  #learn-more-button {
    color: #ccecfd;
    background-color: #1e2019;
    border: 2px solid #ccecfd;
  }
}
/* Light mode version*/
@media (prefers-color-scheme: light) {
  #gdt-container {
    background-color: #ffffff;
  }
  h1 {
    color: #4e3681;
  }
  p {
    color: black;
    background-color: #ffffff;
  }
  .form-control {
    background-clip: padding-box;
    background-color: #ffffff;
  }
  #learn-more-button {
    color: #322253;
    background-color: #ffffff;
    border: 2px solid #4e3681;
  }
}
</style>
