import type { AccessToken, TokenCredential } from "@azure/core-auth";
export declare const vsCodeCredentialControl: {
    vsCodeCredentialFinder: never;
};
/**
 * Connects to Azure using the credential provided by the VSCode extension 'Azure Account'.
 */
export declare class VisualStudioCodeCredential implements TokenCredential {
    /**
     * Only available in Node.js
     */
    constructor();
    getToken(): Promise<AccessToken | null>;
}
//# sourceMappingURL=visualStudioCodeCredential-browser.d.mts.map