import { describe, it, expect } from "vitest";
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
        // Compare closer to group to make sure everything looks right!
        // We need to know what all the potential backend_urls are and if they all have prov! -- YES, AND DEV HAS API_URL!! prod doesn't
            // local.settings.json defines local urls (MAYBE azure defines dev/live? DO THEY HAVE api_url??? settings -> env vars)

    it("Create and Retrieve A Basic Record", async () => {
        // TODO: this works for localhost to remove 'provenance/' but I'm not sure if other backend_urls have that
        // TODO: REPLACE BASEURL WITH API_URL, that one doesn't have /provenance!!! (confirm this exists on dev/live)
        const baseUrl = process.env['backend_url']?.slice(0, -11);
        console.log("baseurl " + baseUrl)
        const record = {
            blobType: 'deviceInitializer',
            deviceName: "Create Record Test",
            description: "An integration test creating the most basic record",
            tags: [],
            children_key: '',
            hasParent: false,
            isReportingKey: false,
        }

        const recordResponse = await fetch(`${baseUrl}createRecord`, { method: "POST", body: JSON.stringify(record) });
        expect(recordResponse.status).toBe(200)

        let recordUrl = await recordResponse.json()
        console.log("Created Basic Record (url): ", recordUrl.recordUrl)

		try {
			let getResponse = await fetch(recordUrl.recordUrl);
			getResponse = await getResponse.json();
			let responseString = JSON.parse(JSON.stringify(getResponse[0]));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Create Record Test');
			expect(responseString.record.description).toBe('An integration test creating the most basic record');
			expect(responseString.record.children_key).toBe("");
            expect(responseString.record.tags).toEqual([]);
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isReportingKey).toBe(false);

		} catch(error) {
			console.error('(Basic Create Test) Failed to fetch url: ' + recordUrl.recordUrl + '\nError: ' + error) 
			throw error;
		}
    });

    it("Create and Retrieve A Record with Tags", async () => {
        const baseUrl = process.env['backend_url']?.slice(0, -11);
        const record = {
            blobType: 'deviceInitializer',
            deviceName: "Create Record Test",
            description: "An integration test creating a record with tags",
            tags: ['tags_test', 'integration'],
            children_key: '',
            hasParent: false,
            isReportingKey: false,
        }

        const recordResponse = await fetch(`${baseUrl}createRecord`, { method: "POST", body: JSON.stringify(record) });
        expect(recordResponse.status).toBe(200)

        let recordUrl = await recordResponse.json()
        console.log("Created Record With Tags (url): ", recordUrl.recordUrl)

		try {
			let getResponse = await fetch(recordUrl.recordUrl);
            console.log("GET RESPONSE")
            console.log(getResponse)
			getResponse = await getResponse.json();
			let responseString = JSON.parse(JSON.stringify(getResponse[0]));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Create Record Test');
			expect(responseString.record.description).toBe('An integration test creating a record with tags');
			expect(responseString.record.tags).toEqual(["tags_test", "integration"]);
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isReportingKey).toBe(false);

		} catch(error) {
			console.error('(Create With Tags Test) Failed to fetch url: ' + recordUrl.recordUrl + '\nError: ' + error) 
			throw error;
		}
    });

    it("Create and Retrieve A Record with Tags and Attachments", async () => {

    });
});