import { checkConnectionStatus, offlineModeFeatureFlag } from "~/services/azureFuncs"

export default defineNuxtPlugin((nuxtApp) => {
    if (offlineModeFeatureFlag) {
        // Detect whether we're online/offline and check for false positives
        checkConnectionStatus();
    }
});