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

	// The most basic possible test
	// Placeholder
	it("smoketest", () => {
		expect(0).toBe(0);  // Placeholder
	});


	// Single-Feature Test: Walkthrough Edition
	it(testName = 'Record with > 1 History Items: ', async () => {

		// Setup
		const theRecord = 'Ra1rnStUK7CctNehGVWtDa'  // Hardcoded
		const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'
		const fullUrl = `${baseUrl}${theRecord}`

		// Attempt API Interaction
		let response; 
		try {
			response = await fetch(fullUrl);
			response = await response.json();  // Note second await. dot json returns a promise.
			console.info('vvvvvv')
			console.info(response)
			console.info('^^^^^^'); console.info();
		} catch(error) {  // Failure modes, e.g., bad request, internal error, etc. 
			const fullTestName = baseTestName + thisTestName;
			const errorMessage = 'Failed to fetch (get) url: '
			console.error(fullTestName + errorMessage + fullUrl)

			// Note we're still propagating the error to crash the test
			// after logging. 
			throw error;
		}
		// Note how by re-throwing the error, we can move the rest of the
		// "fetch-succeeded" path out of the try-catch block, saving a
		// layer of indentation. 

		// Verify correctness of response

		// Check type
		// Note: it's not necessary to do this try/catch idiom for each
		// sub-testcase. Rather, this happened to be useful while 
		// developing the test:
		// this was failing, and idk why, so instead of self destructing,
		// let's log some stuff
		// and then self destruct. 
		try {
			expect(Array.isArray(response)).toBe(true);
		} catch(error) {
			console.error(typeof response)
			console.error(response)
			console.error(error)
			throw error
		}

		// We'll need this a few times
		const blob_element = response[7];  
		// NB re: 7: They're all identical in form. 
		// The actual info I happened to put in the 0th element is 
		// in the context of test output 
		// somewhat misleading
		// and 7 is not. 

		// Verify elements have the expected number of keys[]
		console.info(testName + 'Verifying element count')
		const blob_item_expected_key_count = 4  // Found manually
		console.info(blob_element)
		console.info(Object.keys(blob_element))
		console.info(Object.keys(blob_element).length)
		expect(Object.keys(blob_element).length).toBe(blob_item_expected_key_count)

		// Verify keys
		const expectedCounts = {
			'record': 1,
			'attachments': 1,
			'deviceID': 1,
			'timestamp': 1,
		}

		Object.keys(blob_element).forEach(key => {
			if(expectedCounts[key]) {
				expectedCounts[key]--;
			}
		})
		const hasExtraOrMissing = Object.values(expectedCounts).some(count => count !== 0)
		console.log(expectedCounts)
		console.info(hasExtraOrMissing)
		expect(hasExtraOrMissing).toBe(false)

		// Note: we can be more detailed with validation
		// but our data is simple enough that we don't need to go so far as to use a validation library. 
		// We'll accumulate reusable code as we successively test features. 
	});

	// Single-Feature Test: Final Draft Edition
	it(testName = 'Read: Record with > 1 History Items: ', async () => {

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

		// (Example add'l tests) Elements: Check values of keys have correct type

		// (Example add'l tests) Record: Check form. Note: Record's keyset is dynamic
	});

	// Placeholder
	// Everything all at once
	it("feature-complete test", () => {
		expect(0).toBe(0);
	});

});