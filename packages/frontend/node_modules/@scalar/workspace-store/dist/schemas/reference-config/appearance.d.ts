export declare const AppearanceSchema: import("@scalar/typebox").TObject<{
    layout: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"modern">, import("@scalar/typebox").TLiteral<"classic">]>>;
    theme: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    favicon: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    initialColorMode: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"auto">, import("@scalar/typebox").TLiteral<"dark">, import("@scalar/typebox").TLiteral<"light">]>>;
    forceColorMode: import("@scalar/typebox").TOptional<import("@scalar/typebox").TUnion<[import("@scalar/typebox").TLiteral<"dark">, import("@scalar/typebox").TLiteral<"light">]>>;
    css: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    loadDefaultFonts: import("@scalar/typebox").TOptional<import("@scalar/typebox").TBoolean>;
}>;
export type Appearance = {
    layout?: 'modern' | 'classic';
    theme?: string;
    favicon?: string;
    initialColorMode?: 'auto' | 'dark' | 'light';
    forceColorMode?: 'dark' | 'light';
    css?: string;
    loadDefaultFonts?: boolean;
};
export declare const defaultAppearance: Required<Appearance>;
//# sourceMappingURL=appearance.d.ts.map