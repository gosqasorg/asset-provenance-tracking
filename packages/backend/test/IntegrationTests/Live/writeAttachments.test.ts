import { describe, it, expect } from "vitest";
import { makeEncodedDeviceKey, validateKey } from '../../../src/utils/keyFuncs';
import { readFile } from 'fs/promises';
import { writeFile } from 'fs/promises';




describe("Creating records with attachments", () => {
	const baseUrl = "https://gosqasbe.azurewebsites.net/api/provenance/";

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
            const downloadUrl = `https://gosqasbe.azurewebsites.net/api/attachment/${deviceKey}/${attachmentHash}`;
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


    it("Create record with multiple attachments", async () => {
        // Create record key
        const deviceKey = await makeEncodedDeviceKey();
        console.log("Created Device Key (multiple attachments): " + deviceKey);
        let fullUrl = `${baseUrl}${deviceKey}`
        expect(deviceKey.length).toBe(22);
        expect(validateKey(deviceKey)).toBe(true);

        // POST record key with MULTIPLE attachments
        try {
            const data = {
            blobType: 'deviceInitializer',
            deviceName: "Create Record Test - Multiple Attachments",
            description: "An API Feature Test - Multiple Attachments",
            tags: {},
            children_key: '',
            hasParent: false,
            isReportingKey: false,
            }
            const formData = new FormData();
            formData.append("provenanceRecord", JSON.stringify(data));

            // Attach FIRST file
            const buffer1 = await readFile('./test/attachments/a200.jpg');
            const blob1 = new Blob([buffer1], { type: 'image/jpeg' });
            formData.append('image1.jpg', blob1);

            // Attach SECOND file
            const buffer2 = await readFile('./test/attachments/c200.jpg');
            const blob2 = new Blob([buffer2], { type: 'image/jpeg' });
            formData.append('image2.jpg', blob2);

            const postResponse = await fetch(fullUrl, {
            method: "POST",
            body: formData,
            });

            expect(postResponse.ok).toBe(true);

        } catch (error) {
            console.error("(Create POST Test - Multiple) Error creating a record: " + error); 
            throw error;
        }

        // GET record key to make sure it exists with both attachments
        let getResponse; 
        try {
            getResponse = await fetch(fullUrl);
            getResponse = await getResponse.json();
            let responseString = JSON.parse(JSON.stringify(getResponse[0]));

            expect(JSON.stringify(getResponse)).not.toBe('[]');
            expect(responseString.record.deviceName).toBe('Create Record Test - Multiple Attachments');
            expect(responseString.record.description).toBe('An API Feature Test - Multiple Attachments');
            expect(responseString.attachments.length).toBe(2); // Check we have 2 attachments

            // Download and compare FIRST attachment
            const attachmentHash1 = responseString.attachments[0];
            const downloadUrl1 = `https://gosqasbe.azurewebsites.net/api/attachment/${deviceKey}/${attachmentHash1}`;
            console.log('Downloading first attachment from:', downloadUrl1);
            const downloadResponse1 = await fetch(downloadUrl1);
            expect(downloadResponse1.ok).toBe(true);
            const retrievedBuffer1 = Buffer.from(await downloadResponse1.arrayBuffer());
            const originalBuffer1 = await readFile('./test/attachments/a200.jpg');
            expect(Buffer.compare(originalBuffer1, retrievedBuffer1)).toBe(0);
            console.log('First attachment matches original');

            // Download and compare SECOND attachment
            const attachmentHash2 = responseString.attachments[1];
            const downloadUrl2 = `https://gosqasbe.azurewebsites.net/api/attachment/${deviceKey}/${attachmentHash2}`;
            console.log('Downloading second attachment from:', downloadUrl2);
            const downloadResponse2 = await fetch(downloadUrl2);
            expect(downloadResponse2.ok).toBe(true);
            const retrievedBuffer2 = Buffer.from(await downloadResponse2.arrayBuffer());
            const originalBuffer2 = await readFile('./test/attachments/c200.jpg');
            expect(Buffer.compare(originalBuffer2, retrievedBuffer2)).toBe(0);
            console.log('Second attachment matches original');

        } catch(error) {
            console.error('(Create GET Test - Multiple) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
            throw error;
        }

    }, 600000);

    it("Create record with PDF attachment", async () => {
        // Create record key
        const deviceKey = await makeEncodedDeviceKey();
        console.log("Created Device Key (PDF attachment): " + deviceKey);
        let fullUrl = `${baseUrl}${deviceKey}`
        expect(deviceKey.length).toBe(22);
        expect(validateKey(deviceKey)).toBe(true);

        // POST record key with PDF attachment
        try {
            const data = {
            blobType: 'deviceInitializer',
            deviceName: "Create Record Test - PDF",
            description: "An API Feature Test - PDF Attachment",
            tags: {},
            children_key: '',
            hasParent: false,
            isReportingKey: false,
            }
            const formData = new FormData();
            formData.append("provenanceRecord", JSON.stringify(data));

            // Attach PDF file
            const buffer = await readFile('./test/attachments/PDFTest.pdf');
            const blob = new Blob([buffer], { type: 'application/pdf' });
            formData.append('document.pdf', blob);

            const postResponse = await fetch(fullUrl, {
            method: "POST",
            body: formData,
            });

            expect(postResponse.ok).toBe(true);

        } catch (error) {
            console.error("(Create POST Test - PDF) Error creating a record: " + error); 
            throw error;
        }

        // GET record key to make sure it exists with PDF attachment
        let getResponse; 
        try {
            getResponse = await fetch(fullUrl);
            getResponse = await getResponse.json();
            let responseString = JSON.parse(JSON.stringify(getResponse[0]));

            expect(JSON.stringify(getResponse)).not.toBe('[]');
            expect(responseString.record.deviceName).toBe('Create Record Test - PDF');
            expect(responseString.record.description).toBe('An API Feature Test - PDF Attachment');
            expect(responseString.attachments.length).toBe(1);

            // Download and compare PDF attachment
            const attachmentHash = responseString.attachments[0];
            const downloadUrl = `https://gosqasbe.azurewebsites.net/api/attachment/${deviceKey}/${attachmentHash}`;
            console.log('Downloading PDF from:', downloadUrl);
            const downloadResponse = await fetch(downloadUrl);
            expect(downloadResponse.ok).toBe(true);
            const retrievedBuffer = Buffer.from(await downloadResponse.arrayBuffer());
            
            // Reading original PDF file 
            const originalBuffer = await readFile('./test/attachments/PDFTest.pdf');
            expect(Buffer.compare(originalBuffer, retrievedBuffer)).toBe(0);
            console.log('PDF attachment matches original');

        } catch(error) {
            console.error('(Create GET Test - PDF) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
            throw error;
        }
    }, 600000);

    it("Create record with large attachment", async () => {
        // Create record key
        const deviceKey = await makeEncodedDeviceKey();
        console.log("Created Device Key (large file >2MB): " + deviceKey);
        let fullUrl = `${baseUrl}${deviceKey}`
        expect(deviceKey.length).toBe(22);
        expect(validateKey(deviceKey)).toBe(true);

        // POST record key with LARGE attachment 
        try {
            const data = {
            blobType: 'deviceInitializer',
            deviceName: "Create Record Test - Large File",
            description: "An API Feature Test - Large Attachment (>2MB)",
            tags: {},
            children_key: '',
            hasParent: false,
            isReportingKey: false,
            }
            const formData = new FormData();
            formData.append("provenanceRecord", JSON.stringify(data));

            // Attach LARGE file (>2MB)
            const buffer = await readFile('./test/attachments/LargeFile.pdf');
            const blob = new Blob([buffer], { type: 'application/pdf' });
            formData.append('large.jpg', blob);

            // File size check 
            const fileSizeInMB = buffer.length / (1024 * 1024);
            console.log(`File size: ${fileSizeInMB.toFixed(2)} MB`);
            expect(fileSizeInMB).toBeGreaterThan(2); 

            const postResponse = await fetch(fullUrl, {
            method: "POST",
            body: formData,
            });

            expect(postResponse.ok).toBe(true);
            console.log('Large file upload succeeded');

        } catch (error) {
            console.error("(Create POST Test - Large File) Error creating a record: " + error); 
            throw error;
        }

        // GET record key to make sure it exists with large attachment
        let getResponse; 
        try {
            getResponse = await fetch(fullUrl);
            getResponse = await getResponse.json();
            let responseString = JSON.parse(JSON.stringify(getResponse[0]));

            expect(JSON.stringify(getResponse)).not.toBe('[]');
            expect(responseString.record.deviceName).toBe('Create Record Test - Large File');
            expect(responseString.record.description).toBe('An API Feature Test - Large Attachment (>2MB)');
            expect(responseString.attachments.length).toBe(1);

            // Download and compare large attachment
            const attachmentHash = responseString.attachments[0];
            const downloadUrl = `https://gosqasbe.azurewebsites.net/api/attachment/${deviceKey}/${attachmentHash}`;
            console.log('Downloading large file from:', downloadUrl);
            const downloadResponse = await fetch(downloadUrl);
            expect(downloadResponse.ok).toBe(true);
            const retrievedBuffer = Buffer.from(await downloadResponse.arrayBuffer());
            
            // Reading original large file 
            const originalBuffer = await readFile('./test/attachments/LargeFile.pdf');
            expect(Buffer.compare(originalBuffer, retrievedBuffer)).toBe(0);
            console.log('Large file attachment matches original');

        } catch(error) {
            console.error('(Create GET Test - Large File) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
            throw error;
        }
    }, 600000);


});