import type { EncodingObject } from './encoding.js';
import type { ExampleObject } from './example.js';
import { type ReferenceType } from './reference.js';
import type { SchemaObject } from './schema.js';
/**
 * Each Media Type Object provides schema and examples for the media type identified by its key.
 *
 * When example or examples are provided, the example SHOULD match the specified schema and be in the correct format as specified by the media type and its encoding. The example and examples fields are mutually exclusive, and if either is present it SHALL override any example in the schema. See Working With Examples for further guidance regarding the different ways of specifying examples, including non-JSON/YAML values.
 */
export declare const MediaTypeObjectSchemaDefinition: import("@scalar/typebox").TObject<{
    /** The schema defining the content of the request, response, parameter, or header. */
    schema: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"SchemaObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"SchemaObject">;
    }>]>]>>;
    /** Example of the media type */
    example: import("@scalar/typebox").TOptional<import("@scalar/typebox").TAny>;
    /** Examples of the media type */
    examples: import("@scalar/typebox").TOptional<import("@scalar/typebox").TRecord<import("@scalar/typebox").TString, import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"ExampleObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"ExampleObject">;
    }>]>]>>>;
    /** A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The encoding field SHALL only apply to Request Body Objects, and only when the media type is multipart or application/x-www-form-urlencoded. If no Encoding Object is provided for a property, the behavior is determined by the default values documented for the Encoding Object. */
    encoding: import("@scalar/typebox").TOptional<import("@scalar/typebox").TRecord<import("@scalar/typebox").TString, import("@scalar/typebox").TRef<"EncodingObject">>>;
}>;
/**
 * Each Media Type Object provides schema and examples for the media type identified by its key.
 *
 * When example or examples are provided, the example SHOULD match the specified schema and be in the correct format as specified by the media type and its encoding. The example and examples fields are mutually exclusive, and if either is present it SHALL override any example in the schema. See Working With Examples for further guidance regarding the different ways of specifying examples, including non-JSON/YAML values.
 */
export type MediaTypeObject = {
    /** The schema defining the content of the request, response, parameter, or header. */
    schema?: ReferenceType<SchemaObject>;
    /** Example of the media type */
    example?: any;
    /** Examples of the media type */
    examples?: Record<string, ReferenceType<ExampleObject>>;
    /** A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The encoding field SHALL only apply to Request Body Objects, and only when the media type is multipart or application/x-www-form-urlencoded. If no Encoding Object is provided for a property, the behavior is determined by the default values documented for the Encoding Object. */
    encoding?: Record<string, EncodingObject>;
};
//# sourceMappingURL=media-type.d.ts.map