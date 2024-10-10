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
        childKeys.push(p.record.children_key)
    }

    return childKeys;
}
