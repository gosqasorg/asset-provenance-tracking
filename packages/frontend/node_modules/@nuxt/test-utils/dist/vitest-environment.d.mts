import { Environment } from 'vitest/environments';
import { App } from 'h3';
import { $Fetch } from 'nitropack';
import { JSDOMOptions, HappyDOMOptions } from 'vitest/node';

declare const _default: Environment;

type NuxtBuiltinEnvironment = 'happy-dom' | 'jsdom';
interface NuxtWindow extends Window {
    __app: App;
    __registry: Set<string>;
    __NUXT_VITEST_ENVIRONMENT__?: boolean;
    __NUXT__: Record<string, unknown>;
    $fetch: $Fetch;
    fetch: ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>);
    IntersectionObserver: unknown;
    Headers: typeof Headers;
}
interface EnvironmentNuxtOptions {
    jsdom?: JSDOMOptions;
    happyDom?: HappyDOMOptions;
}
type EnvironmentNuxt = (global: typeof globalThis, options: EnvironmentNuxtOptions) => Promise<{
    window: NuxtWindow;
    teardown(): void;
}>;

export { type EnvironmentNuxt, type EnvironmentNuxtOptions, type NuxtBuiltinEnvironment, type NuxtWindow, _default as default };
