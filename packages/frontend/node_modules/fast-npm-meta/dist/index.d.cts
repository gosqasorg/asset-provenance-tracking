interface PackageManifest {
    name: string;
    distTags: Record<string, string> & {
        latest: string;
    };
    versionsMeta: Record<string, PackageVersionMeta>;
    timeCreated: string;
    timeModified: string;
    lastSynced: number;
}
type Engines = Partial<Record<string, string>>;
interface PackageVersionMeta {
    time?: string;
    engines?: Engines;
    deprecated?: string;
}
interface PackageVersionsInfo extends Pick<PackageManifest, 'name' | 'distTags' | 'lastSynced'> {
    versions: string[];
    specifier: string;
    time: {
        created: string;
        modified: string;
    } & Record<string, string>;
}
interface PackageVersionsInfoWithMetadata extends PackageManifest {
    specifier: string;
}
interface ResolvedPackageVersion extends Partial<PackageVersionMeta> {
    name: string;
    version: string | null;
    specifier: string;
    publishedAt: string | null;
    lastSynced: number;
}

interface FetchOptions {
    apiEndpoint?: string;
    /**
     * Fetch function
     */
    fetch?: typeof fetch;
}
interface GetVersionsOptions<WithMetadata extends boolean> extends FetchOptions {
    /**
     * By pass cache and get the latest data
     */
    force?: boolean;
    /**
     * Include all versions that are newer than the specified version
     */
    loose?: boolean;
    /**
     * Includes metadata, this will change the return type
     */
    metadata?: WithMetadata;
}
interface GetLatestVersionOptions extends FetchOptions {
    /**
     * By pass cache and get the latest data
     */
    force?: boolean;
    /**
     * Includes metadata
     */
    metadata?: boolean;
}
declare const defaultOptions: {
    /**
     * API endpoint for fetching package versions
     *
     * @default 'https://npm.antfu.dev/'
     */
    apiEndpoint: string;
};
declare function getLatestVersionBatch(packages: string[], options?: GetLatestVersionOptions): Promise<ResolvedPackageVersion[]>;
declare function getLatestVersion(name: string, options?: GetLatestVersionOptions): Promise<ResolvedPackageVersion>;
declare function getVersionsBatch(packages: string[], options?: GetVersionsOptions<false>): Promise<PackageVersionsInfo[]>;
declare function getVersionsBatch(packages: string[], options: GetVersionsOptions<true>): Promise<PackageVersionsInfoWithMetadata[]>;
declare function getVersions(name: string, options?: GetVersionsOptions<false>): Promise<PackageVersionsInfo>;
declare function getVersions(name: string, options: GetVersionsOptions<true>): Promise<PackageVersionsInfoWithMetadata>;

declare const NPM_REGISTRY = "https://registry.npmjs.org/";
/**
 * Lightweight replacement of `npm-registry-fetch` function `pickRegistry`'
 *
 * @param scope - scope of package, get from 'npm-package-arg'
 * @param npmConfigs - npm configs, read from `.npmrc` file
 * @param defaultRegistry - default registry, default to 'https://registry.npmjs.org/'
 */
declare function pickRegistry(scope: string | null | undefined, npmConfigs: Record<string, unknown>, defaultRegistry?: string): string;

export { type FetchOptions, type GetLatestVersionOptions, type GetVersionsOptions, NPM_REGISTRY, type PackageManifest, type ResolvedPackageVersion, defaultOptions, getLatestVersion, getLatestVersionBatch, getVersions, getVersionsBatch, pickRegistry };
