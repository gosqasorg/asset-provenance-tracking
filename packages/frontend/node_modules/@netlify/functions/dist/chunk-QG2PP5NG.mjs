import {
  __esm
} from "./chunk-C6P2IO65.mjs";

// test/helpers/main.mjs
var invokeLambda;
var init_main = __esm({
  "test/helpers/main.mjs"() {
    "use strict";
    invokeLambda = (handler, { method = "GET", ...options } = {}) => {
      const event = {
        ...options,
        httpMethod: method
      };
      return new Promise((resolve, reject) => {
        const callback = (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        };
        resolve(handler(event, {}, callback));
      });
    };
  }
});

export {
  invokeLambda,
  init_main
};
