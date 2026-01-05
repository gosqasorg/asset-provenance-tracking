import type { SchemaObject } from '@scalar/workspace-store/schemas/v3.1/strict/openapi-document';
/**
 * Checks if the value of a example parameter is the expected type or format
 */
export declare const validateParameter: (schema?: SchemaObject, value?: string | File | null) => {
    ok: true;
} | {
    ok: false;
    message: string;
};
//# sourceMappingURL=validate-parameter.d.ts.map