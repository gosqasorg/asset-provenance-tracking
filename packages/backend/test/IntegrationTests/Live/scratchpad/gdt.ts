#!/usr/bin/env -S npx --yes tsx

import { getNewDeviceKey } from './gdt-utils';

console.log(await getNewDeviceKey())

/*

const baseUrl = "https://gosqasbe.azurewebsites.net/api";
        
// Generate device keys in parallel
const [deviceKeyResponse] = await Promise.all([
    fetch(`${baseUrl}/getNewDeviceKey`),
]);
const deviceKey = await groupKeyResponse.text();
console.log(deviceKey)  
*/
     

/* 
        // Create child and group records in parallel
        const childFormData = new FormData();
        childFormData.append("provenanceRecord", JSON.stringify({
            blobType: "deviceInitializer",
            deviceName: "child_smoketest",
            description: "child for most basic smoketest group record creation",
            tags: [],
            children_key: "",
            hasParent: false,
            isReportingKey: false
        }));
        
        const groupFormData = new FormData();
        groupFormData.append("provenanceRecord", JSON.stringify({
            blobType: "deviceInitializer",
            deviceName: "group_smoketest",
            description: "group for most basic smoketest group record creation",
            tags: [],
            children_key: [childKey],
            hasParent: false,
            isReportingKey: false
        }));
        
        const [childResponse, groupResponse] = await Promise.all([
            fetch(`${baseUrl}/provenance/${childKey}`, {
                method: "POST",
                body: childFormData,
            }),
            fetch(`${baseUrl}/provenance/${groupKey}`, {
                method: "POST",
                body: groupFormData,
            })
        ]);
        
        expect(childResponse.ok).toBe(true);
        expect(groupResponse.ok).toBe(true);
*/
