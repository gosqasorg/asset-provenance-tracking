import { app } from "@azure/functions";
import { getAttachment, getAttachmentName} from '../../../src/functions/httpTrigger';
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
it(testName = 'Record with > 1 tags and a photo attachment: ', async () => {

		const theRecord = 'FXFukdAGkkUzmC87G8vjZX'  // Hardcoded - this record has 3 attachments: LwaSzacaPz26aDd1RVaaxP
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
		console.log(response)
		console.log("END OF TAG RECORD")

		// Elements: Check number of keys
		const blob_element = response[0]; 

		const recordKey = blob_element["record"]
		console.log("!!!")
		console.log(recordKey)
		console.log("!!!")
		console.log(recordKey["tags"])
		console.log(recordKey["tags"].length)
		console.log(recordKey["tags"][0])

		expect(Array.isArray(recordKey["tags"])).toBe(true);
		expect(recordKey["tags"].length >= 1).toBe(true);
		expect(recordKey["tags"][0] === "deployed").toBe(true);

		const attachmentsKey = blob_element["attachments"]
		expect(Array.isArray(attachmentsKey)).toBe(true);
		expect(attachmentsKey.length >= 1).toBe(true);

		console.log(attachmentsKey)

		// Testing attachment name retrieval
		let url = 'https://gdtprodbackend.azurewebsites.net/api/attachment/FXFukdAGkkUzmC87G8vjZX/61dba2296597cb49597c8f755d169ed2c511c08324b3bd589591eeef21fd5112'
		let resp = await fetch(url)
		let attachmentName = resp['headers'].get('attachment-name')

		console.log(attachmentName)
		const alphanumericRegex = /\.(jpg|JPG|gif|GIF|doc|DOC|pdf|PDF|png|PNG)$/;
		expect(typeof attachmentName === 'string' && alphanumericRegex.test(attachmentName)).toBe(true);
		
		// const res1 = app.get("getAttachment", {
		// 	authLevel: 'anonymous',
		// 	route: 'attachment/{deviceKey}/{attachmentID}',
		// 	handler: getAttachment,
		// })

		// // const res = await httpTrigger.getAttachment
		// // const res = await httpTrigger.getAttachmentName(req, context)

		// const res2 = app.get("getAttachmentName", {
		// 	authLevel: 'anonymous',
		// 	route: 'attachment/{deviceKey}/{attachmentID}/name',
		// 	handler: getAttachmentName,
		// })
		// these are just fetches
		
		// console.log(res1, res2)

	}, timeout);

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

		// console.log("!!!")
		// console.log(response[0])
		// console.log("!!!")
		// console.log(response)

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

		// tags

		// const tagsKey = blob_element["record"]
		// console.log("!!!")
		// console.log(tagsKey)

	}, timeout);

	// Placeholder
	// Everything all at once
	it("feature-complete test", () => {
		expect(0).toBe(0);
	});

});