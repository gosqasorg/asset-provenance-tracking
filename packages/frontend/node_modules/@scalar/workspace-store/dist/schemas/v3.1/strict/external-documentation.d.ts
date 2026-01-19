/** Allows referencing an external resource for extended documentation. */
export declare const ExternalDocumentationObjectSchemaDefinition: import("@scalar/typebox").TObject<{
    /** REQUIRED. The URI for the target documentation. This MUST be in the form of a URI. */
    url: import("@scalar/typebox").TString;
    /** A description of the target documentation. CommonMark syntax MAY be used for rich text representation. */
    description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
}>;
/** Allows referencing an external resource for extended documentation. */
export type ExternalDocumentationObject = {
    /** REQUIRED. The URI for the target documentation. This MUST be in the form of a URI. */
    url: string;
    /** A description of the target documentation. CommonMark syntax MAY be used for rich text representation. */
    description?: string;
};
//# sourceMappingURL=external-documentation.d.ts.map