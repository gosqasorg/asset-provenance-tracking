<script setup> 
import { ApiReference } from '@scalar/api-reference'
import '@scalar/api-reference/style.css'
import spec from '~/public/GDT-OpenAPI-Spec.yaml?raw'

definePageMeta({ layout: false })

const root = ref(null)
let observer

function addCopyButtons() {
  root.value?.querySelectorAll('pre').forEach((pre) => {
    const host = pre.parentElement
    if (!host || !pre.querySelector('code')) return
    if (host.querySelector('.my-copy-btn') || host.querySelector('[class*="copy" i]')) return

    host.style.position = 'relative'
    const btn = document.createElement('button')
    btn.className = 'my-copy-btn'
    btn.type = 'button'
    btn.textContent = 'Copy'
    btn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(pre.innerText)
      btn.textContent = 'Copied!'
      setTimeout(() => (btn.textContent = 'Copy'), 1500)
    })
    host.appendChild(btn)
  })
}

onMounted(() => {
  observer = new MutationObserver(addCopyButtons)
  observer.observe(root.value, { childList: true, subtree: true })
  addCopyButtons()
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
    <div ref="root" style="width: 100vw; min-height: 100vh;">
  <ClientOnly>
      <ApiReference :configuration="{ content: spec, agent: { disabled: true } }" />
  </ClientOnly>
    </div>
</template>

<style>
.my-copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #555;
  background: #222;
  color: #eee;
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.15s;
}
</style>
