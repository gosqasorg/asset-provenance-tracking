import type { ResponseObject } from '@scalar/workspace-store/schemas/v3.1/strict/openapi-document';
/**
 * Remove charset from content types
 *
 * Example: `application/json; charset=utf-8` -> `application/json`
 */
export declare function normalizeMimeTypeObject(content?: ResponseObject['content']): ResponseObject['content'];
//# sourceMappingURL=normalize-mime-type-object.d.ts.map