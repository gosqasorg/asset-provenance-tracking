import * as vite from 'vite';
import { InlineConfig } from 'vite';
import { NuxtConfig, Nuxt } from '@nuxt/schema';
import { InlineConfig as InlineConfig$1 } from 'vitest/node';
import { DotenvOptions } from 'c12';

interface GetVitestConfigOptions {
    nuxt: Nuxt;
    viteConfig: InlineConfig;
}
interface LoadNuxtOptions {
    dotenv?: Partial<DotenvOptions>;
    overrides?: Partial<NuxtConfig>;
}
declare function getVitestConfigFromNuxt(options?: GetVitestConfigOptions, loadNuxtOptions?: LoadNuxtOptions): Promise<InlineConfig & {
    test: InlineConfig$1;
}>;
declare function defineVitestConfig(config?: InlineConfig & {
    test?: InlineConfig$1;
}): vite.UserConfig & Promise<vite.UserConfig> & vite.UserConfigFnObject & vite.UserConfigFnPromise & vite.UserConfigFn;
interface NuxtEnvironmentOptions {
    rootDir?: string;
    /**
     * The starting URL for your Nuxt window environment
     * @default {http://localhost:3000}
     */
    url?: string;
    /**
     * You can define how environment options are read when loading the Nuxt configuration.
     */
    dotenv?: Partial<DotenvOptions>;
    /**
     * Configuration that will override the values in your `nuxt.config` file.
     */
    overrides?: NuxtConfig;
    /**
     * The id of the root div to which the app should be mounted. You should also set `app.rootId` to the same value.
     * @default {nuxt-test}
     */
    rootId?: string;
    /**
     * The name of the DOM environment to use.
     *
     * It also needs to be installed as a dev dependency in your project.
     * @default {happy-dom}
     */
    domEnvironment?: 'happy-dom' | 'jsdom';
    mock?: {
        intersectionObserver?: boolean;
        indexedDb?: boolean;
    };
}
declare module 'vitest/node' {
    interface EnvironmentOptions {
        nuxt?: NuxtEnvironmentOptions;
    }
}
declare module 'vitest' {
    interface EnvironmentOptions {
        nuxt?: NuxtEnvironmentOptions;
    }
}

export { defineVitestConfig, getVitestConfigFromNuxt };
