// This file contains functions that return the complete list of descendant 
// devices (children, grandchildren, great granchildren, so on) given a key
// or the list of direct descendants (children only) given a key 

import { getProvenance, postProvenance } from '~/services/azureFuncs';
import type { Provenance } from '~/utils/types';
import { InternalTagName } from './tags';

// Get all children given a key. Calls API.
export async function getChildrenKeys(key: string) {
    const response = await getProvenance(key);
    return getChildKeys(response);
}

// Gets all descendants given a key
export async function getAllDescendants(key: string) {

    let children_list = await getChildrenKeys(key);

    for (let child_key of children_list) {
        children_list = children_list.concat(await getAllDescendants(child_key));
    }

    return children_list;
}


export function decomposeProvenance(provenance: Provenance[]) {
    // Decompose the provenance array into the first entry and the remaining entries.

    const provenanceNoRecord = provenance.slice(0, -1); // get the provenance without device creation
    const deviceCreationRecord = [provenance.at(-1)]; // the last record in the list should be the device creation
    const deviceRecord = provenance[provenance.length - 1].record; // subset of the record for rendering

    return { provenanceNoRecord, deviceCreationRecord, deviceRecord };
}


export function getChildKeys(provenance: Provenance[]): string[] {
    let childKeys: string[] = []

    for (const p of provenance) {
        const child = p.record.children_key; // Can be "" if not a group or string[] if a group
        // child may be undefined or an empty array
        if (!child || !child.length) {
            continue;
        }
        childKeys = [...childKeys, ...child];
    }

    return childKeys;
}

export function deduplicateKeys(keys: string[]): string[] {
    return Array.from(new Set(keys))
}

export function isGroup(records: any): boolean {
    for (let record of records) {
        if (Boolean(record.children_key)) {
            return true;
        }
    }
    return false;
}

export function hasParent(records: any): boolean {
    for (let record of records) {
        if (record.hasParent) {
            return true;
        }
    }
    return false;
}

// The records are immutable, so we need to iterate through all the records
// to collate all feature flags.
export function getFeatures(records: any) {
    let features: Record<string, boolean> = {
        hasParent: false,
        isGroup: false,
    };
    for (let record of records) {
        if (record.hasParent) {
            features.hasParent = true;
        }
        if (Boolean(record.children_key)) {
            features.isGroup = true;
        }
    }
    return features;
}

export async function addChildKeys(record: any, childKeys: string[], attachments: File[]) {
    if (!record) {
        console.log("No record provided.");
        throw new Error("No record provided.");
    }
    if (!childKeys || childKeys.length == 0) {
        console.log("No child keys provided.");
        throw new Error("No child keys provided.");
    }

    for (let childKey of deduplicateKeys(childKeys)) {
        console.log(`Adding child ${childKey} to group.`);
        try {
            const records = await getProvenance(childKey);
            const features = getFeatures(records);

            console.log("Records: ", records);
            console.log("Features: ", features);

            if (features.hasParent) {
                console.log(`Cannot update child ${childKey} - it already belongs to a group.`);
                continue;
            }

            if (features.isGroup) {
                console.log(`Cannot update child ${childKey} - it already is a group`);
                continue;
            }

            const response = await postProvenance(childKey, {
                blobType: 'deviceRecord',
                description:  "Added to group",
                hasParent: true,
            }, []);
            console.log("Updated records: ", response);
        }
        catch (error) {
            console.error(`Error updating child record ${childKey}: ${error}`);
        }
    }
}

export async function addToGroup(recordKey: string, records: any, attachments?: File[]) {
    if (records[0].record.hasParent as boolean) {
        throw new Error("This record already belongs to a group.");
    }
    if (isGroup(records)) {
        throw new Error("This record is already a group.");
    }

    try {
        // records[0].record.hasParent = true;
        const response = postProvenance(recordKey, {
            blobType: 'deviceRecord',
            description:  "Added to group",
            hasParent: true,
        }, attachments || []);

        // const response = await postProvenance(recordKey, records, []);
        console.log("Updated records: ", response);
    } catch (error) {
        console.error(`Error updating record ${recordKey}: ${error}`);
    }
}

// Annotate: Send new record entry to all children
export async function notifyChildren(records: any, tags: string[], attachments?: File[]) {
    try {
        if (tags.includes(InternalTagName.Annotate)) {
            if (records[0].isReportingKey) {
                // Reporting keys do not have the ability to recall
                console.log("Cannot notify children with the 'annotate' tag. This is a reporting key.");
            } else {
                const uniqueChildKeys = deduplicateKeys(getChildKeys(records));
 

                for (const key of uniqueChildKeys) {
                    postProvenance(key, {
                        blobType: 'deviceRecord',
                        description: "Annotated by admin",
                        children_key: '',
                        tags: tags,
                    }, attachments || [])
                }
                console.log("Finished updating children with 'annotate' tag.");
            }
        }
    } catch (error) {
        console.error(`Error annotating children: ${error}`);
    }
 }
 
 // Recall: Pin new record entry
 export async function recallChildren(records: any, tags: string[], description: string, attachments?: File[]) {
    try {
        if (tags.includes(InternalTagName.Recall)) {
            if (records[0].isReportingKey) {
                // Reporting keys do not have the ability to recall
                console.log("Cannot notify children with the 'recall' tag. This is a reporting key.");
            } else {
                const uniqueChildKeys = deduplicateKeys(getChildKeys(records));
 
 
                for (const key of uniqueChildKeys) {
                    postProvenance(key, {
                        blobType: 'deviceRecord',
                        description: description,
                        children_key: '',
                        tags: tags,
                    }, attachments || [])
                }
                console.log("Finished updating children with 'recall' tag.");
            }
        }
    } catch (error) {
        console.error(`Error notifying children: ${error}`);
    }
 }
 