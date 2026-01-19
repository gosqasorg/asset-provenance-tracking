import { EventHandler, HTTPMethod } from 'h3';
import { SetupContext, RenderFunction, ComputedOptions, MethodOptions, ComponentOptionsMixin, EmitsOptions, ComponentInjectOptions, ComponentOptionsWithoutProps, ComponentOptionsWithArrayProps, ComponentPropsOptions, ComponentOptionsWithObjectProps } from 'vue';
import { ComponentMountingOptions, mount } from '@vue/test-utils';
import { RouteLocationRaw } from 'vue-router';
import * as _testing_library_vue from '@testing-library/vue';
import { RenderOptions as RenderOptions$1 } from '@testing-library/vue';

type Awaitable<T> = T | Promise<T>;
type OptionalFunction<T> = T | (() => Awaitable<T>);
declare function registerEndpoint(url: string, options: EventHandler | {
    handler: EventHandler;
    method: HTTPMethod;
}): () => void;
/**
 * `mockNuxtImport` allows you to mock Nuxt's auto import functionality.
 * @param _name - name of an import to mock.
 * @param _factory - factory function that returns mocked import.
 * @example
 * ```ts
 * import { mockNuxtImport } from '@nuxt/test-utils/runtime'
 *
 * mockNuxtImport('useStorage', () => {
 *  return () => {
 *    return { value: 'mocked storage' }
 *  }
 * })
 * ```
 * @see https://nuxt.com/docs/getting-started/testing#mocknuxtimport
 */
declare function mockNuxtImport<T = unknown>(_name: string, _factory: () => T | Promise<T>): void;
/**
 * `mockComponent` allows you to mock Nuxt's component.
 * @param path - component name in PascalCase, or the relative path of the component.
 * @param setup - factory function that returns the mocked component.
 * @example
 * ```ts
 * import { mockComponent } from '@nuxt/test-utils/runtime'
 *
 * mockComponent('MyComponent', {
 *  props: {
 *    value: String
 *  },
 *  setup(props) {
 *    // ...
 *  }
 * })
 *
 * // relative path or alias also works
 * mockComponent('~/components/my-component.vue', async () => {
 *  // or a factory function
 *  return {
 *    setup(props) {
 *      // ...
 *    }
 *  }
 * })
 *
 * // or you can use SFC for redirecting to a mock component
 * mockComponent('MyComponent', () => import('./MockComponent.vue'))
 * ```
 * @see https://nuxt.com/docs/getting-started/testing#mockcomponent
 */
declare function mockComponent<Props, RawBindings = object>(path: string, setup: OptionalFunction<(props: Readonly<Props>, ctx: SetupContext) => RawBindings | RenderFunction>): void;
declare function mockComponent<Props = {}, RawBindings = {}, D = {}, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = {}, EE extends string = string, I extends ComponentInjectOptions = {}, II extends string = string>(path: string, options: OptionalFunction<ComponentOptionsWithoutProps<Props, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II>>): void;
declare function mockComponent<PropNames extends string, RawBindings, D, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = {}, EE extends string = string, I extends ComponentInjectOptions = {}, II extends string = string>(path: string, options: OptionalFunction<ComponentOptionsWithArrayProps<PropNames, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II>>): void;
declare function mockComponent<PropsOptions extends Readonly<ComponentPropsOptions>, RawBindings, D, C extends ComputedOptions = {}, M extends MethodOptions = {}, Mixin extends ComponentOptionsMixin = ComponentOptionsMixin, Extends extends ComponentOptionsMixin = ComponentOptionsMixin, E extends EmitsOptions = {}, EE extends string = string, I extends ComponentInjectOptions = {}, II extends string = string>(path: string, options: OptionalFunction<ComponentOptionsWithObjectProps<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE, I, II>>): void;

type MountSuspendedOptions<T> = ComponentMountingOptions<T> & {
    route?: RouteLocationRaw;
};
type SetupState$1 = Record<string, any>;
/**
 * `mountSuspended` allows you to mount any vue component within the Nuxt environment, allowing async setup and access to injections from your Nuxt plugins. For example:
 *
 * ```ts
 * // tests/components/SomeComponents.nuxt.spec.ts
 * it('can mount some component', async () => {
 * const component = await mountSuspended(SomeComponent)
 * expect(component.text()).toMatchInlineSnapshot(
 * 'This is an auto-imported component'
 * )
 * })
 *
 * // tests/App.nuxt.spec.ts
 * it('can also mount an app', async () => {
 * const component = await mountSuspended(App, { route: '/test' })
 * expect(component.html()).toMatchInlineSnapshot(`
 * "<div>This is an auto-imported component</div>
 * <div> I am a global component </div>
 * <div>/</div>
 * <a href=\\"/test\\"> Test link </a>"
 * `)
 * })
 * ```
 * @param component the component to be tested
 * @param options optional options to set up your component
 */
declare function mountSuspended<T>(component: T, options?: MountSuspendedOptions<T>): Promise<ReturnType<typeof mount<T>> & {
    setupState: SetupState$1;
}>;

type RenderOptions<C = unknown> = RenderOptions$1<C> & {
    route?: RouteLocationRaw;
};
type SetupState = Record<string, any>;
/**
 * `renderSuspended` allows you to mount any vue component within the Nuxt environment, allowing async setup and access to injections from your Nuxt plugins.
 *
 * This is a wrapper around the `render` function from @testing-libary/vue, and should be used together with
 * utilities from that package.
 *
 * ```ts
 * // tests/components/SomeComponents.nuxt.spec.ts
 * import { renderSuspended } from '@nuxt/test-utils/runtime'
 *
 * it('can render some component', async () => {
 * const { html } = await renderSuspended(SomeComponent)
 * expect(html()).toMatchInlineSnapshot(
 * 'This is an auto-imported component'
 * )
 *
 * })
 *
 * // tests/App.nuxt.spec.ts
 * import { renderSuspended } from '@nuxt/test-utils/runtime'
 * import { screen } from '@testing-library/vue'
 *
 * it('can also mount an app', async () => {
 * const { html } = await renderSuspended(App, { route: '/test' })
 * expect(screen.getByRole('link', { name: 'Test Link' })).toBeVisible()
 * })
 * ```
 * @param component the component to be tested
 * @param options optional options to set up your component
 */
declare function renderSuspended<T>(component: T, options?: RenderOptions<T>): Promise<_testing_library_vue.RenderResult & {
    setupState: SetupState;
}>;
declare global {
    interface Window {
        __cleanup?: Array<() => void>;
    }
}

export { mockComponent, mockNuxtImport, mountSuspended, registerEndpoint, renderSuspended };
