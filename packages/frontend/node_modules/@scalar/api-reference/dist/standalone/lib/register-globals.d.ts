import type { CreateApiReference } from '@scalar/types/api-reference';
declare global {
    interface Window {
        Scalar: {
            createApiReference: CreateApiReference;
        };
    }
}
/** Register any method on the global window.Scalar object, ensure the type is added to the window above */
export declare const registerGlobals: () => void;
//# sourceMappingURL=register-globals.d.ts.map