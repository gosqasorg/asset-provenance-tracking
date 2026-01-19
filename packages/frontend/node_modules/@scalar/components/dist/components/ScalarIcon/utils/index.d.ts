import type { ICONS } from '../icons';
import type { LOGOS } from '../logos';
/** @deprecated Use the icons from the `@scalar/icons` package instead. */
export type Icon = (typeof ICONS)[number];
/** @deprecated Use the icons from the `@scalar/icons` package instead. */
export type Logo = (typeof LOGOS)[number];
/**
 * Generate a Vue component from the icon SVGs
 *
 * For any changes to this file, please ensure it works with SSR
 */
export declare const getIcon: (name: Icon) => SVGElement | null;
/**
 * Generate a Vue component from the logo SVGs
 *
 * For any changes to this file, please ensure it works with SSR
 */
export declare const getLogo: (name: Logo) => SVGElement | null;
//# sourceMappingURL=index.d.ts.map