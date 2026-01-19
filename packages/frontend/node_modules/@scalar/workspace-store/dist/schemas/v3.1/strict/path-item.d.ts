import type { OperationObject } from './operation.js';
import type { ParameterObject } from './parameter.js';
import { type ReferenceType } from './reference.js';
import type { ServerObject } from './server.js';
export declare const PathItemObjectSchemaDefinition: import("@scalar/typebox").TObject<{
    /**
     * Allows for a referenced definition of this path item. The value MUST be in the form of a URI, and the referenced structure MUST be in the form of a Path Item Object. In case a Path Item Object field appears both in the defined object and the referenced object, the behavior is undefined. See the rules for resolving Relative References.
     *
     * Note: The behavior of $ref with adjacent properties is likely to change in future versions of this specification to bring it into closer alignment with the behavior of the Reference Object.
     */
    $ref: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** An optional string summary, intended to apply to all operations in this path. */
    summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** An optional string description, intended to apply to all operations in this path. CommonMark syntax MAY be used for rich text representation. */
    description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** A definition of a GET operation on this path. */
    get: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"OperationObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"OperationObject">;
    }>]>]>>;
    /** A definition of a PUT operation on this path. */
    put: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"OperationObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"OperationObject">;
    }>]>]>>;
    /** A definition of a POST operation on this path. */
    post: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"OperationObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"OperationObject">;
    }>]>]>>;
    /** A definition of a DELETE operation on this path. */
    delete: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"OperationObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"OperationObject">;
    }>]>]>>;
    /** A definition of a PATCH operation on this path. */
    patch: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"OperationObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"OperationObject">;
    }>]>]>>;
    /** A definition of a CONNECT operation on this path. */
    connect: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"OperationObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"OperationObject">;
    }>]>]>>;
    /** A definition of a OPTIONS operation on this path. */
    options: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"OperationObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"OperationObject">;
    }>]>]>>;
    /** A definition of a HEAD operation on this path. */
    head: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"OperationObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"OperationObject">;
    }>]>]>>;
    /** A definition of a TRACE operation on this path. */
    trace: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"OperationObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"OperationObject">;
    }>]>]>>;
    /** An alternative servers array to service all operations in this path. If a servers array is specified at the OpenAPI Object level, it will be overridden by this value. */
    servers: import("@scalar/typebox").TOptional<import("@scalar/typebox").TArray<import("@scalar/typebox").TRef<"ServerObject">>>;
    /** A list of parameters that are applicable for all the operations described under this path. These parameters can be overridden at the operation level, but cannot be removed there. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined in the OpenAPI Object's components.parameters. */
    parameters: import("@scalar/typebox").TOptional<import("@scalar/typebox").TArray<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TRef<"ParameterObject">, import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TIntersect<[import("@scalar/typebox").TObject<{
        $ref: import("@scalar/typebox").TString;
        summary: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
        description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    }>, import("@scalar/typebox").TObject<{
        $status: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"loading">, import("@scalar/typebox").TLiteral<"error">]>>;
        $global: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    }>]>, import("@scalar/typebox").TObject<{
        '$ref-value': import("@scalar/typebox").TRef<"ParameterObject">;
    }>]>]>>>;
}>;
export type PathItemObject = {
    /**
     * Allows for a referenced definition of this path item. The value MUST be in the form of a URI, and the referenced structure MUST be in the form of a Path Item Object. In case a Path Item Object field appears both in the defined object and the referenced object, the behavior is undefined. See the rules for resolving Relative References.
     *
     * Note: The behavior of $ref with adjacent properties is likely to change in future versions of this specification to bring it into closer alignment with the behavior of the Reference Object.
     */
    '$ref'?: string;
    /** An optional string summary, intended to apply to all operations in this path. */
    summary?: string;
    /** An optional string description, intended to apply to all operations in this path. CommonMark syntax MAY be used for rich text representation. */
    description?: string;
    /** A definition of a GET operation on this path. */
    get?: ReferenceType<OperationObject>;
    /** A definition of a PUT operation on this path. */
    put?: ReferenceType<OperationObject>;
    /** A definition of a POST operation on this path. */
    post?: ReferenceType<OperationObject>;
    /** A definition of a DELETE operation on this path. */
    delete?: ReferenceType<OperationObject>;
    /** A definition of a PATCH operation on this path. */
    patch?: ReferenceType<OperationObject>;
    /** A definition of a CONNECT operation on this path. */
    connect?: ReferenceType<OperationObject>;
    /** A definition of a OPTIONS operation on this path. */
    options?: ReferenceType<OperationObject>;
    /** A definition of a HEAD operation on this path. */
    head?: ReferenceType<OperationObject>;
    /** A definition of a TRACE operation on this path. */
    trace?: ReferenceType<OperationObject>;
    /** An alternative servers array to service all operations in this path. If a servers array is specified at the OpenAPI Object level, it will be overridden by this value. */
    servers?: ServerObject[];
    /** A list of parameters that are applicable for all the operations described under this path. These parameters can be overridden at the operation level, but cannot be removed there. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined in the OpenAPI Object's components.parameters. */
    parameters?: ReferenceType<ParameterObject>[];
};
//# sourceMappingURL=path-item.d.ts.map