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
		
		// Generate device keys in parallel
		const [groupKeyRes, childKeyRes] = await Promise.all([
			fetch(`${baseUrl}/getNewDeviceKey`),
			fetch(`${baseUrl}/getNewDeviceKey`)
		]);
		const groupKey = await groupKeyRes.text();
		const childKey = await childKeyRes.text();
		
		// Create child and group records in parallel
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
		
		const [childResponse, groupResponse] = await Promise.all([
			fetch(`${baseUrl}/provenance/${childKey}`, {
				method: "POST",
				body: childFormData,
			}),
			fetch(`${baseUrl}/provenance/${groupKey}`, {
				method: "POST",
				body: groupFormData,
			})
		]);
		
		expect(childResponse.ok).toBe(true);
		expect(groupResponse.ok).toBe(true);
	}, 60000);


	// Most basic + one feature
	it("should create a group record with multiple children", async () => {
		const baseUrl = "https://gosqasbe.azurewebsites.net/api";
		
		// Generate all device keys in parallel
		const keyPromises = [
			fetch(`${baseUrl}/getNewDeviceKey`),
			...Array.from({length: 3}, () => fetch(`${baseUrl}/getNewDeviceKey`))
		];
		const keyResponses = await Promise.all(keyPromises);
		const keys = await Promise.all(keyResponses.map(res => res.text()));
		const groupKey = keys[0];
		const childKeys = keys.slice(1);
		
		// Create all child records in parallel
		const childCreationPromises = childKeys.map((key, i) => {
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
			
			return fetch(`${baseUrl}/provenance/${key}`, {
				method: "POST",
				body: childFormData,
			});
		});
		
		const childResponses = await Promise.all(childCreationPromises);
		childResponses.forEach(response => {
			expect(response.ok).toBe(true);
		});
		
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

		// Verify records in parallel
		const verificationPromises = [
			fetch(`${baseUrl}/provenance/${groupKey}`),
			...childKeys.map(key => fetch(`${baseUrl}/provenance/${key}`))
		];
		const verificationResponses = await Promise.all(verificationPromises);
		const verificationData = await Promise.all(
			verificationResponses.map(res => res.json())
		);
		const [retrievedGroup, ...retrievedChildren] = verificationData;
		
		expect(retrievedGroup[0].record.children_key).toEqual(childKeys);
		retrievedChildren.forEach((child, i) => {
			expect(child).toBeDefined();
			expect(child.length).toBeGreaterThan(0);
			expect(child[0].record.deviceName).toBe(`child_${i + 1}_smoketest`);
		});
	}, 60000);


	// Everything all at once
	it("should create a group record with all features", async () => {
		const baseUrl = "https://gosqasbe.azurewebsites.net/api";
		
		// Generate all device keys in parallel
		const numChildKeys = 4;
		const keyPromises = [
			fetch(`${baseUrl}/getNewDeviceKey`),
			...Array.from({length: numChildKeys}, () => fetch(`${baseUrl}/getNewDeviceKey`))
		];
		const keyResponses = await Promise.all(keyPromises);
		const keys = await Promise.all(keyResponses.map(res => res.text()));
		const groupKey = keys[0];
		const reportingKey = keys[1];
		let childKeys = keys.slice(2);
		
		// Create all child records in parallel
		let childCreationPromises = childKeys.map((key, i) => {
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
			
			return fetch(`${baseUrl}/provenance/${key}`, {
				method: "POST",
				body: childFormData,
			});
		});

		// Create reporting key record
		const reportingData = new FormData();
		reportingData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: `child_${numChildKeys}_feature_complete_creation`,
			description: `Child ${numChildKeys} with full features`,
			tags: ["feature-complete", "child", `child-${numChildKeys}`],
			children_key: "",
			hasParent: false,
			isReportingKey: true
		}));

		const response = fetch(`${baseUrl}/provenance/${reportingKey}`, {
			method: "POST",
			body: reportingData,
		});
		childCreationPromises.push(response);
		childKeys.push(reportingKey);
		
		const childResponses = await Promise.all(childCreationPromises);
		childResponses.forEach(response => {
			expect(response.ok).toBe(true);
		});

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
		
		// Verify all records in parallel
		const verificationPromises = [
			fetch(`${baseUrl}/provenance/${groupKey}`),
			...childKeys.map(key => fetch(`${baseUrl}/provenance/${key}`))
		];
		const verificationResponses = await Promise.all(verificationPromises);
		const verificationData = await Promise.all(
			verificationResponses.map(res => res.json())
		);
		const [retrievedGroup, ...retrievedChildren] = verificationData;
		
		// Verify group record was created with all features
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
		retrievedChildren.forEach((child, i) => {
			expect(child).toBeDefined();
			expect(child.length).toBeGreaterThan(0);
			expect(child[0].record.deviceName).toBe(`child_${i + 1}_feature_complete_creation`);
			expect(child[0].record.tags).toContain("feature-complete");
			expect(child[0].record.tags).toContain(`child-${i + 1}`);
			expect(child[0].record.tags.length).toBe(3);
		});

		// TODO: Need to add tests for recall/annotate (once a backend version of those functions is created)
		// Verify the reporting key is actually a reporting key
		expect(retrievedChildren[3][0].record.isReportingKey).toBe(true);

	}, 60000);
	
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
