import type { AccessToken } from "@azure/core-auth";
import { ChainedTokenCredential } from "./chainedTokenCredential.js";
import type { TokenCredentialOptions } from "../tokenCredentialOptions.js";
/**
 * Provides a default {@link ChainedTokenCredential} configuration for
 * applications that will be deployed to Azure.
 *
 * Only available in Node.js
 */
export declare class AzureApplicationCredential extends ChainedTokenCredential {
    /**
     * Creates an instance of the AzureApplicationCredential class.
     *
     * The AzureApplicationCredential provides a default {@link ChainedTokenCredential} configuration for
     * applications that will be deployed to Azure.
     *
     * Only available in Node.js
     *
     * @param options - Options for configuring the client which makes the authentication request.
     */
    constructor(_tokenCredentialOptions?: TokenCredentialOptions);
    getToken(): Promise<AccessToken>;
}
//# sourceMappingURL=azureApplicationCredential-browser.d.mts.map