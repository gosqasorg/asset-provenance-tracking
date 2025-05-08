export interface VersionInfo {
    version: string;
    gitCommit: string;
    buildTime: string;
}
export const VERSION_INFO: VersionInfo = {
    // This is a placeholder and should be replaced by the updateVersion script
    version: "1.0.0",
    gitCommit: "unknown",
    buildTime: new Date().toISOString()
};