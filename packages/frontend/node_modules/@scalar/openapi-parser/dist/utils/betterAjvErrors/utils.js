const eq = (x) => (y) => x === y;
const not = (fn) => (x) => !fn(x);
const getValues = (o) => Object.values(o);
const notUndefined = (x) => x !== void 0;
const isXError = (x) => (error) => error.keyword === x;
const isRequiredError = isXError("required");
const isAnyOfError = isXError("anyOf");
const isEnumError = isXError("enum");
const getErrors = (node) => node?.errors || [];
const getChildren = (node) => node && getValues(node.children) || [];
const getSiblings = (parent) => (node) => getChildren(parent).filter(not(eq(node)));
const concatAll = (
  /* ::<T> */
  (xs) => (ys) => ys.reduce((zs, z) => zs.concat(z), xs)
);
export {
  concatAll,
  getChildren,
  getErrors,
  getSiblings,
  isAnyOfError,
  isEnumError,
  isRequiredError,
  notUndefined
};
//# sourceMappingURL=utils.js.map
