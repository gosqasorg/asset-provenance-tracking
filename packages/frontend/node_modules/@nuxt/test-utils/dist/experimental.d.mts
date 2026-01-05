/**
 * This is a function to render a component directly with the Nuxt server.
 */
declare function $fetchComponent(filepath: string, props?: Record<string, unknown>): Promise<unknown>;
declare function componentTestUrl(filepath: string, props?: Record<string, unknown>): string;

export { $fetchComponent, componentTestUrl };
