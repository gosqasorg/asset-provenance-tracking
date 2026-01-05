import { type TSchema } from '@scalar/typebox';
export declare const ReferenceObjectExtensionsSchema: import("@scalar/typebox").TObject<{
    /** Indicates the current status of the reference resolution. Can be either 'loading' while fetching the reference or 'error' if the resolution failed. */
    $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
    /** Indicates whether this reference should be resolved globally across all documents, rather than just within the current document context. */
    $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
}>;
/**
 * A simple object to allow referencing other components in the OpenAPI Description, internally and externally.
 *
 * The $ref string value contains a URI RFC3986, which identifies the value being referenced.
 *
 * See the rules for resolving Relative References. */
export declare const ReferenceObjectSchema: import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
    /** REQUIRED. The reference identifier. This MUST be in the form of a URI. */
    $ref: import("@scalar/typebox").TString;
    /** A short summary which by default SHOULD override that of the referenced component. If the referenced object-type does not allow a summary field, then this field has no effect. */
    summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** A description which by default SHOULD override that of the referenced component. CommonMark syntax MAY be used for rich text representation. If the referenced object-type does not allow a description field, then this field has no effect. */
    description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
}>, import("@scalar/typebox").TObject<{
    /** Indicates the current status of the reference resolution. Can be either 'loading' while fetching the reference or 'error' if the resolution failed. */
    $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
    /** Indicates whether this reference should be resolved globally across all documents, rather than just within the current document context. */
    $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
}>]>;
/**
 * A simple object to allow referencing other components in the OpenAPI Description, internally and externally.
 *
 * The $ref string value contains a URI RFC3986, which identifies the value being referenced.
 *
 * See the rules for resolving Relative References. */
export type ReferenceObject = {
    /** REQUIRED. The reference identifier. This MUST be in the form of a URI. */
    '$ref': string;
    /** A short summary which by default SHOULD override that of the referenced component. If the referenced object-type does not allow a summary field, then this field has no effect. */
    summary?: string;
    /** A description which by default SHOULD override that of the referenced component. CommonMark syntax MAY be used for rich text representation. If the referenced object-type does not allow a description field, then this field has no effect. */
    description?: string;
    /** Indicates the current status of the reference resolution. Can be either 'loading' while fetching the reference or 'error' if the resolution failed. */
    '$status'?: 'loading' | 'error';
    /** Indicates whether this reference should be resolved globally across all documents, rather than just within the current document context. */
    '$global'?: boolean;
};
export declare const reference: <T extends TSchema>(schema: T) => import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
    /** REQUIRED. The reference identifier. This MUST be in the form of a URI. */
    $ref: import("@scalar/typebox").TString;
    /** A short summary which by default SHOULD override that of the referenced component. If the referenced object-type does not allow a summary field, then this field has no effect. */
    summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** A description which by default SHOULD override that of the referenced component. CommonMark syntax MAY be used for rich text representation. If the referenced object-type does not allow a description field, then this field has no effect. */
    description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
}>, import("@scalar/typebox").TObject<{
    /** Indicates the current status of the reference resolution. Can be either 'loading' while fetching the reference or 'error' if the resolution failed. */
    $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
    /** Indicates whether this reference should be resolved globally across all documents, rather than just within the current document context. */
    $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
}>]>, import("@scalar/typebox").TObject<{
    '$ref-value': T;
}>]>;
export type ReferenceType<Value> = Value | (ReferenceObject & {
    '$ref-value': Value;
});
//# sourceMappingURL=reference.d.ts.map