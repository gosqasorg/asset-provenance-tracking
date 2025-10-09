import { describe, it, expect } from "vitest";
import { makeEncodedDeviceKey, validateKey } from '../../../src/utils/keyFuncs';
import { readFile } from 'fs/promises';

/* README: To add a test, add inside the global describe an additional it. For example:

describe("Group of tests", () => {
	it("Brief description that this tests foo", () => {
		var val = do_thing();
		expect(val).toBe(0);
	});

	it("Brief description that this tests bar", () => {
		// structured similar to above
	});

	it("Another test", () => {
		// More test contents
	});

	// More tests
})

*/

describe("Group Creation Tests", () => {

	// Placeholder
	// The most basic possible test
	it("smoketest", () => {
		expect(0).toBe(0);
	});

	// Placeholder
	// Most basic + one feature
	it("smoketest", () => {
		expect(0).toBe(0);
	});

	// Placeholder
	// Everything all at once
	it("feature-complete test", () => {
		expect(0).toBe(0);
	});
	
});

describe("Record Creation Tests", () => {
	const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'

	// The most basic possible test -- create a record
	it("(Smoketest) Create the most basic record", async () => {
		// Create record key
		const deviceKey = await makeEncodedDeviceKey();
		console.log("(1st Test) Created Device Key: " + deviceKey);
		let fullUrl = `${baseUrl}${deviceKey}`
		expect(deviceKey.length).toBe(22);
		expect(validateKey(deviceKey)).toBe(true);

		// POST record key
		try {
			const data = {
				blobType: 'deviceInitializer',
				deviceName: "Create Record Test",
				description: "An API smoketest for creating the most basic record",
				tags: {},
				children_key: '',
				hasParent: false,
				isReportingKey: false,
			}
			const formData = new FormData();
    		formData.append("provenanceRecord", JSON.stringify(data));

			const postResponse = await fetch(fullUrl, {
				method: "POST",
				body: formData,
			});

			expect(postResponse.ok).toBe(true);

		} catch (error) {
			console.error("(Create POST Test) Error creating a record: " + error); 
			throw error;
		}

		// GET record key to make sure it exists
		let getResponse; 
		try {
			getResponse = await fetch(fullUrl);
			getResponse = await getResponse.json();
			let responseString = JSON.parse(JSON.stringify(getResponse[0]));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Create Record Test');
			expect(responseString.record.description).toBe('An API smoketest for creating the most basic record');
			expect(responseString.record.children_key).toBe("");
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isReportingKey).toBe(false);

		} catch(error) {
			console.error('(Create GET Test) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
			throw error;
		}
	});

	
	// Most basic + one feature
	it("", async() => {
	});


    // Note: As we add feature tests, we'll accumulate them into the feature-complete test
	// Everything all at once -- create a record with tags and an image
	it("(Smoketest) Create a record with tags", async() => {
		const deviceKey = await makeEncodedDeviceKey();
		console.log("(2nd Test) Created Device Key: " + deviceKey);
		let fullUrl = `${baseUrl}${deviceKey}`
		expect(deviceKey.length).toBe(22);
		expect(validateKey(deviceKey)).toBe(true);

		// POST
		try {
			const data = {
				blobType: 'deviceInitializer',
				deviceName: "Create Record Test + 1 Feature",
				description: "An API smoketest for creating a record with tags",
				tags: ['smoketest', 'api'],
				children_key: '',
				hasParent: false,
				isReportingKey: false,
			}
			const formData = new FormData();
			formData.append("provenanceRecord", JSON.stringify(data));

			const postResponse = await fetch(fullUrl, {
				method: "POST",
				body: formData,
			});

			expect(postResponse.ok).toBe(true);

		} catch (error) {
			console.error("(Create POST Test) Error creating a record: " + error); 
			throw error;
		}

		// GET
		let getResponse; 
		try {
			getResponse = await fetch(fullUrl);
			getResponse = await getResponse.json();
			let responseString = JSON.parse(JSON.stringify(getResponse[0]));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Create Record Test + 1 Feature');
			expect(responseString.record.description).toBe('An API smoketest for creating a record with tags');
			expect(responseString.record.tags.length).toBe(2);
			expect(JSON.stringify(responseString.record.tags)).toBe('["smoketest","api"]');

		} catch(error) {
			console.error('(Create GET Test) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
			throw error;
		}
	});
	
});
