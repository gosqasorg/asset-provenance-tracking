import { describe, it, expect } from "vitest";

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
let timeout= 30000;
// question for Vincent why put create a variable, is it to clean code?
let baseTestName;
describe(baseTestName = 'Group + Record History Update Tests', () => {
	let testName;

	// Placeholder
	// The most basic possible test
	// Testing to see if you update the existing record with text description
	it("smoketest", () => {
		expect(0).toBe(0);
	}, timeout);
	
	// -- Test Begin --//
	it(testName = 'Record with > 1 update: ', async () => {
		const theRecord = 'UfyEtFDMYQPfGH7yQsebJv'  // Hardcoded - record has 2 updates
		const baseUrl = 'https://gosqasbe.azurewebsites.net/api/provenance/'
		const fullUrl = `${baseUrl}${theRecord}`

		let response;
		try {
			response = await fetch(fullUrl);
			response = await response.json();
		} catch(error) {
			const errorMessage = 'Failed to fetch (get) url: ';
			console.error(baseTestName + testName + errorMessage + fullUrl);
			throw error;
		}

	//currently failing so checking to see what the response is 
	console.log('Response type:', typeof response);
	console.log('Is array?', Array.isArray(response));
	console.log('Response keys:', Object.keys(response));
	console.log('Full response:', JSON.stringify(response, null, 2));
	// ---- Verifiying that the record is updated ---- //
	// Check type
	expect(Array.isArray(response)).toBe(true);

	//check if the response is greater than 1 
	expect(response.length).toBeGreaterThan(1);

	//Check in this case it should be 3
	expect(response.length).toBe(3);

	//Elements: Check number of keys 
	const blob_element = response[1];  //checking on of the updates
	expect(Object.keys(blob_element).length).toBe(4)


	//Elements: Check identity of Keys 
	const keysToCheckOff = new Set(['record', 'attachments', 'deviceID', 'timestamp'])
		Object.keys(blob_element).forEach(key => {
			if(!keysToCheckOff.has(key)) { throw new Error(
				`Unexpected key: ${key}`
			)}

			keysToCheckOff.delete(key)
		})
		expect(keysToCheckOff.size).toBe(0)

	},timeout)


	// Placeholder
	// Most basic + one feature
	//check if you add tags and an image it will be visible in the update
	it("<single-feature> test", () => {
		expect(0).toBe(0);
	});

	// Placeholder
	// Everything all at once
	it("feature-complete test", () => {
		expect(0).toBe(0);
	});

});