import { type InjectionKey } from 'vue';
type SidebarGroupOptions = {
    /** Increment the level of the sidebar groups */
    increment?: boolean;
    /** Reset the level of the sidebar groups */
    reset?: boolean;
};
/**
 * The level of the sidebar groups
 *
 * We shouldn't go deeper than 6 levels
 */
export type SidebarGroupLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/**
 * Tracks the level of the sidebar groups
 *
 * @default 0
 */
export declare const SIDEBAR_GROUPS_SYMBOL: InjectionKey<SidebarGroupLevel>;
/**
 * Get the current level of the sidebar groups
 *
 * Optionally increments or resets the level of the sidebar groups
 * Always returns the current level even if the level is incremented or reset
 */
export declare const useSidebarGroups: (options?: SidebarGroupOptions) => {
    level: SidebarGroupLevel;
};
export {};
//# sourceMappingURL=useSidebarGroups.d.ts.map