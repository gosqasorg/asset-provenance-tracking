import type { ObjectDoc, UrlDoc } from '@scalar/workspace-store/client';
import type { OpenApiDocument } from '@scalar/workspace-store/schemas/v3.1/strict/openapi-document';
/**
 * Calculate a default name for the document to make the workspace store name parameter optional
 *
 * @param params.name - If we have a name already, like config.slug
 * @param params.url - URL of the document
 * @param params.document - The document object
 * @param documents - Optional documents record which will automatically iterate the title if we have a duplicate
 * @returns The name of the document
 */
export declare const getDocumentName: ({ name, url, document }?: Partial<UrlDoc> & Partial<ObjectDoc>, documents?: Record<string, OpenApiDocument>) => string;
//# sourceMappingURL=get-document-name.d.ts.map