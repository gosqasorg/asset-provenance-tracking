import type { LS_KEYS } from '@scalar/helpers/object/local-storage';
/**
 * Supports pre-flatted local storage
 */
export declare const parseLocalStorage: (lsKey: (typeof LS_KEYS)[keyof typeof LS_KEYS]) => Record<string, unknown>;
/** Take a best guess of the localStorage version */
export declare const getLocalStorageVersion: () => string;
//# sourceMappingURL=local-storage.d.ts.map