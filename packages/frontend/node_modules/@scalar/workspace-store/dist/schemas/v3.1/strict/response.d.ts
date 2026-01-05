import type { HeaderObject } from '../../../schemas/v3.1/strict/header.js';
import type { MediaTypeObject } from '../../../schemas/v3.1/strict/media-type.js';
import type { LinkObject } from './link.js';
import { type ReferenceType } from './reference.js';
export declare const ResponseObjectSchemaDefinition: import("@scalar/typebox").TObject<{
    /** REQUIRED. A description of the response. CommonMark syntax MAY be used for rich text representation. */
    description: import("@scalar/typebox").TString;
    /** Maps a header name to its definition. RFC7230 states header names are case insensitive. If a response header is defined with the name "Content-Type", it SHALL be ignored. */
    headers: import("@scalar/typebox").TOptional<import("@scalar/typebox").TRecord<import("@scalar/typebox").TString, import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"HeaderObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"HeaderObject">;
    }>]>]>>>;
    /** A map containing descriptions of potential response payloads. The key is a media type or media type range and the value describes it. For responses that match multiple keys, only the most specific key is applicable. e.g. "text/plain" overrides "text/*"  */
    content: import("@scalar/typebox").TOptional<import("@scalar/typebox").TRecord<import("@scalar/typebox").TString, import("@scalar/typebox").TRef<"MediaTypeObject">>>;
    /** A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for Component Objects. */
    links: import("@scalar/typebox").TOptional<import("@scalar/typebox").TRecord<import("@scalar/typebox").TString, import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"LinkObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"LinkObject">;
    }>]>]>>>;
}>;
/**
 * Describes a single response from an API operation, including design-time, static links to operations based on the response.
 */
export type ResponseObject = {
    /** REQUIRED. A description of the response. CommonMark syntax MAY be used for rich text representation. */
    description: string;
    /** Maps a header name to its definition. RFC7230 states header names are case insensitive. If a response header is defined with the name "Content-Type", it SHALL be ignored. */
    headers?: Record<string, ReferenceType<HeaderObject>>;
    /** A map containing descriptions of potential response payloads. The key is a media type or media type range and the value describes it. For responses that match multiple keys, only the most specific key is applicable. e.g. "text/plain" overrides "text/*"  */
    content?: Record<string, MediaTypeObject>;
    /** A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for Component Objects. */
    links?: Record<string, ReferenceType<LinkObject>>;
};
//# sourceMappingURL=response.d.ts.map