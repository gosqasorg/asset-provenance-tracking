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
    // TODO: MASTER LIST
        // TRY running tests again now that createRecord exists on local backend!
        // TEMP direct call createRecord to test if it works (remove context)..? -- or move logic to this file temporarily!!!!!
        // ALSO compare closer to group to make sure everything looks right!
        // PLUS we need to know what all the potential backend_urls are and if they all have prov! -- YES, AND DEV HAS API_URL!! prod doesn't
            // local.settings.json defines local urls (MAYBE azure defines dev/live? DO THEY HAVE api_url??? settings -> env vars)
    it('Create a Basic Record', async () => {
        const baseUrl = process.env['backend_url'];
        let recordUrl = await createRecord('', 'Test Record Title', 'Test Record Description')  // don't have context variable

        console.log("TEST 1 Returned Url:", recordUrl)

        const provenance = await (await fetch(`${recordUrl}`)).json();
        expect(provenance).not.toEqual([])
        console.log("PROV: " + provenance[0])
		expect(provenance[0].record.deviceName).toEqual("Test Record Title")
		expect(provenance[0].record.description).toEqual("Test Record Description")
    });

    // TODO: finish test for handler
    it("Create and Retrieve A Basic Record", async () => {
        // Create a record using the backend
        // TODO: this works for localhost to remove 'provenance/' but I'm not sure if other backend_urls have that
        // TODO: REPLACE BASEURL WITH API_URL, that one doesn't have /provenance!!! (confirm this exists on dev/live)
        const baseUrl = process.env['backend_url']?.slice(0, -11);
        console.log("baseurl " + baseUrl)
        const record = {
            blobType: 'deviceInitializer',
            deviceName: "Create Record Test",
            description: "An integration test creating the most basic record",
            tags: {},
            children_key: '',
            hasParent: false,
            isReportingKey: false,
        }
        const formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(record));

        console.log(`Url: ${baseUrl}createGroup`)

        // TODO: getting 404 because createRecord endpoint doesn't exist on localhost
        // const recordUrl = await fetch(`${baseUrl}getNewDeviceKey`);  // works
        const recordUrl = await fetch(`${baseUrl}createRecord`, { method: "POST", body: formData });  // fails, endpoint doesn't exist
        expect(recordUrl.status).toBe(200)

        // TODO: make expect tests for other returns
            // Also get the record and confirm it was successfully created (handler should return record url!)
        console.log("TEST 2 Returned Info: ", recordUrl)
    });
});