import { app, InvocationContext, Timer } from '@azure/functions';
import { usageStatsCache } from './statsCache.js';
import { runQuery } from '../functions/getStats.js';
import { containerClient } from '../functions/httpTrigger.js';


export async function usageRefresh (myTimer: Timer, context: InvocationContext, ): Promise<void> {
    context.log('Refreshing usage stats cache');
    await usageStatsCache.updateTotals(containerClient);
    await usageStatsCache.updateStats(containerClient);
    await usageStatsCache.updateBrowser(runQuery, context);
}

app.timer('refreshUsageStats', {
    schedule: '0 0 * * * *',
    // schedule: '*/10 * * * * *',
    runOnStartup: true,
    handler: usageRefresh,
});