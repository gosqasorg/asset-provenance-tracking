import { describe, it, expect } from "vitest";
import { readFile } from 'fs/promises';

describe("Backend Record Creation Tests", () => {
    it("Create and Retrieve A Basic Record", async () => {
        const baseUrl = 'https://gosqasbe.azurewebsites.net/api/';
        const record = {
            blobType: 'deviceInitializer',
            deviceName: "Create Record Test",
            description: "An integration test creating the most basic record",
            tags: [],
            children_key: '',
            hasParent: false,
            isReportingKey: false,
        }
        const postValues = { "provenanceRecord": record, "attachment": [] }

        const recordResponse = await fetch(`${baseUrl}createRecord`, { method: "POST", body: JSON.stringify(postValues) });
        expect(recordResponse.status).toBe(200)

        let recordUrl = (await recordResponse.json()).recordUrl;
        let deviceKey = recordUrl.substr(recordUrl.length - 22);
        console.log("Created Basic Record (url): ", recordUrl)

		try {
			let getResponse = await fetch(`${baseUrl}provenance/${deviceKey}`);
			getResponse = (await getResponse.json())[0];
			let responseString = JSON.parse(JSON.stringify(getResponse));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Create Record Test');
			expect(responseString.record.description).toBe('An integration test creating the most basic record');
			expect(responseString.record.children_key).toBe("");
            expect(responseString.record.tags).toEqual([]);
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isReportingKey).toBe(false);

		} catch(error) {
			console.error('(Basic Create Test) Failed to fetch url: ' + recordUrl + '\nError: ' + error) 
			throw error;
		}
    });

    it("Create and Retrieve A Record with Tags", async () => {
        const baseUrl = 'https://gosqasbe.azurewebsites.net/api/';
        const record = {
            blobType: 'deviceInitializer',
            deviceName: "Create Record Test",
            description: "An integration test creating a record with tags",
            tags: ['tags_test', 'integration'],
            children_key: '',
            hasParent: false,
            isReportingKey: false,
        }
        const postValues = { "provenanceRecord": record, "attachment": [] }

        const recordResponse = await fetch(`${baseUrl}createRecord`, { method: "POST", body: JSON.stringify(postValues) });
        expect(recordResponse.status).toBe(200)

        let recordUrl = (await recordResponse.json()).recordUrl;
        let deviceKey = recordUrl.substr(recordUrl.length - 22);
        console.log("Created Record With Tags (url): ", recordUrl)

		try {
			let getResponse = await fetch(`${baseUrl}provenance/${deviceKey}`);
			getResponse = (await getResponse.json())[0];
			let responseString = JSON.parse(JSON.stringify(getResponse));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Create Record Test');
			expect(responseString.record.description).toBe('An integration test creating a record with tags');
			expect(responseString.record.tags).toEqual(["tags_test", "integration"]);
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isReportingKey).toBe(false);

		} catch(error) {
			console.error('(Create With Tags Test) Failed to fetch url: ' + recordUrl.recordUrl + '\nError: ' + error) 
			throw error;
		}
    });

    it("Create and Retrieve A Record with Tags and Attachments", async () => {
        const baseUrl = 'https://gosqasbe.azurewebsites.net/api/';
        const record = {
            blobType: 'deviceInitializer',
            deviceName: "Create Record Test",
            description: "An integration test creating a record with tags and an attachment",
            tags: ['attach_test'],
            children_key: '',
            hasParent: false,
            isReportingKey: false,
        }

        // read the file and convert it to base64 string
        const buffer = await readFile('./test/attachments/a200.jpg');
        let base64string = buffer.toString("base64");
        const attachment = {
            name: "kirby.jpg",
            file: base64string
        }

        const postValues = { "provenanceRecord": record, "attachment": attachment }
        const recordResponse = await fetch(`${baseUrl}createRecord`, { method: "POST", body: JSON.stringify(postValues) });
        expect(recordResponse.status).toBe(200);

        let recordUrl = (await recordResponse.json()).recordUrl;
        let deviceKey = recordUrl.substr(recordUrl.length - 22);
        console.log("Created Record With Tags and Attachment (url): ", recordUrl)

		try {
			let getResponse = await fetch(`${baseUrl}provenance/${deviceKey}`);
			getResponse = (await getResponse.json())[0];
			let responseString = JSON.parse(JSON.stringify(getResponse));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Create Record Test');
			expect(responseString.record.description).toBe('An integration test creating a record with tags and an attachment');
			expect(responseString.record.tags).toEqual(['attach_test']);
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isReportingKey).toBe(false);
            expect(responseString.attachments.length).toBe(1)

            // Download attachment and confirm it matches original file
            const attachmentHash = responseString.attachments[0];
            const downloadUrl = `${baseUrl}attachment/${deviceKey}/${attachmentHash}`;
            console.log('createRecord downloading file from:', downloadUrl);
            const downloadResponse = await fetch(downloadUrl);
            expect(downloadResponse.ok).toBe(true);
            const retrievedBuffer = Buffer.from(await downloadResponse.arrayBuffer());
            
            // Reading original large file 
            const originalBuffer = await readFile('./test/attachments/a200.jpg');
            expect(Buffer.compare(originalBuffer as Uint8Array<ArrayBufferLike>, retrievedBuffer as Uint8Array<ArrayBufferLike>)).toBe(0);

		} catch(error) {
			console.error('(Create With Attachment Test) Failed to fetch url: ' + recordUrl + '\nError: ' + error) 
			throw error;
		}
    });

    it("Create A Record with Incorrect Format", async () => {
        const baseUrl = 'https://gosqasbe.azurewebsites.net/api/';
        // create a record that's missing a required field and confirm it fails (description)
        const record = {
            blobType: 'deviceInitializer',
            deviceName: "Create Record Test",
            tags: ['zod_test'],
            children_key: '',
            hasParent: false,
            isReportingKey: false,
        }

        const postValues = { "provenanceRecord": record, "attachment": [] }
        let recordResponse = await fetch(`${baseUrl}createRecord`, { method: "POST", body: JSON.stringify(postValues) });
        expect(recordResponse.status).toBe(400);

        // create a record that's missing an optional field and confirm it succeeds (blobType)
        const record2 = {
            deviceName: "Create Record Test",
            description: "A test to make sure zod is correctly filtering input",
            tags: ['zod_test'],
            children_key: '',
            hasParent: false,
            isReportingKey: false,
        }

        const postValues2 = { "provenanceRecord": record2, "attachment": [] }
        recordResponse = await fetch(`${baseUrl}createRecord`, { method: "POST", body: JSON.stringify(postValues2) });
        expect(recordResponse.status).toBe(200);

        let recordUrl = (await recordResponse.json()).recordUrl;
        let deviceKey = recordUrl.substr(recordUrl.length - 22);
        console.log("Created Record With Missing Optional Field (url): ", recordUrl)

		try {
			let getResponse = await fetch(`${baseUrl}provenance/${deviceKey}`);
			getResponse = (await getResponse.json())[0];
			let responseString = JSON.parse(JSON.stringify(getResponse));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Create Record Test');
			expect(responseString.record.description).toBe('A test to make sure zod is correctly filtering input');
			expect(responseString.record.tags).toEqual(["zod_test"]);
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isReportingKey).toBe(false);

		} catch(error) {
			console.error('(Create With Missing Optional) Failed to fetch url: ' + recordUrl + '\nError: ' + error) 
			throw error;
		}
    });
});