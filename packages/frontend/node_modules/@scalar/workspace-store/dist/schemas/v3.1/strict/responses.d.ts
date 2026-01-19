import { type ReferenceType } from './reference.js';
import type { ResponseObject } from './response.js';
/**
 * A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.
 *
 * The documentation is not necessarily expected to cover all possible HTTP response codes because they may not be known in advance. However, documentation is expected to cover a successful operation response and any known errors.
 *
 * The default MAY be used as a default Response Object for all HTTP codes that are not covered individually by the Responses Object.
 *
 * The Responses Object MUST contain at least one response code, and if only one response code is provided it SHOULD be the response for a successful operation call.
 */
export declare const ResponsesObjectSchemaDefinition: import("@scalar/typebox").TRecord<import("@scalar/typebox").TString, import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"ResponseObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
    $ref: import("@scalar/typebox").TString;
    summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
}>, import("@scalar/typebox").TObject<{
    $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
    $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
}>]>, import("@scalar/typebox").TObject<{
    '$ref-value': import("@scalar/typebox").TRef<"ResponseObject">;
}>]>]>>;
/**
 * A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.
 *
 * The documentation is not necessarily expected to cover all possible HTTP response codes because they may not be known in advance. However, documentation is expected to cover a successful operation response and any known errors.
 *
 * The default MAY be used as a default Response Object for all HTTP codes that are not covered individually by the Responses Object.
 *
 * The Responses Object MUST contain at least one response code, and if only one response code is provided it SHOULD be the response for a successful operation call.
 */
export type ResponsesObject = Record<string, ReferenceType<ResponseObject>>;
//# sourceMappingURL=responses.d.ts.map