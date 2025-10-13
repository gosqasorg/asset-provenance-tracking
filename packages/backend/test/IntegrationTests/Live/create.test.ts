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

	// The most basic possible test
	it("should create a group record with one child", async () => {
		const baseUrl = "https://gosqasbe.azurewebsites.net/api";
		
		// Generate device keys
		const groupKey = await (await fetch(`${baseUrl}/getNewDeviceKey`)).text();
		const childKey = await (await fetch(`${baseUrl}/getNewDeviceKey`)).text();
		
		// Create child record
		const childFormData = new FormData();
		childFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "child_smoketest",
			description: "child for most basic smoketest group record creation",
			tags: [],
			children_key: "",
			hasParent: false,
			isReportingKey: false
		}));
		
		const childResponse = await fetch(`${baseUrl}/provenance/${childKey}`, {
			method: "POST",
			body: childFormData,
		});
		
		expect(childResponse.ok).toBe(true);
		
		// Create group record
		const groupFormData = new FormData();
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "group_smoketest",
			description: "group for most basic smoketest group record creation",
			tags: [],
			children_key: [childKey],
			hasParent: false,
			isReportingKey: false
		}));
		
		const groupResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
			method: "POST",
			body: groupFormData,
		});
		
		expect(groupResponse.ok).toBe(true);
	}, 30000);


	// Most basic + one feature
	it("should create a group record with multiple children", async () => {
		const baseUrl = "https://gosqasbe.azurewebsites.net/api";
		
		// Generate device keys
		const groupKey = await (await fetch(`${baseUrl}/getNewDeviceKey`)).text();
		const childKeys: string[] = [];
		
		// Generate multiple child keys using a loop
		for (let i = 0; i < 3; i++) {
			const childKey = await (await fetch(`${baseUrl}/getNewDeviceKey`)).text();
			childKeys.push(childKey);
		}
		
		// Create child records using a loop
		for (let i = 0; i < childKeys.length; i++) {
			const childFormData = new FormData();
			childFormData.append("provenanceRecord", JSON.stringify({
				blobType: "deviceInitializer",
				deviceName: `child_${i + 1}_smoketest`,
				description: `child ${i + 1} for multiple children smoketest`,
				tags: [],
				children_key: "",
				hasParent: false,
				isReportingKey: false
			}));
			
			const childResponse = await fetch(`${baseUrl}/provenance/${childKeys[i]}`, {
				method: "POST",
				body: childFormData,
			});
			
			expect(childResponse.ok).toBe(true);
		}
		
		// Create group record with all children
		const groupFormData = new FormData();
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "group_multiple_children_smoketest",
			description: "group with multiple children for smoketest",
			tags: [],
			children_key: childKeys,
			hasParent: false,
			isReportingKey: false
		}));
		
		const groupResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
			method: "POST",
			body: groupFormData,
		});
		
		expect(groupResponse.ok).toBe(true);

		// Verify group record was created with multiple children
		const retrievedGroupResponse = await fetch(`${baseUrl}/provenance/${groupKey}`);
		const retrievedGroup = await retrievedGroupResponse.json();
		expect(retrievedGroup[0].record.children_key).toEqual(childKeys);

		// Verify all child records were created
		for (let i = 0; i < childKeys.length; i++) {
			const retrievedChildResponse = await fetch(`${baseUrl}/provenance/${childKeys[i]}`);
			const retrievedChild = await retrievedChildResponse.json();
			
			expect(retrievedChild).toBeDefined();
			expect(retrievedChild.length).toBeGreaterThan(0);
			expect(retrievedChild[0].record.deviceName).toBe(`child_${i + 1}_smoketest`);
		}
	}, 30000);


	// Everything all at once
	it("should create a group record with all features", async () => {
		const baseUrl = "https://gosqasbe.azurewebsites.net/api";
		
		// Generate device keys
		const groupKey = await (await fetch(`${baseUrl}/getNewDeviceKey`)).text();
		const childKeys: string[] = [];
		
		// Generate multiple child keys using a loop
		for (let i = 0; i < 3; i++) {
			const childKey = await (await fetch(`${baseUrl}/getNewDeviceKey`)).text();
			childKeys.push(childKey);
		}
		
		// Create child records with tags and detailed descriptions
		for (let i = 0; i < childKeys.length; i++) {
			const childFormData = new FormData();
			childFormData.append("provenanceRecord", JSON.stringify({
				blobType: "deviceInitializer",
				deviceName: `child_${i + 1}_feature_complete_creation`,
				description: `Child ${i + 1} with full features`,
				tags: ["feature-complete", "child", `child-${i + 1}`],
				children_key: "",
				hasParent: false,
				isReportingKey: false
			}));
			
			const childResponse = await fetch(`${baseUrl}/provenance/${childKeys[i]}`, {
				method: "POST",
				body: childFormData,
			});
			
			expect(childResponse.ok).toBe(true);
		}
		
		// Create group record with all features
		const groupFormData = new FormData();
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "group_all_features_creation",
			description: "Comprehensive group record creation with all features for smoketest",
			tags: ["feature-complete", "group", "comprehensive", "all-features"],
			children_key: childKeys,
			hasParent: false,
			isReportingKey: false
		}));
		
		const groupResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
			method: "POST",
			body: groupFormData,
		});
		
		expect(groupResponse.ok).toBe(true);
		
		// Verify group record was created with all features
		const retrievedGroupResponse = await fetch(`${baseUrl}/provenance/${groupKey}`);
		const retrievedGroup = await retrievedGroupResponse.json();
		
		expect(retrievedGroup).toBeDefined();
		expect(retrievedGroup.length).toBeGreaterThan(0);
		expect(retrievedGroup[0].record.blobType).toBe("deviceInitializer");
		expect(retrievedGroup[0].record.deviceName).toBe("group_all_features_creation");
		expect(retrievedGroup[0].record.children_key).toEqual(childKeys);
		expect(retrievedGroup[0].record.tags).toContain("feature-complete");
		expect(retrievedGroup[0].record.tags).toContain("group");
		expect(retrievedGroup[0].record.tags.length).toBe(4);
		expect(retrievedGroup[0].timestamp).toBeDefined();
		expect(retrievedGroup[0].timestamp).toBeGreaterThan(0);
		
		// Verify all child records were created
		for (let i = 0; i < childKeys.length; i++) {
			const retrievedChildResponse = await fetch(`${baseUrl}/provenance/${childKeys[i]}`);
			const retrievedChild = await retrievedChildResponse.json();
			
			expect(retrievedChild).toBeDefined();
			expect(retrievedChild.length).toBeGreaterThan(0);
			expect(retrievedChild[0].record.deviceName).toBe(`child_${i + 1}_feature_complete_creation`);
			expect(retrievedChild[0].record.tags).toContain("feature-complete");
			expect(retrievedChild[0].record.tags).toContain(`child-${i + 1}`);
			expect(retrievedChild[0].record.tags.length).toBe(3);
		}
	}, 30000);
	
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
	it("(Smoketest) Create a record with tags and attachments", async() => {
		const deviceKey = await makeEncodedDeviceKey();
		console.log("(3rd Test) Created Device Key: " + deviceKey);
		let fullUrl = `${baseUrl}${deviceKey}`
		expect(deviceKey.length).toBe(22);
		expect(validateKey(deviceKey)).toBe(true);

		// POST
		try {
			const data = {
				blobType: 'deviceInitializer',
				deviceName: "Create Record Test + 2 Features",
				description: "An API smoketest for creating a record with tags and an attachment",
				tags: ['smoketest', 'api'],
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

		// GET
		let getResponse; 
		try {
			getResponse = await fetch(fullUrl);
			getResponse = await getResponse.json();
			let responseString = JSON.parse(JSON.stringify(getResponse[0]));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Create Record Test + 2 Features');
			expect(responseString.record.description).toBe('An API smoketest for creating a record with tags and an attachment');
			expect(responseString.record.tags.length).toBe(2);
			expect(JSON.stringify(responseString.record.tags)).toBe('["smoketest","api"]');
			expect(responseString.attachments.length).toBe(1)

		} catch(error) {
			console.error('(Create GET Test) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
			throw error;
		}
	});
	
});
