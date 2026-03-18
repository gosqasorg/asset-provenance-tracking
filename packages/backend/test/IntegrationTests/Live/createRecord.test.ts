import { describe, it, expect } from "vitest";
import { createRecord } from '../../../src/functions/httpTrigger';
import { validateKey } from '../../../src/utils/keyFuncs';

// TODO: simple test where you create a record w/ createRecord, get it, and check that the parameters match
    // See existing live integration test for reference
    // create.test.ts line 1074

// NOTE: this is how we're theoretically calling group creation! Model record creation similarly? SEE ISSUE #797!!!
    // https://github.com/gosqasorg/asset-provenance-tracking/issues/797
    // ALSO SEE microtest.spec.ts!
// const group_parent_id = fetch(`${baseUrl}/group/create/`, { method: "POST", body: spec });

describe("Backend Record Creation Tests", () => {
    // TODO: create another test that just uses createRecord!
    it('Create a Basic Record', async () => {
        const baseUrl = process.env['backend_url'];
        let recordKey = await createRecord('Test Record Title', 'Test Record Description')

        console.log("TEST 1 Returned Url:", recordKey)

        // TODO: better tests (get request above url and check vars?)
        expect(validateKey(recordKey)).toBe(true);

        const provenance = await (await fetch(`${baseUrl}${recordKey}`)).json();
        expect(provenance).not.toEqual([])
        console.log("PROV: " + provenance[0])

        // TODO: name is set as descr, and descr doesn't exist
		expect(provenance[0].record.deviceName).toEqual("Test Record Title")
		expect(provenance[0].record.description).toEqual("Test Record Description")
    });

    // TODO: finish test for handler (no tests exist like it!)
    // it("Create and Retrieve A Record", async () => {
    //     // Create a record using the backend
    //     const record = {
    //         blobType: 'deviceInitializer',
    //         deviceName: "Create Record Test",
    //         description: "An integration test creating the most basic record",
    //         tags: {},
    //         children_key: '',
    //         hasParent: false,
    //         isReportingKey: false,
    //     }
    //     const formData = new FormData();
    //     formData.append("provenanceRecord", JSON.stringify(record));

    //     // Retrieve and check the record to make sure it matches
    //     const record_id = fetch(`${baseUrl}/group/create/`, { method: "POST", body: spec });
    //     expect(record_id.status == 200)
    //     // TODO: make expect tests for other returns
    //     console.log("TEST 2 Returned Url: ", record_id.jsonBody)
    // });
});