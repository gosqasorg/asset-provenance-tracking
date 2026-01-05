import type { ApiReferenceConfigurationWithSource, CreateApiReference } from '@scalar/types/api-reference';
/**
 * Reading the configuration from the data-attributes.
 */
export declare function getConfigurationFromDataAttributes(doc: Document): ApiReferenceConfigurationWithSource;
/**
 * Mount the Scalar API Reference on a given document.
 * Read the HTML data-attributes for configuration.
 */
export declare function findDataAttributes(doc: Document, configuration: ApiReferenceConfigurationWithSource): void;
export declare const createContainer: (doc: Document, element?: Element | null) => Element | null;
/**
 * Create (and mount) a new Scalar API Reference
 *
 * @example createApiReference({ url: '/scalar.json' }).mount('#app')
 * @example createApiReference('#app', { url: '/scalar.json' })
 * @example createApiReference(document.getElementById('app'), { url: '/scalar.json' })
 */
export declare const createApiReference: CreateApiReference;
//# sourceMappingURL=html-api.d.ts.map