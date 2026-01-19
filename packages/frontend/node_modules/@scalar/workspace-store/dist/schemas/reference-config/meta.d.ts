export declare const MetaSchema: import("@scalar/typebox").TObject<{
    title: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    description: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    ogTitle: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    ogDescription: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    ogImage: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    twitterCard: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
}>;
export type Meta = {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
};
export declare const defaultMeta: Required<Meta>;
//# sourceMappingURL=meta.d.ts.map