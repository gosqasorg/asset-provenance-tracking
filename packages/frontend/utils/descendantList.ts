// This file contains functions that return the complete list of descendant 
// devices (children, grandchildren, great granchildren, so on) given a key
// or the list of direct descendants (children only) given a key 

import { getProvenance } from '~/services/azureFuncs';
import type { Provenance } from '~/utils/types';

// gets all children given a key
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

export function addChildKeys(existing_keys: string[], new_keys: string[]) {
    if (new_keys.length == 0) {
        console.error("No child keys provided.");
        return;
    }

    for (const key in new_keys) {
        if (!existing_keys.includes(key)) {
            existing_keys.push(key)
        }
    }
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