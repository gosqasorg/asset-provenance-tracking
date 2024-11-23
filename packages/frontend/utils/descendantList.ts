// This file contains functions that return the complete list of descendant 
// devices (children, grandchildren, great granchildren, so on) given a key
// or the list of direct descendants (children only) given a key 

import { getProvenance, postProvenance } from '~/services/azureFuncs';
import type { Provenance } from '~/utils/types';

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
        const child = p.record.children_key;
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

export async function addChildKeys(deviceKey: string, childKeys: string[], description: string, attachments: File[]) {
    // Add child keys (if any).
    // 1 is used because the deviceKey is already added (TODO: consider creating that here).

    if (!childKeys || childKeys.length == 0) {
        return;
    }

    const dedupedKeys = deduplicateKeys(childKeys);
    
    let string_children = childKeys.toString();
    let entered_children = string_children.split(",");
    entered_children = [...new Set(entered_children)]; //removing any duplicates

    let childrenToAdd = entered_children.slice(0); //copy this exact array

    
    let childProvenance;
    for (let childKey of dedupedKeys) {
        const index = childrenToAdd.lastIndexOf(childKey);

        //First, check if entered child exists
        try { 
            childProvenance = await getProvenance(childKey);
        } catch(error) {
            childrenToAdd.splice(index, 1); // remove the child key from the list
            description += `\nError: Entered child key does not exist.`;
        }

        // If entered child exist, check if it has a parent or is already a descendant of this device
        if(childProvenance) {
            const childRecord = childProvenance[0].record;
            
            if (childRecord.hasParent) {
                description += `\nError: Entered child key already has a container.`;
                childrenToAdd.splice(index, 1);
            } else {
                const descendants = await getAllDescendants(childKey);
                if (descendants.includes(deviceKey)) {
                    description += `\nError: Child device could not be added.`;
                    childrenToAdd.splice(index, 1);
                } else {
                    // Add the parent to the child.
                    await postProvenance(childKey,
                        {
                            blobType: 'deviceRecord',
                            description: "Added parent",
                            tags: [],
                            children_key: [],
                            hasParent: true,
                        },
                        attachments || []
                    )
                }
            }
        }                        
    }
    // this.childKeys = childrenToAdd;
    return  ;
}