// This file contains functions that return the complete list of descendant 
// devices (children, grandchildren, great granchildren, so on) given a key
// or the list of direct descendants (children only) given a key 

import { getProvenance } from '~/services/azureFuncs';


// gets all children given a key
export async function getChildrenKeys(key: string) {

    let childKeysList:string = "";

    const response = await getProvenance(key);
    for (let i=0; i < response.length; i++) {

        childKeysList += response[i].record.children_key + ",";
    }

    let newChildKeysList = childKeysList.split(',');

    newChildKeysList = newChildKeysList.filter(c => String(c).trim()); // filter out if key = ""

    return newChildKeysList;
}

// Gets all descendants given a key
export async function getAllDescendants(key: string) {

    let children_list = await getChildrenKeys(key);

    for (let child_key of children_list) {
        children_list = children_list.concat(await getAllDescendants(child_key));
    }

    return children_list;
}