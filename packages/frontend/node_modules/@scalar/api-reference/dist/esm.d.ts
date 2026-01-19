import type { ApiReferenceConfiguration, SourceConfiguration } from '@scalar/types/api-reference';
/**
 * Initialize Scalar References
 *
 * @deprecated please import { createApiReference } from '@scalar/api-reference' instead
 */
export declare function createScalarReferences(
/** Element to mount the references to */
el: HTMLElement | null, 
/** Configuration object for Scalar References */
initialConfig: Partial<ApiReferenceConfiguration> | Partial<ApiReferenceConfiguration>[], 
/**
 * Will attempt to mount the references immediately
 * For SSR this may need to be blocked and done client side
 */
mountOnInitialize?: boolean): {
    /** Update the configuration for a mounted reference */
    updateConfig(newConfig: Partial<ApiReferenceConfiguration>, mergeConfigs?: boolean): void;
    updateSpec(spec: SourceConfiguration): void;
    /** Mount the references to a given element */
    mount: (mountingEl?: HTMLElement | null) => void;
    /** Unmount the app from an element */
    unmount: () => void;
};
//# sourceMappingURL=esm.d.ts.map