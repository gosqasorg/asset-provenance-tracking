import { exec } from 'node:child_process';
import { createWriteStream } from 'fs';
import fs from 'fs';
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

	// Placeholder
	it("smoketest", () => {
		expect(0).toBe(0);  
	}, timeout);

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

		// Elements: Check number of keys
		const blob_element = response[response.length - 1]; 

		const recordKey = blob_element["record"]
		expect(Array.isArray(recordKey["tags"])).toBe(true);
		expect(recordKey["tags"].length >= 1).toBe(true);
		expect(recordKey["tags"][0] === "deployed").toBe(true);

		const attachmentsKey = blob_element['attachments']
		let attachmentCount = 0
		let counter = response.length
		while (counter > 0){
			if (response[counter - 1]['attachments'].length > 0){
				++attachmentCount
			}
			--counter
		}
		expect(Array.isArray(attachmentsKey)).toBe(true);
		expect(attachmentCount >= 1).toBe(true);

		// Testing attachment name retrieval
		let url = 'https://gdtprodbackend.azurewebsites.net/api/attachment/FXFukdAGkkUzmC87G8vjZX/61dba2296597cb49597c8f755d169ed2c511c08324b3bd589591eeef21fd5112'
		let resp = await fetch(url)
		let attachmentName = resp['headers'].get('attachment-name')

		const alphanumericRegex = /\.(jpg|JPG|gif|GIF|doc|DOC|pdf|PDF|png|PNG)$/;
		expect(typeof attachmentName === 'string' && alphanumericRegex.test(attachmentName)).toBe(true);
		
		// Notes
		// https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
		// https://developer.mozilla.org/en-US/docs/Web/API/WritableStream
		let filename = './test/IntegrationTests/Live/received_' + resp['headers'].get('attachment-name')

		// Try to write the file
		let readableStream = resp['body']
		const fileWriter = createWriteStream(filename);

		await readableStream.pipeTo(new WritableStream({
			write(chunk) {
				fileWriter.write(chunk);
			}
		}));

		function isValidImage(filepath: string): Promise<boolean> {
			return new Promise((resolve) => {
				exec(`file "${filepath}"`, (error, stdout) => {
				if (error) {
					resolve(false);
					return;
				}
				resolve(stdout.includes('image data'));
				});
			});
		}

		expect(await isValidImage(filename)).toBe(true);
		fs.unlinkSync(filename);
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

	// Feature Test: Read Group with Annotated Children
	it(testName = 'Read Group with Annotated Children', async () => {

		// ---- Section 1/2 : Invoking the API ---- //

		const theRecord = '7Lj7CPGcmbXr7izpahPG7P' // manually created because record creation by api is in progress
		const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'
		const fullUrl = `${baseUrl}${theRecord}`

		let response;
		let statusCode;
		try{
			response = await fetch(fullUrl);
			statusCode = response.status
			response = await response.json();
		} catch(error) {
			const testName = baseTestName + thisTestName;
			const errorMessage = 'Failed to fetch (get) url: '
			console.error(testName + errorMessage + fullUrl)
			throw error;
		}

		//  ------  Section 2/2: Tests  ------  //

		// Test to see if record got created
		expect(statusCode).toBe(200);

		// Test to see if parent record has accessible child URLs
		const secondIndex = response[1]
		const childrenKey = secondIndex['record']['children_key']
		let childrenKeysCounter = childrenKey.length
		expect(childrenKey.length > 0).toBe(true)

		// Test to see if children got created
		let childResponse
		let tagDifferences = 0
		let annotationCompare 
		while (childrenKeysCounter > 0) {
			childResponse = await fetch('https://gdtprodbackend.azurewebsites.net/api/provenance/' + childrenKey[childrenKeysCounter - 1])
			 if (childResponse.status == 200){
				--childrenKeysCounter
			} 
		}
		expect(childrenKeysCounter).toBe(0)

		// Test to see if children are annotated
		// Grab the tags from the first child
		let tagsDiscrepency = 0
		let firstAnnotation 
		let annotationResponse
		let newCounter = childrenKey.length
		annotationResponse = await fetch('https://gdtprodbackend.azurewebsites.net/api/provenance/' + childrenKey[0])
		annotationResponse = await annotationResponse.json()
		firstAnnotation = annotationResponse[0]['record']['tags']

		let testAnnotationRes
		let testArray
		while (newCounter > 0){
			testAnnotationRes = await fetch('https://gdtprodbackend.azurewebsites.net/api/provenance/' + childrenKey[newCounter -1])
			testAnnotationRes = await testAnnotationRes.json()
			testArray = testAnnotationRes[0]['record']['tags']
			if(JSON.stringify(firstAnnotation) != JSON.stringify(testArray)){
				++tagDifferences
			}
			--newCounter
		}
		expect(tagsDiscrepency).toBe(0)

	}, timeout)

	// Feature-complete test
	// TODO - rename test to placeholder test "feature-complete test" at the bottom of file
	it(testName = 'feature complete', async () => {
		const theRecord = 'R37xk8yAX8sPfMFLoG4U2c'
		const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'
		const fullUrl = `${baseUrl}${theRecord}`

		let response;
		try{
			response = await fetch(fullUrl);
			// console.log("fullUrl\n!!!\n", response,"\n", "fullUrl\n!!!")
			response = await response.json();
			// console.log("response.json\n!!!\n", response,"\n", "response.json\n!!!")
		} catch(error) {
			const testName = baseTestName + thisTestName;
			const errorMessage = 'Failed to fetch (get) url: '
			console.error(testName + errorMessage + fullUrl)
			throw error;
		}

		// Tests 


		// Test to check if URL fetch response is an array
		expect(Array.isArray(response)).toBe(true);

		// Tests the parent blob for 1 or more tags
		const parentBlob = response[response.length - 1];
		// console.log(parentBlob);
		const pRecordKey = parentBlob["record"]
		expect(Array.isArray(pRecordKey["tags"])).toBe(true);
		expect(pRecordKey["tags"].length >= 1).toBe(true);

		// Tests the parent blob for attachment array
		const attachmentsKey = parentBlob['attachments']
		expect(Array.isArray(attachmentsKey)).toBe(true);

		// Iterates through all records in the parent record and tests for any attachments or recall tags
		let attachmentCount = 0
		let counter = response.length - 1
		// console.log("counter:", counter)
		let recallSet = new Set()
		// let testSet = new Set([...[1, 2, 3], ...[2, 4]])
		// let newSet = new Set(testSet)
		// console.log(newSet)
		while (counter >= 0){
			

			if (response[counter]['attachments'].length > 0){
				++attachmentCount
				// console.log(response[counter]['attachments'])
			}
			
			// console.log([response[6]['record']['tags']])
			// if (response[counter]['record']['tags'].length > 0){
			let tagSet = new Set(response[counter]['record']['tags'])
			// console.log("summands:", tagSet, recallSet)
			recallSet = new Set([...recallSet, ...tagSet])
			// console.log("sum:", recallSet)
			// }
			

			--counter
		}
		// console.log("attachmentCount:", attachmentCount)
		// console.log("recallSet:", recallSet)
		expect(attachmentCount >= 1).toBe(true);
		expect(recallSet.has('recall')).toBe(true);

		// Tests for valid file extension name
		let url = 'https://gdtprodbackend.azurewebsites.net/api/attachment/FXFukdAGkkUzmC87G8vjZX/61dba2296597cb49597c8f755d169ed2c511c08324b3bd589591eeef21fd5112'
		let resp = await fetch(url)
		let attachmentName = resp['headers'].get('attachment-name')
		
		const fileExtensionRegex = /^.+\.(pdf|jpg|png|docx)$/i;
		expect(typeof attachmentName === 'string' && fileExtensionRegex.test(attachmentName)).toBe(true);

		// Tests if parent record has children keys, i.e. this is a group record
		expect(pRecordKey["children_key"].length > 0).toBe(true);

		// ---- Section 1/2: Invoking the API ---- //

		const firstRecord = 'XXGWwmjS5A8EUVQyCzDLXN'										// record with one jpeg attachment
		const firstUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'
		const firstFullUrl = `${firstUrl}${firstRecord}`

		const secondRecord = 'QHnRKH9tJiTEvVQnLHM6pG'
		const secondUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'		// record with two attachments (1 jpeg, 1 pdf)
		const secondFullUrl = `${secondUrl}${secondRecord}`

		let firstData
		let secondData
		try{
			let response = await fetch(firstFullUrl)
			firstData = await response.json()
			try{
				let secondResponse = await fetch(secondFullUrl)
				secondData = await secondResponse.json()
			}catch(error){
				const testName = baseTestName + thisTestName;
				const errorMessage = 'Failed to fetch (get) url: '
				console.error(testName + errorMessage + secondFullUrl)
				throw error;
			}
		}catch(error) {
			const testName = baseTestName + thisTestName;
			const errorMessage = 'Failed to fetch (get) url: '
			console.error(testName + errorMessage + firstFullUrl)
			throw error;
		}

		// Hieu's  attachment tests//

		// Test record with two attachments
		let numberOfAttachments2 = 0
		let attachmentsArray = []
		counter = secondData.length
		while (counter > 0){
			if (secondData[counter - 1]['attachments'].length > 0){
				attachmentsArray.push(secondData[counter - 1]['attachments'][0])
				++numberOfAttachments2
			}
			--counter
		}
		expect(numberOfAttachments2).toBe(2);

		// Test record attachments to see if jpeg and pdf are included
		let jpegCounter = 0
		let pdfCounter = 0
		let arrayCounter = attachmentsArray.length
		while (arrayCounter > 0){
			let imageResponse = await fetch('https://gdtprodbackend.azurewebsites.net/api/attachment/QHnRKH9tJiTEvVQnLHM6pG/' + attachmentsArray[arrayCounter - 1])
			const imageData = await imageResponse.blob()
			if (imageData.type == 'application/pdf'){
				++pdfCounter
			}else if (imageData.type == 'image/jpeg'){
				++jpegCounter
			}
			--arrayCounter
		}
		expect(jpegCounter > 0).toBe(true)
		expect(pdfCounter > 0 ).toBe(true)
		
	}, timeout)

	// Placeholder
	// Everything all at once
	it("feature-complete test", () => {
		expect(0).toBe(0);
	});

});