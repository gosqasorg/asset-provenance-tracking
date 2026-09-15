// TODO: statscache class todos:
// - make updater fucntions for totals, stats, browsers for the time trigger to call
// - make variables for cache storage for the getters
// - make getters for totals, stats, browsers for http requests to use

// Figure out how to populat variables for cache storage- since they get there vals from time trigger everyhour
// Maybe Call updater functions on launch? discuss with vincent
import { ContainerClient } from "@azure/storage-blob";

interface TotalsData {
    totalRecords: number;
    totalDevices: number;
    totalAttachments: number;
}

// Helper Functoin
export function findDeviceIdFromName(blobName: string): string {
    // blobNames look like: 'gosqas/63f4b781c0688d83d40908ff368fefa6a2fa4cd470216fd83b3d7d4c642578c0/prov/1a771caa4b15a45ae97b13d7a336e1e9c9ec1c91c70f1dc8f7749440c0af8114'
    // where the id is that last part (before the last slash)
    return blobName.split("/", 4)[1];
}

class StatsCache {
    private totals: TotalsData = { totalRecords: 0, totalDevices: 0, totalAttachments: 0 };;
    private queryStats: any;    
    private browsersStats: any;

    // Getters
    getTotals() : TotalsData {
        return this.totals;
    }

    // Updaters
    async updateTotals(containerClient: ContainerClient) : Promise<void> {
        const containerExists = await containerClient.exists();
        let totalRecords = 0;
        let totalAttachments = 0;
        const uniqueRecords = new Set<string>();

        if (containerExists) {
            for await (const blob of containerClient.listBlobsFlat()) {
                // Only count blobs that are records or legacy records, skip attachments
                if (blob.name.includes('prov/')) {
                    totalRecords++
                    uniqueRecords.add(findDeviceIdFromName(blob.name))
                } else if (!(blob.name.includes('statistics/'))) {
                    totalAttachments++
                }
            }
        }   

        this.totals = { totalRecords, totalDevices: uniqueRecords.size, totalAttachments };    
    }

}

export const usageStatsCache = new StatsCache();