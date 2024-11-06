import { postProvenance } from "~/services/azureFuncs";
import { ProvenanceRecord } from "~/utils/types";

export async function createGroup(deviceKey: string, record: ProvenanceRecord, groupKey: string, children: string[], ) {
    if (validateKey(groupKey)) {
        if (!record.hasParent && !children.includes(groupKey)) {
            await postProvenance(groupKey, {
                blobType: 'deviceRecord',
                description: 'Group',//record.description,
                tags: [],
                children_key: [deviceKey], // Add the device key as a child.
                hasParent: true,
            }, [])

            record.hasParent = true;
        } else {
            console.log("This device already belongs to a group.");
            // record.description += "\nError: Container could not be added.";
        }
    }
    return record;
}
