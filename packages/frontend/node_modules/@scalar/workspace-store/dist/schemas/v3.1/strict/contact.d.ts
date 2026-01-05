/** Contact information for the exposed API. */
export declare const ContactObjectSchemaDefinition: import("@scalar/typebox").TObject<{
    /** The identifying name of the contact person/organization. */
    name: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** The URI for the contact information. This MUST be in the form of a URI. */
    url: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    /** The email address of the contact person/organization. This MUST be in the form of an email address. */
    email: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
}>;
/** Contact information for the exposed API. */
export type ContactObject = {
    /** The identifying name of the contact person/organization. */
    name?: string;
    /** The URI for the contact information. This MUST be in the form of a URI. */
    url?: string;
    /** The email address of the contact person/organization. This MUST be in the form of an email address. */
    email?: string;
};
//# sourceMappingURL=contact.d.ts.map