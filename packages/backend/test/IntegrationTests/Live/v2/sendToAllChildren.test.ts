import { describe, it, expect } from "vitest";
import { readFile } from "fs/promises";


const baseUrl = process.env['api_url']
const api_url = baseUrl;


describe ("Send to All Children Tests", () => {
    it("Should send entry to the child record", async() => {
        // --- Note! If this test is updated, also update the example code in 
        // --- GDT-OpenAPI-Spec.yaml > createGroup > x-codeSamples
        // --- All that's needed is here up to expect(response.status)...

		// Create the group/children
        const payload = {
            deviceName: "Send To Children Basic Test",
            description: "Test for send_to_all_children feature",
            tags: [],
            number_of_children: 1
        };

        let formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(payload));

        let response = await fetch(`${api_url}/createGroup`, {
            method: "POST",
            body: formData,
        });

        console.log("APIv2 Test: Send to all children: Attempting to check response")
        console.log('The url and formdata: ', api_url, formData)
        console.log(`The response:`)
        console.dir(response)
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.groupUrl).toContain("/record/");
        console.log("(Basic Send to Children Test) Group Url:", data);

        const groupKey = data.groupUrl.split('/').pop();
        const groupResponse = await fetch(`${api_url}/provenance/${groupKey}`);
        let groupProvenance = await groupResponse.json();
        let groupRecord = groupProvenance[0].record;

        let childKeys: string[] = groupRecord.children_key;

        // Add an entry to the group and send it to all children
        const newPayload = {
            description: "Sending record entry to all children and confirming it sent...",
            tags: ["Harry", "Ron"],
            send_to_all_children: true
        };

        formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(newPayload));

        response = await fetch(`${api_url}/addEntry/${groupKey}`, {
            method: "POST",
            body: formData,
        });
        console.log("APIv2 Test: Send to all children: Attempting to check response")
        console.log('The url and formdata: ', api_url, formData)
        console.log(`The response:`)
        console.dir(response)
        expect(response.status).toBe(200);

        // Look at the most recent record entry on the group and confirm the entry was added successfully
        const groupData = await fetch(`${api_url}/provenance/${groupKey}`);
        groupProvenance = await groupData.json();
        groupRecord = groupProvenance[0].record;
        console.log("(Send to Children Test) Group Record:", groupRecord);

        expect(groupRecord.description).toBe(newPayload.description);
        expect(groupRecord.tags).toEqual(["Harry", "Ron", "sent_to_all_children"]);

        // Look at the most recent record entry on the child and confirm it has the tags from the parent
        const childData = await fetch(`${api_url}/provenance/${childKeys[0]}`);
        const childProvenance = await childData.json();
        const childRecord = childProvenance[0].record;
        console.log("(Send to Children Test) Child Record:", childRecord);

        expect(childRecord.description).toBe(newPayload.description);
        expect(childRecord.tags).toEqual(["Harry", "Ron", "sent_to_all_children"]);
    }, 60000);

    it("Should send entry to children but not to the public key", async() => {
        // Create the group/children
        const payload = {
            deviceName: "Send To Children But Not Public Key",
            description: "Testing that records sent from the group are not sent to the public key",
            tags: [],
            number_of_children: 2,
            hasPublicKey: true,
        };

        let formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(payload));

        let response = await fetch(`${api_url}/createGroup`, {
            method: "POST",
            body: formData,
        });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.groupUrl).toContain("/record/");
        console.log("(Send to Children Not Public Key Test) Group Url:", data);

        const groupKey = data.groupUrl.split('/').pop();
        const groupResponse = await fetch(`${api_url}/provenance/${groupKey}`);
        const groupProvenance = await groupResponse.json();
        const groupRecord = groupProvenance[0].record;

        const publicKey: string = groupRecord.publicKey;
        let childKeys: string[] = groupRecord.children_key;
        childKeys.splice(childKeys.indexOf(publicKey), 1);

        // Add an entry to the group and send it to all children
        const newPayload = {
            description: "Sending record entry to all children and confirming it's not sent to the public key...",
            tags: ["Harry", "Ron", "Hermione"],
            send_to_all_children: true
        };

        formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(newPayload));

        response = await fetch(`${api_url}/addEntry/${groupKey}`, {
            method: "POST",
            body: formData,
        });
        expect(response.status).toBe(200);

        // Look at the most recent record entry on the children and confirm they have the tags from the parent
        for (const child of childKeys) {
            const childData = await fetch(`${api_url}/provenance/${child}`);
            const childProvenance = await childData.json();
            const childRecord = childProvenance[0].record;

            expect(childRecord.description).toBe(newPayload.description);
            expect(childRecord.tags).toEqual(["Harry", "Ron", "Hermione", "sent_to_all_children"]);
        }

        // Look at the public key and confirm it did not receive the record entry
        const publicProvenance = await fetch(`${api_url}/provenance/${publicKey}`);
        const publicData = await publicProvenance.json();
        const publicRecord = publicData[0].record;

        expect(publicRecord.description).not.toBe(newPayload.description);
        expect(publicRecord.tags).not.toEqual(["Harry", "Ron", "Hermione", "sent_to_all_children"]);

    }, 60000);

    it("Should create new entry and not send to all children", async() => {
        // Create the group/children
        const payload = {
            deviceName: "Not Sent to Children",
            description: "Testing that send to all children does not occur when the boolean is false",
            tags: ["Dumbledore"],
            number_of_children: 2,
        };

        let formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(payload));

        let response = await fetch(`${api_url}/createGroup`, {
            method: "POST",
            body: formData,
        });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.groupUrl).toContain("/record/");
        console.log("(Don't Send to Children Test) Group Url:", data);

        const groupKey = data.groupUrl.split('/').pop();
        const groupResponse = await fetch(`${api_url}/provenance/${groupKey}`);
        let groupProvenance = await groupResponse.json();
        let groupRecord = groupProvenance[0].record;

        const childKeys: string[] = groupRecord.children_key;

        // Add an entry to the group and DON'T send it to all children
        const entryPayload = {
            description: "Record should NOT be sent to all children",
            tags: ["Snape"]
        };

        formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(entryPayload));

        response = await fetch(`${api_url}/addEntry/${groupKey}`, {
            method: "POST",
            body: formData,
        });
        expect(response.status).toBe(200);

        // Look at the most recent record entry on the group and confirm it doesn't have the sent_to_all_children tag
        const groupData = await fetch(`${api_url}/provenance/${groupKey}`);
        groupProvenance = await groupData.json();
        groupRecord = groupProvenance[0].record;

        expect(groupRecord.description).toBe(entryPayload.description);
        expect(groupRecord.tags).toEqual(["Snape"]);
        expect(groupRecord.tags).not.toContain(["sent_to_all_children"]);

        // Look at the most recent record entry on the children and confirm they don't have the tags from the parent
        for (const child of childKeys) {
            const childData = await fetch(`${api_url}/provenance/${child}`);
            const childProvenance = await childData.json();
            const childRecord = childProvenance[0].record;

            expect(childRecord.description).toBe(payload.description);  // description from parent creation
            expect(childRecord.tags).toEqual(["Dumbledore"]);
            expect(groupRecord.tags).not.toContain(["sent_to_all_children"]);
            expect(childProvenance.length).toBe(1);
        }

    }, 60000);

    it("Should use default 'Sent from Group' description when entry has no description", async() => {
        // Create the group/children
        const payload = {
            deviceName: "Sent Without Description Test",
            description: "Testing that record entries sent to children without descriptions have the default description",
            tags: [],
            number_of_children: 1,
        };

        let formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(payload));

        let response = await fetch(`${api_url}/createGroup`, {
            method: "POST",
            body: formData,
        });
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.groupUrl).toContain("/record/");
        console.log("(Send to Children Default Description Test) Group Url:", data);

        const groupKey = data.groupUrl.split('/').pop();
        const groupResponse = await fetch(`${api_url}/provenance/${groupKey}`);
        const groupProvenance = await groupResponse.json();
        const groupRecord = groupProvenance[0].record;

        const childKeys: string[] = groupRecord.children_key;

        // Add an entry without a description to the group and send it to all children
        const entryPayload = {
            tags: ["Draco"],
            send_to_all_children: true
        };

        formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(entryPayload));

        response = await fetch(`${api_url}/addEntry/${groupKey}`, {
            method: "POST",
            body: formData,
        });
        expect(response.status).toBe(200);

        // Look at the most recent record entry on the child and confirm they have the default description
        for (const child of childKeys) {
            const childData = await fetch(`${api_url}/provenance/${child}`);
            const childProvenance = await childData.json();
            const childRecord = childProvenance[0].record;

            expect(childRecord.description).toBe("Record Entry sent from Group");
            expect(childRecord.tags).toEqual(["Draco", "sent_to_all_children"]);
        }
    }, 60000);

});

