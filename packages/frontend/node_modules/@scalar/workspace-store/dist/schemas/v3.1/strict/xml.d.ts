/**
 * A metadata object that allows for more fine-tuned XML model definitions.
 *
 * When using arrays, XML element names are not inferred (for singular/plural forms) and the name field SHOULD be used to add that information. See examples for expected behavior.
 */
export declare const XMLObjectSchemaDefinition: import("@scalar/typebox").TObject<{
    /** Replaces the name of the element/attribute used for the described schema property. When defined within items, it will affect the name of the individual XML elements within the list. When defined alongside type being "array" (outside the items), it will affect the wrapping element if and only if wrapped is true. If wrapped is false, it will be ignored. */
    name: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** The URI of the namespace definition. Value MUST be in the form of a non-relative URI. */
    namespace: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** The prefix to be used for the name. */
    prefix: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** Declares whether the property definition translates to an attribute instead of an element. Default value is false. */
    attribute: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    /** MAY be used only for an array definition. Signifies whether the array is wrapped (for example, <books><book/><book/></books>) or unwrapped (<book/><book/>). Default value is false. The definition takes effect only when defined alongside type being "array" (outside the items). */
    wrapped: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
}>;
/**
 * A metadata object that allows for more fine-tuned XML model definitions.
 *
 * When using arrays, XML element names are not inferred (for singular/plural forms) and the name field SHOULD be used to add that information. See examples for expected behavior.
 */
export type XMLObject = {
    /** Replaces the name of the element/attribute used for the described schema property. When defined within items, it will affect the name of the individual XML elements within the list. When defined alongside type being "array" (outside the items), it will affect the wrapping element if and only if wrapped is true. If wrapped is false, it will be ignored. */
    name?: string;
    /** The URI of the namespace definition. Value MUST be in the form of a non-relative URI. */
    namespace?: string;
    /** The prefix to be used for the name. */
    prefix?: string;
    /** Declares whether the property definition translates to an attribute instead of an element. Default value is false. */
    attribute?: boolean;
    /** MAY be used only for an array definition. Signifies whether the array is wrapped (for example, <books><book/><book/></books>) or unwrapped (<book/><book/>). Default value is false. The definition takes effect only when defined alongside type being "array" (outside the items). */
    wrapped?: boolean;
};
//# sourceMappingURL=xml.d.ts.map