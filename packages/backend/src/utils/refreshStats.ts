// TODO: Make time trigger that calls updateStats function every hour
import { app, InvocationContext, Timer } from '@azure/functions';
import { usageStatsCache, findDeviceIdFromName } from './statsCache.js';
import { containerClient } from './httpTrigger.js'; 


export async function usageRefresh (myTimer: Timer, context: InvocationContext, ): Promise<void> {
    context.log('Refreshing usage stats cache');
    await usageStatsCache.updateTotals(containerClient);
}

app.timer('refreshUsageStats', {
    schedule: '0 0 * * * *',
    handler: usageRefresh,
});