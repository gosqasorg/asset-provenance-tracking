/** The license information for the exposed API. */
export declare const LicenseObjectSchemaDefinition: import("@scalar/typebox").TObject<{
    /** REQUIRED. The license name used for the API. */
    name: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** An SPDX license expression for the API. The identifier field is mutually exclusive of the url field. */
    identifier: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** A URI for the license used for the API. This MUST be in the form of a URI. The url field is mutually exclusive of the identifier field. */
    url: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
}>;
/** The license information for the exposed API. */
export type LicenseObject = {
    /** REQUIRED. The license name used for the API. */
    name?: string;
    /** An SPDX license expression for the API. The identifier field is mutually exclusive of the url field. */
    identifier?: string;
    /** A URI for the license used for the API. This MUST be in the form of a URI. The url field is mutually exclusive of the identifier field. */
    url?: string;
};
//# sourceMappingURL=license.d.ts.map