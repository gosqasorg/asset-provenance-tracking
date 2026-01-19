"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureApplicationCredential = void 0;
const defaultAzureCredential_js_1 = require("./defaultAzureCredential.js");
const chainedTokenCredential_js_1 = require("./chainedTokenCredential.js");
/**
 * Provides a default {@link ChainedTokenCredential} configuration that should
 * work for most applications that use the Azure SDK.
 */
class AzureApplicationCredential extends chainedTokenCredential_js_1.ChainedTokenCredential {
    /**
     * Creates an instance of the AzureApplicationCredential class.
     *
     * The AzureApplicationCredential provides a default {@link ChainedTokenCredential} configuration that should
     * work for most applications deployed on Azure. The following credential types will be tried, in order:
     *
     * - {@link EnvironmentCredential}
     * - {@link ManagedIdentityCredential}
     *
     * Consult the documentation of these credential types for more information
     * on how they attempt authentication.
     *
     * @param options - Optional parameters. See {@link AzureApplicationCredentialOptions}.
     */
    constructor(options) {
        const credentialFunctions = [
            defaultAzureCredential_js_1.createEnvironmentCredential,
            defaultAzureCredential_js_1.createDefaultManagedIdentityCredential,
        ];
        super(...credentialFunctions.map((createCredentialFn) => createCredentialFn(options)));
    }
}
exports.AzureApplicationCredential = AzureApplicationCredential;
//# sourceMappingURL=azureApplicationCredential.js.map