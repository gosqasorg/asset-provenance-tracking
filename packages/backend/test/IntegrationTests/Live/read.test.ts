import { describe, it, expect } from "vitest";

/* README: To add a test, add inside the global describe an additional it. For example:

let baseName;
describe(baseName = "Group of tests", () => {

	let testName;

	it(testName = "Brief description that this tests foo", () => {
		var val = do_thing();
		expect(val).toBe(0);
	});

	it(testName = "Brief description that this tests bar", () => {
		// structured similar to above
	});

	it(testName = "Another test", () => {
		// More test contents
	});

	// More tests
})

*/
let timeout = 30000;  // Milliseconds; integration testing can be laggy
let baseTestName;
describe(baseTestName = "API Integration Tests: Read", () => {

	/*

	README: 
	* For these, especially before record creation tests exist,
	we'll need to manually create records for each of these tests.	

	This is no big deal: just go onto gosqas.org,
	create a record to suit the test, and note the ID. We want to
	test the deployment, so it's fitting these are on Bluestone / prod. 

	You can inspect records with simple handy util. It will tell you
	how to use it: 
	* backend/scripts/bluestone-read-record.js. 

	In general, these describe sections will tend toward the form: 
	* Smoketest (defined below)
	* Feature-specific tests
	* Feature-complete test

	A smoketest is the simplest possible test case. 
	For reading records, the smoketest test case is
	a non-group record with a title and description. For more,
	see apiIntegrationTestsSmoketests.test.ts.

	For failure cases, we may want to catch the error, log
	an informative message using console.error('foo'), then
	re-throw the error. 
	*/

	// Setup
	let testName; 


	// -- Tests Begin -- // 

	// Placeholder
	it("smoketest", () => {
		expect(0).toBe(0);  
	}, timeout);

	// Single-Feature Test: Multiple History Records
	it(testName = 'Record with > 1 History Items: ', async () => {

		// ---- Section 1/2: Invoking the API ---- //

		const theRecord = 'Ra1rnStUK7CctNehGVWtDa'  // Hardcoded
		const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'
		const fullUrl = `${baseUrl}${theRecord}`

		let response; 
		try {
			response = await fetch(fullUrl);
			response = await response.json(); 
		} catch(error) {  
			const testName = baseTestName + thisTestName;
			const errorMessage = 'Failed to fetch (get) url: '
			console.error(testName + errorMessage + fullUrl) 
			throw error;
		}
 		
		// ---- Section 2/2: Tests ---- // 

		// Check overall type 
		expect(Array.isArray(response)).toBe(true);

		// Elements: Check number of keys
		const blob_element = response[0]; 
		expect(Object.keys(blob_element).length).toBe(4)  // Known to be 4

		// Elements: Check identity of keys
		const keysToCheckOff = new Set(['record', 'attachments', 'deviceID', 'timestamp'])
		Object.keys(blob_element).forEach(key => {
			if(!keysToCheckOff.has(key)) { throw new Error(
				`Unexpected key: ${key}`
			)}

			keysToCheckOff.delete(key)
		})
		expect(keysToCheckOff.size).toBe(0)

	}, timeout);

	// Placeholder
	// Everything all at once
	it("feature-complete test", () => {
		expect(0).toBe(0);
	});

});