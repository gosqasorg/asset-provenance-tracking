/**
 * When request bodies or response payloads may be one of a number of different schemas, a Discriminator Object gives a hint about the expected schema of the document. This hint can be used to aid in serialization, deserialization, and validation. The Discriminator Object does this by implicitly or explicitly associating the possible values of a named property with alternative schemas.
 *
 * Note that discriminator MUST NOT change the validation outcome of the schema.
 */
export declare const DiscriminatorObjectSchemaDefinition: import("@scalar/typebox").TObject<{
    /** REQUIRED. The name of the property in the payload that will hold the discriminating value. This property SHOULD be required in the payload schema, as the behavior when the property is absent is undefined. */
    propertyName: import("@scalar/typebox").TString;
    /** An object to hold mappings between payload values and schema names or URI references. */
    mapping: import("@scalar/typebox").TOptional<import("@scalar/typebox").TRecord<import("@scalar/typebox").TString, import("@scalar/typebox").TString>>;
}>;
/**
 * When request bodies or response payloads may be one of a number of different schemas, a Discriminator Object gives a hint about the expected schema of the document. This hint can be used to aid in serialization, deserialization, and validation. The Discriminator Object does this by implicitly or explicitly associating the possible values of a named property with alternative schemas.
 *
 * Note that discriminator MUST NOT change the validation outcome of the schema.
 */
export type DiscriminatorObject = {
    /** REQUIRED. The name of the property in the payload that will hold the discriminating value. This property SHOULD be required in the payload schema, as the behavior when the property is absent is undefined. */
    propertyName: string;
    /** An object to hold mappings between payload values and schema names or URI references. */
    mapping?: Record<string, string>;
};
//# sourceMappingURL=discriminator.d.ts.map