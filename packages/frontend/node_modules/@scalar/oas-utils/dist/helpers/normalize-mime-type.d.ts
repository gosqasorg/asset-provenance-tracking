import type { ContentType } from '@scalar/types/legacy';
/**
 * Normalizes a MIME type to a standard format.
 *
 * Input: application/problem+json; charset=utf-8
 * Output: application/json
 */
export declare function normalizeMimeType(contentType: undefined): undefined;
export declare function normalizeMimeType(contentType: string): ContentType;
//# sourceMappingURL=normalize-mime-type.d.ts.map