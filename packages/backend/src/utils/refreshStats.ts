import { app, InvocationContext, Timer } from '@azure/functions';
import { usageStatsCache } from './statsCache.js';
import { containerClient } from '../functions/httpTrigger.js';


export async function usageRefresh (myTimer: Timer, context: InvocationContext, ): Promise<void> {
    context.log('Refreshing usage stats cache');
    // Using promise all to run all update functions in parallel to hopefully reduce lag between the time the timer trigger runs and the time the cache is updated.
    Promise.all([
        usageStatsCache.updateTotals(containerClient),
        usageStatsCache.updateStats(),
        usageStatsCache.updateBrowser(context)
    ]).then(() => {
        context.log('Usage stats cache refreshed');
    }).catch((err) => {
        context.log('Error refreshing usage stats cache', err);
    });
}

// Timer trigger to refresh usage stats every hour, and on startup.
app.timer('refreshUsageStats', {
    schedule: '0 0 * * * *',
    // schedule: '*/10 * * * * *',
    runOnStartup: true, 
    handler: usageRefresh,
});