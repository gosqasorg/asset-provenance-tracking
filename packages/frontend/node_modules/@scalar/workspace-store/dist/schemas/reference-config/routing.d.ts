export declare const RoutingSchema: import("@scalar/typebox").TObject<{
    basePath: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
    pathNotFound: import("@scalar/typebox").TOptional<import("@scalar/typebox").TString>;
}>;
export type Routing = {
    basePath?: string;
    pathNotFound?: string;
};
export declare const defaultRouting: Required<Routing>;
//# sourceMappingURL=routing.d.ts.map