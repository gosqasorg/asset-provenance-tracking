import type { SecuritySchemeObject } from '@scalar/workspace-store/schemas/v3.1/strict/openapi-document';
type AuthOption = {
    label: string;
    payload: SecuritySchemeObject;
};
/** Predefined authentication options */
export declare const authOptions: Record<string, AuthOption>;
export {};
//# sourceMappingURL=auth-options.d.ts.map