import { describe, expectTypeOf, it } from "vitest";
describe("OpenAPI", () => {
  it("has a generic type", () => {
    const specification = {
      // anything
    };
    expectTypeOf(specification).toMatchTypeOf();
  });
  it("narrows it down to Swagger 2.0", () => {
    const specification = {
      swagger: "2.0"
    };
    expectTypeOf(specification).toMatchTypeOf();
  });
  it("narrows it down to OpenAPI 3.0.0", () => {
    const specification = {
      openapi: "3.0.0"
    };
    expectTypeOf(specification).toMatchTypeOf();
  });
  it("narrows it down to OpenAPI 3.0.4", () => {
    const specification = {
      openapi: "3.0.4"
    };
    expectTypeOf(specification).toMatchTypeOf();
  });
  it("narrows it down to OpenAPI 3.1.0", () => {
    const specification = {
      openapi: "3.1.0"
    };
    expectTypeOf(specification).toMatchTypeOf();
  });
  it("narrows it down to OpenAPI 3.1.1", () => {
    const specification = {
      openapi: "3.1.1"
    };
    expectTypeOf(specification).toMatchTypeOf();
  });
  it("types a custom extension", () => {
    const specification = {};
    expectTypeOf(specification["random-attribute"]).toEqualTypeOf();
    expectTypeOf(specification["x-custom"]).toEqualTypeOf();
  });
  it("has a HttpMethod type", () => {
    const validMethod = "GET";
    const anotherValidMethod = "get";
    expectTypeOf(validMethod).toMatchTypeOf();
    expectTypeOf(anotherValidMethod).toMatchTypeOf();
    assertType("NOT_A_METHOD");
  });
});
//# sourceMappingURL=openapi-types.test-d.js.map
