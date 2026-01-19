import { d as defineComponent, c as createElementBlock, o as openBlock, a as createBaseVNode, t as toDisplayString, e as computed, x as createBlock, h as unref, j as normalizeClass, Q as defineStore, a7 as useLocalStorage } from './index-BHfFAmtB.js';

const _hoisted_1 = { block: "" };
const _hoisted_2 = {
  "ml-0.4": "",
  "text-xs": "",
  op75: ""
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "NumberWithUnit",
  props: {
    number: {},
    unit: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("span", _hoisted_1, [
        createBaseVNode("span", null, toDisplayString(_ctx.number), 1),
        createBaseVNode("span", _hoisted_2, toDisplayString(_ctx.unit), 1)
      ]);
    };
  }
});

/* Injected with object hook! */

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DurationDisplay",
  props: {
    duration: {},
    factor: { default: 1 },
    color: { type: Boolean, default: true }
  },
  setup(__props) {
    const props = __props;
    function getDurationColor(duration) {
      if (!props.color)
        return "";
      if (duration == null)
        return "";
      duration = duration * props.factor;
      if (duration < 1)
        return "";
      if (duration > 1e3)
        return "status-red";
      if (duration > 500)
        return "status-yellow";
      if (duration > 200)
        return "status-green";
      return "";
    }
    const units = computed(() => {
      if (!props.duration)
        return ["", "-"];
      if (props.duration < 1)
        return ["<1", "ms"];
      if (props.duration < 1e3)
        return [props.duration.toFixed(0), "ms"];
      if (props.duration < 1e3 * 60)
        return [(props.duration / 1e3).toFixed(1), "s"];
      return [(props.duration / 1e3 / 60).toFixed(1), "min"];
    });
    return (_ctx, _cache) => {
      const _component_NumberWithUnit = _sfc_main$1;
      return openBlock(), createBlock(_component_NumberWithUnit, {
        class: normalizeClass(getDurationColor(_ctx.duration)),
        number: unref(units)[0],
        unit: unref(units)[1]
      }, null, 8, ["class", "number", "unit"]);
    };
  }
});

/* Injected with object hook! */

const useOptionsStore = defineStore("options", () => {
  const view = useLocalStorage(
    "vite-inspect-v1-options",
    // @keep-sorted
    {
      diff: true,
      graphWeightMode: "deps",
      lineWrapping: false,
      listMode: "detailed",
      metricDisplayHook: "transform",
      panelSizeDiff: 30,
      panelSizeModule: 10,
      showBailout: false,
      showOneColumn: false,
      sort: "default"
    },
    { mergeDefaults: true }
  );
  const search = useLocalStorage(
    "vite-inspect-v1-search",
    {
      text: "",
      includeNodeModules: false,
      includeVirtual: false,
      includeUnreached: false,
      exactSearch: false
    },
    { mergeDefaults: true }
  );
  function toggleSort() {
    const rules = [
      "default",
      "time-asc",
      "time-desc"
    ];
    view.value.sort = rules[(rules.indexOf(view.value.sort) + 1) % rules.length];
  }
  function toggleListMode() {
    const modes = [
      "detailed",
      "graph",
      "list"
    ];
    view.value.listMode = modes[(modes.indexOf(view.value.listMode) + 1) % modes.length];
  }
  return {
    view,
    search,
    toggleSort,
    toggleListMode
  };
});

/* Injected with object hook! */

export { _sfc_main as _, _sfc_main$1 as a, useOptionsStore as u };
