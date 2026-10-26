import { checkConnectionStatus, offlineModeFeatureFlag } from "~/services/azureFuncs"

export default defineNuxtPlugin((nuxtApp) => {
    if (offlineModeFeatureFlag) {
        // TODO: Commented out for now, waiting on meeting feedback
        // Detect whether we're online/offline and check for false positives
        // checkConnectionStatus();
    }
});