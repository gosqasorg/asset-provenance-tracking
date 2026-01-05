import { vi } from "vitest";
if (typeof window !== "undefined" && window.__NUXT_VITEST_ENVIRONMENT__) {
  const { useRouter } = await import("#app/composables/router");
  await import("#app/nuxt-vitest-app-entry").then((r) => r.default());
  const nuxtApp = useNuxtApp();
  await nuxtApp.callHook("page:finish");
  useRouter().afterEach(() => nuxtApp.callHook("page:finish"));
  vi.resetModules();
}
export {};
