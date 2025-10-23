import { describe, it, expect } from "vitest";
import { makeEncodedDeviceKey, validateKey } from '../../../src/utils/keyFuncs';
import { readFile } from 'fs/promises';
import { writeFile } from 'fs/promises';
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

describe("Record Update Tests", () => {
  const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/';

  // updating a record
  it("Update descriptions", async () => {
    //  Creating initial record key
    const deviceKey = await makeEncodedDeviceKey();
    let fullUrl = `${baseUrl}${deviceKey}`;
	  console.log("Update Test with description: " + deviceKey)
    
    const initialData = {
      blobType: 'deviceInitializer',
      deviceName: "Update Record Descripion",
      description: "Original description",
      tags: {},
      children_key: '',
      hasParent: false,
      isReportingKey: false,
    };
    
    const setupFormData = new FormData();
    setupFormData.append("provenanceRecord", JSON.stringify(initialData));
    
    const createResponse = await fetch(fullUrl, {
      method: "POST",
      body: setupFormData,
    });
    expect(createResponse.ok).toBe(true);

    // Update description of record
    const updateData = {
      blobType: 'deviceRecord',
      description: "Updated description",
      tags: [],
      children_key: '',
    };
    
    const updateFormData = new FormData();
    updateFormData.append("provenanceRecord", JSON.stringify(updateData));
    
    const updateResponse = await fetch(fullUrl, {
      method: "POST",
      body: updateFormData,
    });
    
    expect(updateResponse.ok).toBe(true);

    // Check if the update worked
    const getResponse = await fetch(fullUrl);
    const data = await getResponse.json();
    const record = JSON.parse(JSON.stringify(data[0]));
    
    expect(record.record.description).toBe("Updated description");
  });

  // Update with tags
  it("Update record tags", async () => {
    // Create initial record
    const deviceKey = await makeEncodedDeviceKey();
    let fullUrl = `${baseUrl}${deviceKey}`;
	console.log("Update Test with tags: " + deviceKey);
    
    const initialData = {
      blobType: 'deviceInitializer',
      deviceName: "Tag Test Record",
      description: "Testing tag updates",
      tags: [],
      children_key: '',
      hasParent: false,
      isReportingKey: false,
    };
    
    const setupFormData = new FormData();
    setupFormData.append("provenanceRecord", JSON.stringify(initialData));
    
    await fetch(fullUrl, { method: "POST", body: setupFormData });

    // updating tags
    const updateData = {
      blobType: 'deviceRecord',
      description: "Testing tag updates",
      tags: ['updated', 'test', 'tags'],
      children_key: '',
    };
    
    const updateFormData = new FormData();
    updateFormData.append("provenanceRecord", JSON.stringify(updateData));
    
    const updateResponse = await fetch(fullUrl, {
      method: "POST",
      body: updateFormData,
    });

    // Check if update worked
    expect(updateResponse.ok).toBe(true);
    const getResponse = await fetch(fullUrl);
    const data = await getResponse.json();
    const record = JSON.parse(JSON.stringify(data[0]));
    
    expect(record.record.tags.length).toBe(3);
    expect(JSON.stringify(record.record.tags)).toBe('["updated","test","tags"]');
  });

  //  Update with attachment
  it("Update record with new attachment", async () => {
    // creating a new record
    const deviceKey = await makeEncodedDeviceKey();
    console.log("Update to show attachment: " + deviceKey);
    let fullUrl = `${baseUrl}${deviceKey}`;
    
    const initialData = {
      blobType: 'deviceInitializer',
      deviceName: "Attachment Update Test",
      description: "Original description",
      tags: [],
      children_key: '',
      hasParent: false,
      isReportingKey: false,
    };
    
    const setupFormData = new FormData();
    setupFormData.append("provenanceRecord", JSON.stringify(initialData));
    
    await fetch(fullUrl, { method: "POST", body: setupFormData });

    //  Changing the description, tags and attachement
    const updateData = {
      blobType: 'deviceRecord',
      description: "Updated with attachment",
      tags: ['attachment-test'],
      children_key: '',
    };
    
    const updateFormData = new FormData();
    updateFormData.append("provenanceRecord", JSON.stringify(updateData));
    
    const buffer = await readFile('./test/attachments/c200.jpg');
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    updateFormData.append('updated-image.jpg', blob);
    
    const updateResponse = await fetch(fullUrl, {
      method: "POST",
      body: updateFormData,
    });
    
    expect(updateResponse.ok).toBe(true);

    // check if it works
    const getResponse = await fetch(fullUrl);
    const data = await getResponse.json();
    const record = JSON.parse(JSON.stringify(data[0]));
    
    expect(record.record.description).toBe("Updated with attachment");
    expect(record.record.tags.length).toBe(1);
    expect(record.attachments.length).toBeGreaterThan(0); 
  });
});



describe("Creating records with attachments", () => {
	const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'

	// create a record with an attachement 
	it("Create record with one attachment ", async () => {
		// Create record key
		const deviceKey = await makeEncodedDeviceKey();
		console.log("Created Device Key(attachements): " + deviceKey);
		let fullUrl = `${baseUrl}${deviceKey}`
		expect(deviceKey.length).toBe(22);
		expect(validateKey(deviceKey)).toBe(true);

		// POST record key
		try {
			const data = {
				blobType: 'deviceInitializer',
				deviceName: "Create Record Test",
				description: "An API Feature Test-Attachments",
				tags: {},
				children_key: '',
				hasParent: false,
				isReportingKey: false,
			}
			const formData = new FormData();
    		formData.append("provenanceRecord", JSON.stringify(data));

      const buffer = await readFile('./test/attachments/a200.jpg');
			const blob = new Blob([buffer], { type: 'image/jpeg' });
			formData.append('kirby.png', blob);

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
			expect(responseString.record.description).toBe('An API Feature Test-Attachments');
			expect(responseString.record.children_key).toBe("");
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isReportingKey).toBe(false);
      expect(responseString.attachments.length).toBe(1)

      // Download and compare original attached file and downlaod
      const attachmentHash = responseString.attachments[0];
      const downloadUrl = `https://gdtprodbackend.azurewebsites.net/api/attachment/${deviceKey}/${attachmentHash}`;
      console.log('Downloading from:', downloadUrl);
      const downloadResponse = await fetch(downloadUrl);
      expect(downloadResponse.ok).toBe(true);
      const retrievedBuffer = Buffer.from(await downloadResponse.arrayBuffer());
      //reading original file 
      const originalBuffer = await readFile('./test/attachments/a200.jpg');
      expect(Buffer.compare(originalBuffer, retrievedBuffer)).toBe(0);
  


		} catch(error) {
			console.error('(Create GET Test) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
			throw error;
		}
	});

// questions for vincent Regarding issue
  // In the instructions do you mean adding two images 
    //  also it is not possible to add PDF's can you clarify?
    ///i did not write to the disk is it still alright 
	
});
