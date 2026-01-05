import type { PathItemObject } from './path-item.js';
import { type ReferenceType } from './reference.js';
export declare const CallbackObjectSchemaDefinition: import("@scalar/typebox").TRecord<import("@scalar/typebox").TString, import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"PathItemObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
    $ref: import("@scalar/typebox").TString;
    summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
}>, import("@scalar/typebox").TObject<{
    $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
    $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
}>]>, import("@scalar/typebox").TObject<{
    '$ref-value': import("@scalar/typebox").TRef<"PathItemObject">;
}>]>]>>;
/** A Path Item Object used to define a callback request and expected responses. A complete example is available. */
export type CallbackObject = Record<string, ReferenceType<PathItemObject>>;
//# sourceMappingURL=callback.d.ts.map