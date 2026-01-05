export declare const FeaturesSchema: import("@scalar/typebox").TObject<{
    showSidebar: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    showModels: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    showDownload: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    showTestRequestButton: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    showSearch: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    showApiClientImport: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    showDarkModeToggle: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    expandAllTagSections: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
    persistAuthenticationState: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
}>;
export type Features = {
    showSidebar?: boolean;
    showModels?: boolean;
    showDownload?: boolean;
    showTestRequestButton?: boolean;
    showSearch?: boolean;
    showApiClientImport?: boolean;
    showDarkModeToggle?: boolean;
    expandAllTagSections?: boolean;
    persistAuthenticationState?: boolean;
};
export declare const defaultFeatures: Required<Features>;
//# sourceMappingURL=features.d.ts.map