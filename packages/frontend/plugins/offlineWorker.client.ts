import { offlineQueueConsumerWorker, offlineModeFeatureFlag } from "~/services/azureFuncs"

export default defineNuxtPlugin((nuxtApp) => {
    if (offlineModeFeatureFlag) {
        // Turn off all previous offline worker instances
        localStorage.setItem('gdt-offline-worker-active', 'false');

        // Start the offline mode worker, which will constantly try to remove requests from the queue
        offlineQueueConsumerWorker();
    }
});