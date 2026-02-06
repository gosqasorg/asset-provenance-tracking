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
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api";
		
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
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api";
		
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


    // Test reporting key functionality
    it("should create a group record with a reporting key", async () => {
        const baseUrl = "https://gdtprodbackend.azurewebsites.net/api";
		
		// Generate all device keys in parallel
		const numChildKeys = 2;
		const keyPromises = [
			fetch(`${baseUrl}/getNewDeviceKey`),
			...Array.from({length: numChildKeys}, () => fetch(`${baseUrl}/getNewDeviceKey`))
		];
		const keyResponses = await Promise.all(keyPromises);
		const keys = await Promise.all(keyResponses.map(res => res.text()));

        const groupKey = keys[0];
		const reportingKey = keys[1];
		const childKey = keys[2];
		let childKeys = [childKey, reportingKey];

		// Create a group with a child and a reporting key
		const groupFormData = new FormData();
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "group_reporting_test",
			description: "Group with a reporting key and a regular child",
			tags: [],
			children_key: childKeys,
			hasParent: false,
			isReportingKey: false
		}));
		
        const childFormData = new FormData();
		childFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: `child_1_reporting_test`,
			description: `Child 1 to compare to reporting key`,
			tags: ["reporting-test", "child", `child-1`],
			children_key: "",
			hasParent: false,
			isReportingKey: false
		}));

		const reportingData = new FormData();
		reportingData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: `reporting_key_reporting_test`,
			description: `A reporting key to test reporting key functionality`,
			tags: ["reporting-test", "reportingKey"],
			children_key: "",
			hasParent: false,
			isReportingKey: true
		}));
		
		const creationPromises = [
			fetch(`${baseUrl}/provenance/${groupKey}`, {
				method: "POST",
				body: groupFormData,
			}),
			fetch(`${baseUrl}/provenance/${childKey}`, {
				method: "POST",
				body: childFormData,
			}),
			fetch(`${baseUrl}/provenance/${reportingKey}`, {
				method: "POST",
				body: reportingData,
			}),
		];
		const creationResponses = await Promise.all(creationPromises);
		creationResponses.forEach(response => {
			expect(response.ok).toBe(true)
		})
		
		// Verify all records in parallel
		const verificationPromises = [
			fetch(`${baseUrl}/provenance/${groupKey}`),
			...childKeys.map(key => fetch(`${baseUrl}/provenance/${key}`))
		];
		const verificationResponses = await Promise.all(verificationPromises);
		const verificationData = await Promise.all(
			verificationResponses.map(res => res.json())
		);
		const [retrievedGroup, retrievedChild, retrievedReporting] = verificationData;
		
		// Verify that the records were created, and that the reporting key is a reporting key
		expect(retrievedGroup).toBeDefined();
		expect(retrievedGroup.length).toBeGreaterThan(0);
		expect(retrievedGroup[0].record.deviceName).toBe("group_reporting_test");
		expect(retrievedGroup[0].record.children_key).toEqual(childKeys);
		
		expect(retrievedChild).toBeDefined();
		expect(retrievedChild.length).toBeGreaterThan(0);
		expect(retrievedChild[0].record.deviceName).toBe(`child_1_reporting_test`);
		expect(retrievedChild[0].record.tags).toContain(`reporting-test`);

		expect(retrievedReporting).toBeDefined();
		expect(retrievedReporting.length).toBeGreaterThan(0);
		expect(retrievedReporting[0].record.deviceName).toBe(`reporting_key_reporting_test`);
		expect(retrievedReporting[0].record.tags).toContain("reportingKey");
		expect(retrievedReporting[0].record.isReportingKey).toBe(true);

		// Recall a new record (should be sent to parent and child, not reporting key)
		const recallRecord = {
			blobType: 'deviceRecord',
			description: "Updated only the child with recall",
			tags: ['recall', 'reporting-test'],
			children_key: '',
		};
		
		const recallFormData = new FormData();
		recallFormData.append("provenanceRecord", JSON.stringify(recallRecord));
	
		const updateResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
			method: "POST",
			body: recallFormData,
		});
		const recallResponse = await fetch(`${baseUrl}/provenance/recall/${groupKey}`, {
			method: "POST",
			body: recallFormData,
		});
		expect(updateResponse.ok).toBe(true);
		expect(recallResponse.ok).toBe(true);

		// Annotate a new record (should be sent to parent and child, not reporting key)
		const annotatedRecord = {
			blobType: 'deviceRecord',
			description: "Updated only the child with annotate",
			tags: ['annotate', 'reporting-test', 'test-2'],
			children_key: '',
		};
		
		const annotateFormData = new FormData();
		annotateFormData.append("provenanceRecord", JSON.stringify(annotatedRecord));
	
		const annotateUpdateResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
			method: "POST",
			body: annotateFormData,
		});
		const annotateResponse = await fetch(`${baseUrl}/provenance/annotate/${groupKey}`, {
			method: "POST",
			body: annotateFormData,
		});
		expect(annotateUpdateResponse.ok).toBe(true);
		expect(annotateResponse.ok).toBe(true);

		// Make sure the child got the recalled/annotated records and that the reporting key did not get them
		const updatePromises = [
			...childKeys.map(key => fetch(`${baseUrl}/provenance/${key}`))
		];
		const updateResponses = await Promise.all(updatePromises);
		const updateData = await Promise.all(
			updateResponses.map(res => res.json())
		);
		const [childRecord, reportingRecord] = updateData;

		expect(childRecord[1].record.description).toBe("Updated only the child with recall");
		expect(childRecord[1].record.tags).toStrictEqual(['recall', 'reporting-test']);
		expect(childRecord[0].record.description).toBe("Annotated by admin");
		expect(childRecord[0].record.tags).toStrictEqual(['annotate', 'reporting-test', 'test-2']);

		expect(reportingRecord.length).toBe(1);
		expect(reportingRecord[0].record.description).toBe(`A reporting key to test reporting key functionality`);
		expect(reportingRecord[0].record.deviceName).toBe(`reporting_key_reporting_test`);
		expect(reportingRecord[0].record.tags).toStrictEqual(['reporting-test', 'reportingKey']);
    });


	// Everything all at once
	it("should create a group record with all features", async () => {
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api";
		
		// Generate all device keys in parallel
		const keyPromises = [
			fetch(`${baseUrl}/getNewDeviceKey`),
			...Array.from({length: 3}, () => fetch(`${baseUrl}/getNewDeviceKey`))
		];
		const keyResponses = await Promise.all(keyPromises);
		const keys = await Promise.all(keyResponses.map(res => res.text()));

        const groupKey = keys[0];
		let childKeys = keys.slice(1);
		
		// Create all child records in parallel
		const childCreationPromises = childKeys.map((key, i) => {
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

	}, 60000);



	it("should create a group record with tags", async () => {
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api";
		
		// Generate device keys
		const [groupKeyRes, childKeyRes] = await Promise.all([
            fetch(`${baseUrl}/getNewDeviceKey`),
            fetch(`${baseUrl}/getNewDeviceKey`)
        ]);
        const groupKey = await groupKeyRes.text();
        const childKey = await childKeyRes.text();
		
		// Create one child record
		const childFormData = new FormData();
		childFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: `child_tag_feature`,
			description: `Child with tags`,
			tags: ["tag-feature", "child"],
			children_key: "",
			hasParent: false,
			isReportingKey: false
		}));
			
		const childResponse = await fetch(`${baseUrl}/provenance/${childKey}`, {
			method: "POST",
			body: childFormData,
		});

		expect(childResponse.ok).toBe(true);
		
		// Create group record with tags
		const groupFormData = new FormData();
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "group_tag_feature",
			description: "Group record creation with tags for smoketest",
			tags: ["tag-feature", "Group: 1 child"],
			children_key: [childKey],
			hasParent: false,
			isReportingKey: false
		}));
		
		const groupResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
			method: "POST",
			body: groupFormData,
		});
		
		expect(groupResponse.ok).toBe(true);
		
		// Verify records
		const verificationPromises = [
			fetch(`${baseUrl}/provenance/${groupKey}`),
			fetch(`${baseUrl}/provenance/${childKey}`)
		];
		const verificationResponses = await Promise.all(verificationPromises);
		const verificationData = await Promise.all(
			verificationResponses.map(res => res.json())
		);
		const [retrievedGroup, retrievedChild] = verificationData;
		
		expect(retrievedGroup).toBeDefined();
		expect(retrievedGroup.length).toBeGreaterThan(0);
		expect(retrievedGroup[0].record.blobType).toBe("deviceInitializer");
		expect(retrievedGroup[0].record.deviceName).toBe("group_tag_feature");
		expect(retrievedGroup[0].record.children_key).toEqual([childKey]);
		expect(retrievedGroup[0].record.tags).toContain("tag-feature");
		expect(retrievedGroup[0].record.tags).toContain("Group: 1 child");
		expect(retrievedGroup[0].record.tags.length).toBe(2);
		
		// Verify child record were created
		expect(retrievedChild).toBeDefined();
        expect(retrievedChild.length).toBeGreaterThan(0);
		expect(retrievedChild[0].record.deviceName).toBe(`child_tag_feature`);
		expect(retrievedChild[0].record.tags).toContain("tag-feature");
		expect(retrievedChild[0].record.tags.length).toBe(2);
	}, 60000);
	
	// Group Creation test with 2 child keys + annotation
	it("Group Creation - Annotating Child Records", async () => {

		// Create new group and children keys
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api";
		const keysCreation = [fetch(`${baseUrl}/getNewDeviceKey`),...Array.from({length: 2}, () => fetch(`${baseUrl}/getNewDeviceKey`))];
		const keyResponses = await Promise.all(keysCreation);
		const keys = await Promise.all(keyResponses.map(res => res.text()));

		const groupKey = keys[0];
		const childKeys = keys.splice(1);

		// Create group parent key
		const groupFormData = new FormData();
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "Group Creation - Annotation record",
			description: "Group record for Annotating Child Records test",
			tags: "Why hello, child",
			children_key: childKeys,
			annotated: true,
			hasParent: false,
			inReportingKey: false
		}));

		// Preparation for annotation option extraction
		const formDataValue = groupFormData.get("provenanceRecord");
		const formDataObject = JSON.parse(formDataValue);
		let childFormData;
		let childrenPromises;

		// If annotation is selected, create child keys in parallel with tags
		if (formDataObject.annotated){
			childrenPromises = childKeys.map((key, i) => {
				childFormData = new FormData();
				childFormData.append("provenanceRecord", JSON.stringify({
					blobType: "deviceInitializer",
					deviceName: `child_${i + 1}`,
					description: "child for group creation annotation test",
					tags: formDataObject.tags,
					children_key: "",
					hasParent: true,
					isReportingKey: false
				}));
				return fetch(`${baseUrl}/provenance/${key}`, {
					method: "POST",
					body: childFormData,
				});
			});
			
			// WAIT for children to be created
			const childResponses = await Promise.all(childrenPromises);
			childResponses.forEach(response => {
				expect(response.ok).toBe(true);
			});
		}

		// CREATED THE GROUP RECORD 
		const groupResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
			method: "POST",
			body: groupFormData,
		});
		
		expect(groupResponse.ok).toBe(true);

		// Verify tags are present in all child keys
		const verificationPromises = [fetch(`${baseUrl}/provenance/${groupKey}`), ...childKeys.map(key => fetch(`${baseUrl}/provenance/${key}`))];
		const verificationResponses = await Promise.all(verificationPromises);
		const verificationData = await Promise.all(verificationResponses.map(response => response.json()));
		const [retrievedGroup, ...retrievedChildren] = verificationData;

		retrievedChildren.forEach((child, i) => {
			expect(child[0].record.tags).toContain("Why hello, child");
		});

	}, 6000); 
	// Test for custom titles
	it("should create a group with two children having custom titles", async () => {
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api";
		
		// Generate device keys 
		const groupKey = await makeEncodedDeviceKey();
		const childKey1 = await makeEncodedDeviceKey();
		const childKey2 = await makeEncodedDeviceKey();
		const childKeys = [childKey1, childKey2];
		
		// Define custom titles for the children
		const customTitles = [
			"Custom Title DanielGreen",
			"Custom Title JohnGreene"
		];
		
		console.log("Group key:", groupKey);
		console.log("Child keys:", childKeys);
		
		// Validate keys
		expect(groupKey.length).toBe(22);
		expect(validateKey(groupKey)).toBe(true);
		childKeys.forEach(key => {
			expect(key.length).toBe(22);
			expect(validateKey(key)).toBe(true);
		});
		
		// Create child records with custom titles in parallel
		const childrenPromises = childKeys.map((key, i) => {
			const childFormData = new FormData();
			childFormData.append("provenanceRecord", JSON.stringify({
				blobType: "deviceInitializer",
				deviceName: customTitles[i],
				description: `Child record ${i + 1} with custom title`,
				tags: [],
				children_key: "",
				hasParent: false,
				isReportingKey: false
			}));
			
			return fetch(`${baseUrl}/${key}`, {
				method: "POST",
				body: childFormData,
			});
		});
		
		// Wait for child creation to complete
		const childResponses = await Promise.all(childrenPromises);
		childResponses.forEach(response => {
			expect(response.ok).toBe(true);
		});
		
		// Create group parent record
		const groupFormData = new FormData();
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "group with custom child ",
			description: "Group with children having custom titles",
			tags: [],
			children_key: childKeys,
			hasParent: false,
			isReportingKey: false
		}));
		
		const groupResponse = await fetch(`${baseUrl}/${groupKey}`, {
			method: "POST",
			body: groupFormData,
		});
		
		expect(groupResponse.ok).toBe(true);
		
		// Verify custom titles are present in all child keys
		const verificationPromises = childKeys.map(key => 
			fetch(`${baseUrl}/${key}`)
		);
		const verificationResponses = await Promise.all(verificationPromises);
		const verificationData = await Promise.all(
			verificationResponses.map(response => response.json())
		);
		
		// Verify each child has the correct custom title
		verificationData.forEach((child, i) => {
			expect(child).toBeDefined();
			expect(child.length).toBeGreaterThan(0);
			expect(child[0].record.deviceName).toBe(customTitles[i]);
		});
	}, 60000);

	
