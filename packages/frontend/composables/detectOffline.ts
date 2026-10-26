import { ref, onMounted, onUnmounted } from 'vue';

export function detectOffline() {
    const baseUrl = useRuntimeConfig().public.baseUrl;
    const offline = ref(false);
    let runLoop = true;

    function updateOfflineStatus() {
        // When a listener detects a change in connection update our offline status
        if (navigator.onLine) {
            // If navigator says we're online then confirm it's not a false positive
            confirmOnlineOnce();
        } else {
            // If navigator says we're offline then return offline
            offline.value = true;
        }
    }

    async function confirmOnlineOnce() {
        // Make a fetch request to confirm we're online
        // (we use this to immediately update the offline status on a change, vs. the loop which must wait)
        try {
            const response = await fetch(`${baseUrl}/getNewDeviceKey`, {
                method: "GET"
            });
            offline.value = false;
        } catch (error) {
            offline.value = true;
        }
    }

    async function confirmOnlineLoop() {
        // Loop fetch requests as long as the navigator reports online to confirm we're still actually online
        // (we use this to make sure we don't get a false positive between connection changes)
        while (runLoop) {
            if (navigator.onLine) {
                try {
                    // NOTE: It might be worth having a custom endpoint dedicated to detecting offline
                    const response = await fetch(`${baseUrl}/getNewDeviceKey`, {
                        method: "GET"
                    });
                    offline.value = false;
                } catch (error) {
                    offline.value = true;
                }
            }

            await new Promise((r) => setTimeout(r, 30000));
        }
    }

    async function stopConfirmOnlineLoop() {
        // When we leave the page turn off the confirmOnlineLoop
        runLoop = false;
    }

    // Check if we're offline on page load and start the loop to check for online false positives
    updateOfflineStatus();
    confirmOnlineLoop();

    // Listen to changes in connection and update our visuals as needed
    onMounted(() => {
        window.addEventListener('online', updateOfflineStatus);
        window.addEventListener('offline', updateOfflineStatus);
    });
    onUnmounted(() => { 
        window.removeEventListener('online', updateOfflineStatus);
        window.removeEventListener('offline', updateOfflineStatus); 
        stopConfirmOnlineLoop(); 
    });

    return offline;
}