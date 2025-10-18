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