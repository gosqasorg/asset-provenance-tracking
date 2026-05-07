<template>
  <div class="endpoint-rectangle" :class="{ 'endpoint-rectangle--page': variant === 'page' }">
    <ClientOnly>
      <div :id="mountDomId"></div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useId } from 'vue'
import 'swagger-ui-dist/swagger-ui.css'

const props = withDefaults(
  defineProps<{
    /** OpenAPI document URL under `public/` (e.g. `/openAPI-docs-sample.yaml`). */
    specUrl?: string
    /** `embed`: bounded height (e.g. Data & Privacy). `page`: full-page docs. */
    variant?: 'embed' | 'page'
  }>(),
  {
    specUrl: '/openAPI-docs-with-servers.yaml',
    variant: 'embed'
  }
)

const mountDomId = `swagger-ui-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`

const domSelector = computed(() => `#${CSS.escape(mountDomId)}`)

onMounted(async () => {
  const { SwaggerUIBundle } = await import('swagger-ui-dist')

  SwaggerUIBundle({
    url: props.specUrl,
    dom_id: domSelector.value,
    presets: [SwaggerUIBundle.presets.apis],
    layout: 'BaseLayout',
    docExpansion: 'list',
    deepLinking: false
  })
})
</script>

<style scoped>
.endpoint-rectangle {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  padding: 10px;
}

.endpoint-rectangle--page {
  border: none;
  border-radius: 0;
  padding: 0;
  max-width: 100%;
}

:deep(.swagger-ui .topbar) {
  display: none;
}
:deep(.swagger-ui .info) {
  display: none;
}
:deep(.swagger-ui .scheme-container) {
  display: none;
}

:deep(.swagger-ui) {
  max-height: 600px;
  overflow-y: auto;
}

.endpoint-rectangle--page :deep(.swagger-ui) {
  max-height: none;
  min-height: 60vh;
  overflow-y: visible;
}
</style>
