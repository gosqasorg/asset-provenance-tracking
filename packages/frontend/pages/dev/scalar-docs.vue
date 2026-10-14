<script setup>
import { ApiReference } from '@scalar/api-reference'
import '@scalar/api-reference/style.css'
import spec from '~/public/GDT-OpenAPI-Spec.yaml?raw'

definePageMeta({ layout: false })
</script>

<template>
  <ClientOnly>
    <div style="width: 100vw; min-height: 100vh">
        <ApiReference :configuration="
            { 
                content: spec, 
                agent: { disabled: true },
                mcp: { disabled: true },
            }"
        />
    </div>
  </ClientOnly>
</template>
