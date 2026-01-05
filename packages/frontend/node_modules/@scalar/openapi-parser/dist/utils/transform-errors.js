import { betterAjvErrors } from "./betterAjvErrors/index.js";
function transformErrors(specification, errors) {
  if (typeof errors === "string") {
    return [
      {
        message: errors
      }
    ];
  }
  return betterAjvErrors(specification, null, errors, {
    indent: 2
  }).map((error) => {
    error.message = error.message.trim();
    return error;
  });
}
export {
  transformErrors
};
//# sourceMappingURL=transform-errors.js.map
