// This file contains functions that return the complete list of descendant 
// devices (children, grandchildren, great granchildren, so on) given a key
// or the list of direct descendants (children only) given a key 

import { getProvenance, postProvenance } from '~/services/azureFuncs';
import type { Provenance, ProvenanceRecord } from '~/utils/types';

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

export function decomposeProvenance(provenance: Provenance[]) {
    if (provenance.length == 0) {
        throw new Error("No provenance records found.");
    }
    // Decompose the provenance array into the first entry and the remaining entries.
    const deviceCreationRecord = [provenance.at(-1)]; // the last record in the list should be the device creation
    const deviceRecord: ProvenanceRecord = provenance[provenance.length - 1].record; // subset of the record for rendering
    const allOtherRecords = provenance.slice(0, -1); // get the provenance without device creation

    return { deviceCreationRecord, deviceRecord, allOtherRecords };
}

// Get all children given a key. Calls API.
export async function getChildrenKeys(key: string) {
    const response = await getProvenance(key);
    return getChildKeys(response);
}

// Gets all descendants given a key
export async function getAllDescendants(key: string) {
    let children_list = await getChildrenKeys(key);

    for (let child_key of children_list) {
        // TODO: does this recursion work? It will get last children, not all children.
        let children = await getAllDescendants(child_key);
        children_list = children_list.concat(children);
    }

    return children_list;
}

export function deduplicateKeys(keys: string[]): string[] {
    return Array.from(new Set(keys))
}

export async function discombobulate(response: { record: any; }[]) {
    // Split into useful information that we will use later.
    // Metadata is stored in the first record.
    if (response.length == 0) {
        throw new Error("No provenance records found.");
    }
    const localDeviceRecord = response[0].record;
    const hasParent = localDeviceRecord.hasParent;
    const isReportingKey = localDeviceRecord.isReportingKey;
    return [ localDeviceRecord, hasParent, isReportingKey ];
    // let descendantsList = await getAllDescendants(this.deviceKey);
}


export async function addChildKeys(deviceKey: string, childKeys: string[], description: string, attachments: File[]) {
    // Add child keys (if any).
    // 1 is used because the deviceKey is already added (TODO: consider creating that here).

    if (!childKeys || childKeys.length == 0) {
        console.log("No child keys to add.");
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
                        } as ProvenanceRecord,
                        attachments || []
                    )
                }
            }
        }                        
    }
    // this.childKeys = childrenToAdd;
    return  ;
}

// let string_children = this.childKeys.toString();
// let entered_children = string_children.split(",");
// entered_children = [...new Set(entered_children)]; //removing any duplicates
// let new_children_list = entered_children.slice(0); //copy this exact array
// let childExists, child_prov;
// for (let i of entered_children) {
//     let index = new_children_list.lastIndexOf(i);

//     //First, check if entered child exists
//     try { 
//         const response = await getProvenance(i);
//         child_prov = response;
//         childExists = true;
//     } catch(error) {
//         new_children_list.splice(index, 1);
//         this.description = this.description + `\nError: Entered child key does not exist.`;
//         childExists = false;
//     }

//     // If entered child exist, check if it has a parent or is already a descendant of this device
//     if(childExists) {
//         const child_record = child_prov[0].record;
        
//         if (child_record.hasParent) { // Child has a parent, cannot be added
//             this.description = this.description + `\nError: Entered child key already has a container.`;
//             new_children_list.splice(index, 1);
//         } else {
//             let descendants = await getAllDescendants(i);
//             if (descendants.includes(this.deviceKey)) { // Device is a descendant of entered child, cannot be added
//                 this.description = this.description + `\nError: Child device could not be added.`;
//                 new_children_list.splice(index, 1);
//             } else {
//                 postProvenance(i,
//                     {
//                         blobType: 'deviceRecord',
//                         description: "Added parent", // need to discuss whether we want to have a unique description
//                         tags: [],
//                         children_key: [],
//                         hasParent: true,  // make sure the child has parent = true
//                     },
//                     this.attachments || []
//                 )
//             }
//         }
//     }                        
// }