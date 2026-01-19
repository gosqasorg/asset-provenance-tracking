import { isObject } from "../helpers/is-object.js";
function isJsonObject(value) {
  if (!/^\s*(\{)/.test(value.slice(0, 500))) {
    return false;
  }
  try {
    const val = JSON.parse(value);
    return isObject(val);
  } catch {
    return false;
  }
}
export {
  isJsonObject
};
//# sourceMappingURL=is-json-object.js.map
