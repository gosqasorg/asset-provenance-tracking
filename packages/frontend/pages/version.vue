<template>
  <pre>{{ JSON.stringify(versionInfo, null, 2) }}</pre>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig().public;

const versionInfo = {
  version: config.buildVersion || 'unknown',
  environment: config.environment || 'unknown',
  buildDate: config.buildDate || 'unknown',
  gitCommit: config.gitCommit || 'unknown',
};
</script>

