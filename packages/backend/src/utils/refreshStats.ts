import { app, InvocationContext, Timer } from '@azure/functions';
import { usageStatsCache } from './statsCache.js';
import { containerClient } from '../functions/httpTrigger.js';


export async function usageRefresh (myTimer: Timer, context: InvocationContext, ): Promise<void> {
    context.log('Refreshing usage stats cache');
    // Using allSettled (not all) so one failing update can't cause the invocation to complete
    // while the others are still running in the background.
    const results = await Promise.allSettled([
        usageStatsCache.updateTotals(containerClient),
        usageStatsCache.updateStats(),
        usageStatsCache.updateBrowser(context)
    ]);
    
    for (const result of results) {
        if (result.status === 'rejected') {
            context.log('Error refreshing usage stats cache', result.reason);
        }
    }
    
    context.log('Usage stats cache refreshed');
}

// Timer trigger to refresh usage stats every hour, and on startup.
app.timer('refreshUsageStats', {
    // schedule: '0 0 * * * *',
    schedule: '*/10 * * * * *',
    runOnStartup: true, 
    handler: usageRefresh,
});