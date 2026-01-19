import type { MediaTypeObject, ParameterObject } from '@scalar/workspace-store/schemas/v3.1/strict/openapi-document';
/**
 * Extract content value from parameter object
 *
 * Parameters MUST only have one specified content key
 */
export declare const getParameterContentValue: (parameter: ParameterObject) => MediaTypeObject | undefined;
//# sourceMappingURL=get-parameter-content.d.ts.map