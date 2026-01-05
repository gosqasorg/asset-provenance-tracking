import { type Ref } from 'vue';
/**
 * Exposes Tailwind CSS breakpoints as reactive media queries
 *
 * **Warning:** This hook is not a replacement for Tailwind CSS breakpoints. Using breakpoints in Javascript can cause issues with Server Side Rendering (SSR) and the Tailwind CSS breakpoints should be used when possible.
 */
export declare function useBreakpoints(): {
    /** The screen sizes defined in the preset */
    screens: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        zoomed: string;
    };
    /** Reactive media queries for each of the screen sizes */
    mediaQueries: Record<"xs" | "sm" | "md" | "lg" | "xl" | "zoomed", Ref<boolean, boolean>>;
    /** The breakpoints as reactive media queries */
    breakpoints: import("vue").ComputedRef<Record<"xs" | "sm" | "md" | "lg" | "xl" | "zoomed", boolean>>;
};
//# sourceMappingURL=useBreakpoints.d.ts.map