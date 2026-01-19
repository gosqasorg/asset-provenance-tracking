import { Fragment, Suspense, defineComponent, h, inject, nextTick, ref, watch } from "vue";
import { RouterView } from "vue-router";
import { defu } from "defu";
import { generateRouteKey, toArray, wrapInKeepAlive } from "./utils.js";
import { RouteProvider, defineRouteProvider } from "#app/components/route-provider";
import { useNuxtApp } from "#app/nuxt";
import { useRouter } from "#app/composables/router";
import { _wrapInTransition } from "#app/components/utils";
import { LayoutMetaSymbol, PageRouteSymbol } from "#app/components/injections";
import { appKeepalive as defaultKeepaliveConfig, appPageTransition as defaultPageTransition } from "#build/nuxt.config.mjs";
export default defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    const forkRoute = inject(PageRouteSymbol, null);
    let previousPageKey;
    expose({ pageRef });
    const _layoutMeta = inject(LayoutMetaSymbol, null);
    let vnode;
    const done = nuxtApp.deferHydration();
    if (import.meta.client && nuxtApp.isHydrating) {
      const removeErrorHook = nuxtApp.hooks.hookOnce("app:error", done);
      useRouter().beforeEach(removeErrorHook);
    }
    if (props.pageKey) {
      watch(() => props.pageKey, (next, prev) => {
        if (next !== prev) {
          nuxtApp.callHook("page:loading:start");
        }
      });
    }
    if (import.meta.dev) {
      nuxtApp._isNuxtPageUsed = true;
    }
    let pageLoadingEndHookAlreadyCalled = false;
    const routerProviderLookup = /* @__PURE__ */ new WeakMap();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          const isRenderingNewRouteInOldFork = import.meta.client && haveParentRoutesRendered(forkRoute, routeProps.route, routeProps.Component);
          const hasSameChildren = import.meta.client && forkRoute && forkRoute.matched.length === routeProps.route.matched.length;
          if (!routeProps.Component) {
            if (import.meta.client && vnode && !hasSameChildren) {
              return vnode;
            }
            done();
            return;
          }
          if (import.meta.client && vnode && _layoutMeta && !_layoutMeta.isCurrent(routeProps.route)) {
            return vnode;
          }
          if (import.meta.client && isRenderingNewRouteInOldFork && forkRoute && (!_layoutMeta || _layoutMeta?.isCurrent(forkRoute))) {
            if (hasSameChildren) {
              return vnode;
            }
            return null;
          }
          const key = generateRouteKey(routeProps, props.pageKey);
          if (!nuxtApp.isHydrating && !hasChildrenRoutes(forkRoute, routeProps.route, routeProps.Component) && previousPageKey === key) {
            nuxtApp.callHook("page:loading:end");
            pageLoadingEndHookAlreadyCalled = true;
          }
          previousPageKey = key;
          if (import.meta.server) {
            vnode = h(Suspense, {
              suspensible: true
            }, {
              default: () => {
                const providerVNode = h(RouteProvider, {
                  key: key || void 0,
                  vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                  route: routeProps.route,
                  renderKey: key || void 0,
                  vnodeRef: pageRef
                });
                return providerVNode;
              }
            });
            return vnode;
          }
          const hasTransition = !!(props.transition ?? routeProps.route.meta.pageTransition ?? defaultPageTransition);
          const transitionProps = hasTransition && _mergeTransitionProps([
            props.transition,
            routeProps.route.meta.pageTransition,
            defaultPageTransition,
            { onAfterLeave: () => {
              nuxtApp.callHook("page:transition:finish", routeProps.Component);
            } }
          ].filter(Boolean));
          const keepaliveConfig = props.keepalive ?? routeProps.route.meta.keepalive ?? defaultKeepaliveConfig;
          vnode = _wrapInTransition(
            hasTransition && transitionProps,
            wrapInKeepAlive(
              keepaliveConfig,
              h(Suspense, {
                suspensible: true,
                onPending: () => nuxtApp.callHook("page:start", routeProps.Component),
                onResolve: () => {
                  nextTick(() => nuxtApp.callHook("page:finish", routeProps.Component).then(() => {
                    if (!pageLoadingEndHookAlreadyCalled) {
                      return nuxtApp.callHook("page:loading:end");
                    }
                    pageLoadingEndHookAlreadyCalled = false;
                  }).finally(done));
                }
              }, {
                default: () => {
                  const routeProviderProps = {
                    key: key || void 0,
                    vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                    route: routeProps.route,
                    renderKey: key || void 0,
                    trackRootNodes: hasTransition,
                    vnodeRef: pageRef
                  };
                  if (!keepaliveConfig) {
                    return h(RouteProvider, routeProviderProps);
                  }
                  const routerComponentType = routeProps.Component.type;
                  let PageRouteProvider = routerProviderLookup.get(routerComponentType);
                  if (!PageRouteProvider) {
                    PageRouteProvider = defineRouteProvider(routerComponentType.name || routerComponentType.__name);
                    routerProviderLookup.set(routerComponentType, PageRouteProvider);
                  }
                  return h(PageRouteProvider, routeProviderProps);
                }
              })
            )
          ).default();
          return vnode;
        }
      });
    };
  }
});
function _mergeTransitionProps(routeProps) {
  const _props = routeProps.map((prop) => ({
    ...prop,
    onAfterLeave: prop.onAfterLeave ? toArray(prop.onAfterLeave) : void 0
  }));
  return defu(..._props);
}
function haveParentRoutesRendered(fork, newRoute, Component) {
  if (!fork) {
    return false;
  }
  const index = newRoute.matched.findIndex((m) => m.components?.default === Component?.type);
  if (!index || index === -1) {
    return false;
  }
  return newRoute.matched.slice(0, index).some(
    (c, i) => c.components?.default !== fork.matched[i]?.components?.default
  ) || Component && generateRouteKey({ route: newRoute, Component }) !== generateRouteKey({ route: fork, Component });
}
function hasChildrenRoutes(fork, newRoute, Component) {
  if (!fork) {
    return false;
  }
  const index = newRoute.matched.findIndex((m) => m.components?.default === Component?.type);
  return index < newRoute.matched.length - 1;
}
function normalizeSlot(slot, data) {
  const slotContent = slot(data);
  return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
