import { _ as _sfc_main$1, a as __unplugin_components_3, b as _sfc_main$2, e as _sfc_main$3, d as _sfc_main$4 } from './QuerySelector.vue_vue_type_script_setup_true_lang-DZag_XE-.js';
import { d as defineComponent, m as usePayloadStore, c as createElementBlock, i as createVNode, q as withCtx, F as Fragment, s as resolveComponent, o as openBlock, a as createBaseVNode, r as renderList, h as unref, x as createBlock, y as resolveDynamicComponent, A as h } from './index-BHfFAmtB.js';
import './_plugin-vue_export-helper-DgDhiqFL.js';

const _hoisted_1 = { "w-full": "" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "plugins",
  setup(__props) {
    const payload = usePayloadStore();
    function renderRow(idx) {
      const envs = payload.instance.environments.map(
        (e) => payload.instance.environmentPlugins[e].includes(idx)
      );
      const nodes = [];
      envs.forEach((e, i) => {
        if (envs[i - 1] === e)
          return;
        if (!e) {
          nodes.push(h("td"));
        } else {
          let length = envs.slice(i).findIndex((e2) => !e2);
          if (length === -1)
            length = envs.length - i;
          nodes.push(h("td", {
            colspan: length,
            class: "border border-main px4 py1"
          }, [
            h(_sfc_main$4, { name: payload.instance.plugins[idx].name })
          ]));
        }
      });
      return () => nodes;
    }
    return (_ctx, _cache) => {
      const _component_RouterLink = resolveComponent("RouterLink");
      const _component_QuerySelector = _sfc_main$2;
      const _component_NavBar = _sfc_main$1;
      const _component_Badge = _sfc_main$3;
      const _component_Container = __unplugin_components_3;
      return openBlock(), createElementBlock(Fragment, null, [
        createVNode(_component_NavBar, null, {
          default: withCtx(() => [
            createVNode(_component_RouterLink, {
              "my-auto": "",
              "outline-none": "",
              "icon-btn": "",
              to: "/"
            }, {
              default: withCtx(() => _cache[0] || (_cache[0] = [
                createBaseVNode("div", { "i-carbon-arrow-left": "" }, null, -1)
              ])),
              _: 1
            }),
            _cache[1] || (_cache[1] = createBaseVNode("div", { "flex-auto": "" }, null, -1)),
            createVNode(_component_QuerySelector)
          ]),
          _: 1
        }),
        createVNode(_component_Container, {
          flex: "",
          "overflow-auto": "",
          p5: ""
        }, {
          default: withCtx(() => [
            createBaseVNode("table", _hoisted_1, [
              createBaseVNode("thead", null, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(unref(payload).instance.environments, (e) => {
                  return openBlock(), createElementBlock("td", {
                    key: e,
                    border: "~ main",
                    p2: "",
                    "text-center": ""
                  }, [
                    createVNode(_component_Badge, {
                      text: e,
                      size: "none",
                      px2: "",
                      py1: "",
                      "text-sm": "",
                      "font-mono": ""
                    }, null, 8, ["text"])
                  ]);
                }), 128))
              ]),
              createBaseVNode("tbody", null, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(unref(payload).instance.plugins, (p, idx) => {
                  return openBlock(), createElementBlock("tr", { key: idx }, [
                    (openBlock(), createBlock(resolveDynamicComponent(renderRow(idx))))
                  ]);
                }), 128))
              ])
            ])
          ]),
          _: 1
        })
      ], 64);
    };
  }
});

/* Injected with object hook! */

/* Injected with object hook! */

export { _sfc_main as default };
