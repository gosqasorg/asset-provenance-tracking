import type { ScalarIconProps, ScalarIconWeight } from '../types.js';
export declare function useScalarIcon(props?: ScalarIconProps): {
    bind: import("vue").ComputedRef<{
        'aria-label': string;
        'aria-hidden'?: undefined;
        role?: undefined;
        width: string;
        height: string;
    } | {
        'aria-hidden': boolean;
        role: string;
        'aria-label'?: undefined;
        width: string;
        height: string;
    }>;
    weight: import("vue").ComputedRef<ScalarIconWeight>;
};
//# sourceMappingURL=useScalarIcon.d.ts.map