//TODO: Test making attachment for group itself as a parent of the children
//. read group record for attachmment and then read one child record for attachment.

	//Group record with one attachment test
	it("should create a group record with one attachment", async () => {
    	const baseUrl = "https://gdtprodbackend.azurewebsites.net/api"

    	//Generate device keys in parallel
    	const [groupKeyRes, childKeyRes] = await Promise.all([
        	fetch(`${baseUrl}/getNewDeviceKey`),
        	fetch(`${baseUrl}/getNewDeviceKey`)
    	]);
    	const groupKey = await groupKeyRes.text();
    	const childKey = await childKeyRes.text();

    	// child 
    	const childFormData = new FormData()
    	childFormData.append("provenanceRecord", JSON.stringify({
        	blobType: "deviceInitializer",
        	deviceName: "child_for_one_attachment",
        	description: "child for group single-attachment test",
        	tags: [],
        	children_key: "",
        	hasParent: false,
        	isReportingKey: false
    	}));
    	const childPost = await fetch(`${baseUrl}/provenance/${childKey}`, { method: "POST", body: childFormData })
    	expect(childPost.ok).toBe(true)

    	//create group record with one attachment (using a200.jpg from repo)
    	const groupFormData = new FormData()
    	groupFormData.append("provenanceRecord", JSON.stringify({
        	blobType: "deviceInitializer",
        	deviceName: "group_with_one_attachment",
        	description: "group with a single attachment",
        	tags: [],
        	children_key: [childKey],
        	hasParent: false,
        	isReportingKey: false
    	}));

        try {
        	const buffer = await readFile('./test/attachments/a200.jpg')
        	const blob = new Blob([buffer], { type: 'image/jpeg' })
        	groupFormData.append('attachment', blob) 

        	const postResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
            	method: "POST",
            	body: groupFormData,
        	});
     		expect(postResponse.ok).toBe(true)
    	} catch (error) {
        	console.error("(Create POST Test) Error creating group with attachment: " + error)
        	throw error
    	}

    	// GET and verify the record has one attachment
    	try {
        	// GET the group and check attachment
    		const getResponse = await (await fetch(`${baseUrl}/provenance/${groupKey}`)).json()
			expect(getResponse).toBeDefined()
			expect(getResponse.length).toBeGreaterThan(0)
			let responseString = JSON.parse(JSON.stringify(getResponse[0]))

			expect(JSON.stringify(getResponse)).not.toBe('[]')
			expect(responseString.record.deviceName).toBe('group_with_one_attachment')
			expect(responseString.record.description).toBe('group with a single attachment')
			expect(responseString.record.children_key[0]).toBe(childKey)
			expect(responseString.record.hasParent).toBe(false)
			expect(responseString.record.isReportingKey).toBe(false)
            expect(responseString.attachments.length).toBe(1)

    		const groupEntry = getResponse[0]
    		expect(groupEntry.attachments).toBeDefined()
    		expect(groupEntry.attachments.length).toBeGreaterThanOrEqual(1)
    
			//const attHash = groupEntry.attachments[0]
			const attHash = responseString.attachments[0]

    		// GET the child and assert it hasn't inherited the attachment 
			//Returns false, however we expect it to return true? 
			const childGet = await (await fetch(`${baseUrl}/provenance/${childKey}`)).json()
			expect(childGet).toBeDefined()
			expect(childGet.length).toBeGreaterThan(0)
    
			const childEntry = childGet[0]
    		expect(childEntry).toBeDefined()
    		expect(childEntry.attachments).toBeDefined()
			// == 0 -->>
			//expect(childEntry.attachments.length).toBeGreaterThanOrEqual(1)
    		expect(childEntry.attachments.includes(attHash)).toBe(false)
    
			// Try to download the attachment using the child's key (should fail)
			const downloadUrl = `${baseUrl}/attachment/${childKey}/${attHash}`
			const downloadResponse = await fetch(downloadUrl)
    		expect(downloadResponse.ok).toBe(false)

			// Try to download the attachment using the group's key (should succeed)
			const downloadUrl2 = `${baseUrl}/attachment/${groupKey}/${attHash}`
			const downloadResponse2 = await fetch(downloadUrl2)
			expect(downloadResponse2.ok).toBe(true)

    		const retrievedBuffer = Buffer.from(await downloadResponse2.arrayBuffer())
    		const originalBuffer = await readFile('./test/attachments/a200.jpg')
    		expect(originalBuffer.equals(retrievedBuffer)).toBe(true) 
    	} catch (error) {
        	console.error("(Create GET Test) Failed to fetch/verify group attachments: " + error)
        	throw error
    	}
	}, 60000);

	//Group record with multiple attachments test
	it("should create a group record with multiple attachments", async() => {
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api"

		// Generate device keys in parallel
    	const [groupKeyRes, childKeyRes] = await Promise.all([
        	fetch(`${baseUrl}/getNewDeviceKey`),
        	fetch(`${baseUrl}/getNewDeviceKey`)
    	]);
    	const groupKey = await groupKeyRes.text()
    	const childKey = await childKeyRes.text()

		// child
    	const childFormData = new FormData()
    	childFormData.append("provenanceRecord", JSON.stringify({
        	blobType: "deviceInitializer",
        	deviceName: "child_for_multiple_attachments",
        	description: "child for group multiple-attachments test",
        	tags: [],
        	children_key: "",
        	hasParent: false,
        	isReportingKey: false
    	}));
    	const childPost = await fetch(`${baseUrl}/provenance/${childKey}`, { method: "POST", body: childFormData })
    	expect(childPost.ok).toBe(true)

		// create group record with multiple attachments (using a200.jpg and c200.jpg from repo)
		const groupFormData = new FormData()
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "group_with_multiple_attachments",
			description: "group with multiple attachments",
			tags: [],
			children_key: [childKey],
			hasParent: false,
			isReportingKey: false
		}));
		
		try {
			const buffer1 = await readFile('./test/attachments/a200.jpg')
			//converting buffer to Uint8Array to avoid "TypeError: Failed to construct 'Blob': The provided value cannot be converted to a sequence."
			const blob1 = new Blob([Uint8Array.from(buffer1)], { type: 'image/jpeg' })
			groupFormData.append('attachment1', blob1, 'attachment1.bin')

			const buffer2 = await readFile('./test/attachments/c200.jpg')
			const blob2 = new Blob([Uint8Array.from(buffer2)], { type: 'image/jpeg' })
			groupFormData.append('attachment2', blob2, 'attachment2.bin')

			const postResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
				method: "POST",
				body: groupFormData,
			});
			expect(postResponse.ok).toBe(true)
		} catch (error) {
			console.error("(Create POST Test) Error creating group with multiple attachments: " + error)
			throw error;
		}
		
		// GET and verify the record has multiple attachments
		//Not checking whether the children have inherited attachments here: also because you cannot add more than one attachment to a group on the web
		try {
			const getResponse = await (await fetch(`${baseUrl}/provenance/${groupKey}`)).json()
			expect(getResponse).toBeDefined()
			expect(getResponse.length).toBeGreaterThan(0)

			const groupEntry = getResponse[0]
			expect(groupEntry).toBeDefined()
			expect(groupEntry.attachments).toBeDefined()
			// Check whether two or moreattachments returned
			expect(groupEntry.attachments.length).toBeGreaterThanOrEqual(2)
			// check for the attachments
			expect(groupEntry.attachments[0]).toBeDefined()
			expect(groupEntry.attachments[1]).toBeDefined()

			//Haven't implemented download check
		} catch (error) {
			console.error("(Create GET Test) Failed to fetch/verify group multiple attachments: " + error)
			throw error
		}
	}, 60000);

	//Group attachment includes a PDF
	it("should create a group record with a PDF", async() => {
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api"

		// Generate device keys in parallel
    	const [groupKeyRes, childKeyRes] = await Promise.all([
        	fetch(`${baseUrl}/getNewDeviceKey`),
        	fetch(`${baseUrl}/getNewDeviceKey`)
    	]);
    	const groupKey = await groupKeyRes.text()
    	const childKey = await childKeyRes.text()

		// child
    	const childFormData = new FormData();
    	childFormData.append("provenanceRecord", JSON.stringify({
        	blobType: "deviceInitializer",
        	deviceName: "child_for_group_pdf",
        	description: "child for group pdf attachment test",
        	tags: [],
        	children_key: "",
        	hasParent: false,
        	isReportingKey: false
    	}));
    	const childPost = await fetch(`${baseUrl}/provenance/${childKey}`, { method: "POST", body: childFormData })
    	expect(childPost.ok).toBe(true)

		// create group record with multiple attachments (using a200.jpg and c200.jpg from repo)
		const groupFormData = new FormData();
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "group_with_pdf_attachment",
			description: "group with pdf attachment (download/compare)",
			tags: [],
			children_key: [childKey],
			hasParent: false,
			isReportingKey: false
		}));
		
		try {
			const buffer = await readFile('./test/attachments/PDFTest2.pdf')
			const blob1 = new Blob([buffer], { type: 'application/pdf'})
			groupFormData.append('document.pdf', blob1)

			const postResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
				method: "POST",
				body: groupFormData,
			});
			expect(postResponse.ok).toBe(true)
		} catch (error) {
			console.error("(Group Create POST Test - PDF) Error creating group with PDF: " + error)
			throw error
		}
		
		// GET and verify 
		try {
			const getResponse = await (await fetch(`${baseUrl}/provenance/${groupKey}`)).json()
			expect(getResponse).toBeDefined()
			expect(getResponse.length).toBeGreaterThan(0)

			const groupEntry = getResponse[0]
			expect(groupEntry).toBeDefined()
			expect(groupEntry.attachments).toBeDefined()
			expect(groupEntry.attachments.length).toBeGreaterThanOrEqual(1)
			expect(groupEntry.attachments[0]).toBeDefined()

			const attachmentHash = groupEntry.attachments[0]
			const downloadUrl = `${baseUrl}/attachment/${groupKey}/${attachmentHash}`
			const downloadResponse = await fetch(downloadUrl)
			expect(downloadResponse.ok).toBe(true)
	
			const retrievedBuffer = Buffer.from(await downloadResponse.arrayBuffer())
			const originalBuffer = await readFile('./test/attachments/PDFTest2.pdf')
			expect(Buffer.compare(originalBuffer, retrievedBuffer)).toBe(0)

		} catch (error) {
			console.error("(Group Create GET Test - PDF) Failed to fetch/verify group PDF attachment: " + error)
			throw error
		}
	}, 60000);
	
	//Group: Large attachment (>2MB)
	it("should create a group record with a large attachment and verify download", async () => {
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api"

		const [groupKeyRes, childKeyRes] = await Promise.all([
			fetch(`${baseUrl}/getNewDeviceKey`),
			fetch(`${baseUrl}/getNewDeviceKey`)
		]);
		const groupKey = await groupKeyRes.text()
		const childKey = await childKeyRes.text()

		// child
		const childFormData = new FormData()
		childFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "child_for_group_large",
			description: "child for group large file test",
			tags: [],
			children_key: "",
			hasParent: false,
			isReportingKey: false
		}));
		const childPost = await fetch(`${baseUrl}/provenance/${childKey}`, { method: "POST", body: childFormData })
		expect(childPost.ok).toBe(true)

		const groupFormData = new FormData()
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "group_large_attachment",
			description: "group with large attachment (>2MB)",
			tags: [],
			children_key: [childKey],
			hasParent: false,
			isReportingKey: false
		}));

		try {
			const buffer = await readFile('./test/attachments/LargePDF2.pdf')
			const blob = new Blob([Uint8Array.from(buffer)], { type: 'application/pdf' })
			groupFormData.append('largefile.pdf', blob) 

			const fileSizeInMB = buffer.length / (1024 * 1024)
			console.log(`Group large file size: ${fileSizeInMB.toFixed(2)} MB`)
			expect(fileSizeInMB).toBeGreaterThan(2)

			const postResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
				method: "POST",
				body: groupFormData,
			});
			expect(postResponse.ok).toBe(true)
		} catch (error) {
			console.error("(Group Create POST Test - Large) Error creating group with large file: " + error)
			throw error
		}

		try {
			const getResponse = await (await fetch(`${baseUrl}/provenance/${groupKey}`)).json()
			expect(getResponse).toBeDefined()
			expect(getResponse.length).toBeGreaterThan(0)
			
			const groupEntry = getResponse[0]
			expect(groupEntry).toBeDefined()
			expect(groupEntry.attachments).toBeDefined()
			expect(groupEntry.attachments.length).toBe(1)

			const attachmentHash = groupEntry.attachments[0]
			const downloadUrl = `${baseUrl}/attachment/${groupKey}/${attachmentHash}`
			const downloadResponse = await fetch(downloadUrl)
			expect(downloadResponse.ok).toBe(true)

			const retrievedBuffer = Buffer.from(await downloadResponse.arrayBuffer())
			const originalBuffer = await readFile('./test/attachments/LargePDF2.pdf')
			expect(originalBuffer.equals(retrievedBuffer)).toBe(true)
		} catch (error) {
			console.error("(Group Create GET Test - Large) Failed to fetch/verify group large attachment: " + error)
			throw error
		}
	}, 60000);

	// Group creation with invalid device key
	it("should fail to create a group record with an invalid device key", async () => {
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api";
		const invalidGroupKey = "INVALID_KEY_12345";
		
		// Attempt to create group record with invalid key
		const groupFormData = new FormData();
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "invalid_key_group_smoketest",
			description: "group creation attempt with invalid device key",
			tags: [],
			children_key: [],
			hasParent: false,
			isReportingKey: false
		}));
		
		const groupResponse = await fetch(`${baseUrl}/provenance/${invalidGroupKey}`, {
			method: "POST",
			body: groupFormData,
		});
		
		// Expect the response to indicate failure (e.g., 500 Internal Server Error)
		console.log("Response Status for Invalid Key Test: " + groupResponse.status);
		expect(groupResponse.ok).toBe(false);
		expect(groupResponse.status).toBe(500);
	}, 60000);

		// Group with zero children
	it("should create a group record with zero children", async () => {
		const baseUrl = "https://gdtprodbackend.azurewebsites.net/api";
		// Generate device key
		const groupKeyRes = await fetch(`${baseUrl}/getNewDeviceKey`);
		const groupKey = await groupKeyRes.text();
		// Create group record
		const groupFormData = new FormData();
		groupFormData.append("provenanceRecord", JSON.stringify({
			blobType: "deviceInitializer",
			deviceName: "group_zero_children_smoketest",
			description: "group with zero children for smoketest",
			tags: [],
			children_key: [],
			hasParent: false,
			isReportingKey: false
		}));
		const groupResponse = await fetch(`${baseUrl}/provenance/${groupKey}`, {
			method: "POST",
			body: groupFormData,
		});
		expect(groupResponse.ok).toBe(true);

		// Verify group record
		const verificationResponse = await fetch(`${baseUrl}/provenance/${groupKey}`);
		const verificationData = await verificationResponse.json();
		expect(verificationData).toBeDefined();
		expect(verificationData.length).toBeGreaterThan(0);
		expect(verificationData[0].record.deviceName).toBe("group_zero_children_smoketest");
		expect(verificationData[0].record.children_key).toEqual([]);
		expect(verificationData[0].record.children_key.length).toBe(0);
		expect(verificationData[0].record.hasParent).toBe(false);

	}, 60000);

});

describe("Record Creation Tests", () => {
	const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api'

	// The most basic possible test -- create a record
	it("(Smoketest) Create the most basic record", async () => {
		// Create record key
		const deviceKey = await makeEncodedDeviceKey();
		console.log("(1st Test) Created Device Key: " + deviceKey);
		let fullUrl = `${baseUrl}/${deviceKey}`
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
	}, 600000);

	
	// Most basic + one feature
	it("", async() => {
	});


    // Note: As we add feature tests, we'll accumulate them into the feature-complete test
	// Everything all at once -- create a record with tags and an image
	it("(Smoketest) Create a record with tags and attachments", async() => {
		const deviceKey = await makeEncodedDeviceKey();
		console.log("(3rd Test) Created Device Key: " + deviceKey);
		let fullUrl = `${baseUrl}/${deviceKey}`
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
	}, 600000);
});
