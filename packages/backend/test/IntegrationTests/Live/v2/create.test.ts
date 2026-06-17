import { describe, it, expect } from "vitest";
import { readFile } from "fs/promises";

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
    // Test reporting key functionality
    it("should create a group record with a reporting key", async () => {
		const baseUrl = "https://gosqasbe.azurewebsites.net/api";
		
		const groupPayload = {
			deviceName: "group_record_with_reporting_key",
			title: "group_record_with_reporting_key",
			description: "group record with a reporting key integration test",
			number_of_children: 1,
			hasReportingKey: true,
			tags: [],
		};

		const groupResponse = await fetch(`${baseUrl}/createGroup`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(groupPayload),
		});

		expect(groupResponse.ok).toBe(true);
		expect(groupResponse.status).toBe(200);

		const body = await groupResponse.json();
		expect(body).toHaveProperty("groupUrl"); // make sure that groupUrl property exists

		// Get the group record key generated
		const groupKeyStr = body.groupUrl;
		const parts = groupKeyStr.split("/");
		const groupKey = parts.pop();
		
		// Fetch group record key response
		const groupProvenanceRes = await fetch(`${baseUrl}/provenance/${groupKey}`);
		expect(groupProvenanceRes.ok).toBe(true);
		const groupAttributes = await groupProvenanceRes.json();
		expect(groupAttributes.length).toBeGreaterThan(0);
		
		// Verify group record key has the same parameters as the original payload
		const groupRecord = groupAttributes[0].record;
		expect(groupRecord.deviceName).toBe(groupPayload.title);
		expect(groupRecord.description).toBe(groupPayload.description);

		const childKeys: string[] = groupRecord.children_key;
		expect(childKeys.length - 1).toBe(groupPayload.number_of_children);

		// Verify reporting key
		const reportingKey = groupRecord.reportingKey as string;
		const reportingKeyRes = await fetch(`${baseUrl}/provenance/${reportingKey}`)
		expect(reportingKeyRes.ok).toBe(true);
		const reportingKeyAttributes = await reportingKeyRes.json();
		expect(reportingKeyAttributes.length).toBeGreaterThan(0);
		const reportingKeyRecord = reportingKeyAttributes[0].record;
		expect(reportingKeyRecord.isReportingKey).toBe(true);
		expect(reportingKeyRecord.tags).toContain("reportingkey");
    }, 6000);

	it("should create a group record with tags", async () => {
		const baseUrl = "https://gosqasbe.azurewebsites.net/api";
		
		const groupPayload = {
			deviceName: "group_record_with_tags",
			title: "group_record_with_tags",
			description: "group record with tags integration test",
			number_of_children: 1,
			hasReportingKey: false,
			tags: ["integration_test", "record_tags"],
		};

		const groupResponse = await fetch(`${baseUrl}/createGroup`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(groupPayload),
		});

		expect(groupResponse.ok).toBe(true);
		expect(groupResponse.status).toBe(200);

		const body = await groupResponse.json();
		expect(body).toHaveProperty("groupUrl"); // make sure that groupUrl property exists

		// Get the group record key generated
		const groupKeyStr = body.groupUrl;
		const parts = groupKeyStr.split("/");
		const groupKey = parts.pop();
		
		// Fetch group record key response
		const groupProvenanceRes = await fetch(`${baseUrl}/provenance/${groupKey}`);
		expect(groupProvenanceRes.ok).toBe(true);
		const groupAttributes = await groupProvenanceRes.json();
		expect(groupAttributes.length).toBeGreaterThan(0);
		
		// Verify group record key has the same parameters as the original payload
		const groupRecord = groupAttributes[0].record;
		expect(groupRecord.deviceName).toBe(groupPayload.title);
		expect(groupRecord.description).toBe(groupPayload.description);

		// Verify tags data
		expect(groupRecord.tags).toContain("integration_test");
		expect(groupRecord.tags).toContain("record_tags");
		expect(groupRecord.tags.length).toBe(2);

		const childKeys: string[] = groupRecord.children_key;
		expect(childKeys.length).toBe(groupPayload.number_of_children);
    }, 6000);


describe("Group Creation v2 tests", () => {

    it("should create a group record with multiple attachments (one image, one PDF file), with multiple children", async () => {
    // const baseUrl = "http://localhost:7071/api"
    const baseUrl = "https://gosqasbe.azurewebsites.net/api";

    const payload = {
        deviceName: "group_record_with_attachments",
        description: "group record with attachents (image and pdf), and with two children",
        number_of_children: 2,
    };

    const formData = new FormData();
    formData.append("provenanceRecord", JSON.stringify(payload));

    const imageBuffer = await readFile("./test/attachments/b200.jpg");
    const imageBlob = new Blob([Uint8Array.from(imageBuffer)], { type: "image/jpeg" });
    formData.append("attachment", imageBlob, "b200.jpg");

    const pdfBuffer = await readFile("./test/attachments/PDFTest.pdf");
    const pdfBlob = new Blob([Uint8Array.from(pdfBuffer)], { type: "application/pdf" });
    formData.append("attachment", pdfBlob, "PDFTest.pdf");

    const response = await fetch(`${baseUrl}/createGroup`, {
        method: "POST",
        body: formData,
    });

    expect(response.ok).toBe(true);

    const responseJson = await response.json();
    expect(responseJson).toBeDefined();
    expect(typeof responseJson.groupUrl).toBe("string");
    expect(responseJson.groupUrl.length).toBeGreaterThan(0);

    const groupKey = responseJson.groupUrl.split("/").pop();
    expect(groupKey).toBeDefined();
    expect(groupKey.length).toBeGreaterThan(0);

    // Verify group record has multiple attachments and multiple chlidren 
    const groupProvResponse = await fetch(`${baseUrl}/provenance/${groupKey}`);
    expect(groupProvResponse.ok).toBe(true);

    const groupProv = await groupProvResponse.json();
    expect(groupProv.length).toBeGreaterThan(0);

    const groupEntry = groupProv[0];
    expect(groupEntry).toBeDefined();
    expect(groupEntry.record).toBeDefined();

    // Verify group record attributes, and number of children record
    expect(groupEntry.record.deviceName).toBe(payload.deviceName);
    expect(groupEntry.record.description).toBe(payload.description);
    expect(groupEntry.record.children_key.length).toBe(payload.number_of_children);

    // Verify group attachments
    expect(groupEntry.attachments).toBeDefined();
    expect(groupEntry.attachments.length).toBe(2);

    const attachmentHashes = groupEntry.attachments;
    const imageDownloadResponse = await fetch(`${baseUrl}/attachment/${groupKey}/${attachmentHashes[0]}`);
    expect(imageDownloadResponse.ok).toBe(true);
    const downloadedImageBuffer = Buffer.from(await imageDownloadResponse.arrayBuffer());
    expect(downloadedImageBuffer.equals(imageBuffer)).toBe(true);

    const pdfDownloadResponse = await fetch(`${baseUrl}/attachment/${groupKey}/${attachmentHashes[1]}`);
    expect(pdfDownloadResponse.ok).toBe(true);
    const downloadedPdfBuffer = Buffer.from(await pdfDownloadResponse.arrayBuffer());
    expect(downloadedPdfBuffer.equals(pdfBuffer)).toBe(true);

    // Verify the number of children records
    const childKeys: string[] = groupEntry.record.children_key;
    for (const childKey of childKeys) {
        const childProvResponse = await fetch(`${baseUrl}/provenance/${childKey}`);
        expect(childProvResponse.ok).toBe(true);
        const childProv = await childProvResponse.json();
        expect(childProv.length).toBeGreaterThan(0);
        const childEntry = childProv[0];
        expect(childEntry).toBeDefined();
        expect(childEntry.record.hasParent).toBe(true);
    }
  }, 60000);

    // Tests group child custom titles
	it("Custom Record Titles", async () => {
        // const baseUrl = "http://localhost:7071/api"
		const baseUrl = "https://gosqasbe.azurewebsites.net/api";
        const groupParentRecords = []
        const groupedChildKeys = []
        const groupedChildTitles = []

        // Test cases are structured as follows, note the children_name key can be left out, an empty array used as a value, or less than number_of_children:
        // [ deviceName,
        // description,
        // number_of_children,
        // children_name ]
        const testCases = [
            {
                deviceName: "0th Test",
                description: "no number_of_children or children_name key"
            },
            {
                deviceName: "1st Test",
                description: "0 children, 3 custom record titles",
                number_of_children: 0,
                children_name: ["a1", "b2", "c3"]
            },
            {
                deviceName: "2nd Test",
                description: "0 children, no children_name key",
                number_of_children: 0
            },
            {
                deviceName: "3rd Test",
                description: "-2 number_of_children, 3 custom record titles",
                number_of_children: -2,
                children_name: ["a1", "b2", "c3"]
            },
            {
                deviceName: "4th Test",
                description: "1 custom record title",
                number_of_children: 1,
                children_name: ["a1"]
            },
            {
                deviceName: "5th Test",
                description: "3 custom record titles",
                number_of_children: 3,
                children_name: ["a1", "b2", "c3"]
            },
            {
                deviceName: "6th Test",
                description: "3 children, 1 custom record title, 2 records without custom title",
                number_of_children: 3,
                children_name: ["a1"]
            },
            {
                deviceName: "7th Test",
                description: "3 children, empty children_name array",
                number_of_children: 3,
                children_name: []
            },
            {
                deviceName: "8th Test",
                description: "4 children, no children_name array",
                number_of_children: 4
            },
            {
                deviceName: "",
                description: "9th Test: completely empty parent deviceName string, no children_name array",
                number_of_children: 5
            },
            {
                deviceName: " ",
                description: "10th Test: single space as parent deviceName string, no children_name array",
                number_of_children: 6
            },
            {
                deviceName: "11th Test",
                description: "1 child, 3 custom record titles",
                number_of_children: 1,
                children_name: ["a1", "b2", "c3"]
            },
            {
                deviceName: "12th Test",
                description: "no number_of_children key, 3 custom record titles",
                children_name: ["a1", "b2", "c3"]
            },
            {
                deviceName: "13th Test",
                description: "non-array children_name value, will fail Zod validation",
                number_of_children: 3,
                children_name: "a"
            },
            {
                deviceName: "14th Test",
                description: "children_name array with unexpected number, will fail Zod validation",
                number_of_children: 3,
                children_name: ["a1", 9, "c3"]
            }
        ]
        
        for (let i = 0; i < testCases.length; i++) {
            let currCase = testCases[i];
            let response;

            // creates group records as found in above in testCases
            const caseFormData = new FormData();
            caseFormData.append("provenanceRecord", JSON.stringify(currCase));
            response = await fetch(`${baseUrl}/createGroup`, {
                method: "POST",
                body: caseFormData
            });

            // last two test cases, 13 & 14, are meant to fail during record creation
            if (i < testCases.length - 2){
                // checks if fetch() response was sucessful (status in 200 - 299)
                expect(response.ok).toBe(true);
                
                let url = (await response.json()).groupUrl;
                console.log(`Custom title test case #${i}: ${url}`)

                // retrieves and stores parent records and tests that parent deviceName matches test cases
                let parentKey = url.substring(url.lastIndexOf('/') + 1);
                let prov = await (await fetch(`${baseUrl}/provenance/${parentKey}`)).json();
                let parentRecord = prov[0].record
                // console.log(parentRecord)
                expect(parentRecord.deviceName).toBe(currCase.deviceName)
                groupParentRecords.push(parentRecord);

                // stores child keys by group
                let childKeys = parentRecord.children_key
                groupedChildKeys.push(childKeys);
                
                // retrieves and stores custom child titles by group
                let tempGroup = []
                for (let j = 0; j < currCase.number_of_children; j ++) {
                    let childProv = await (await fetch(`${baseUrl}/provenance/${childKeys[j]}`)).json();
                    let childTitle = childProv[0].record.deviceName
                    tempGroup.push(childTitle)

                    // tests that retrieved custom child titles match test cases based on existence, length, and contents of children_name key and parent deviceName
                    if (currCase.children_name) {
                        if (j <= currCase.children_name.length - 1) {
                            expect(childTitle).toBe(currCase.children_name[j])
                        } else {
                            expect(childTitle).toBe("")
                        }
                    } else {
                        expect(childTitle).toBe(`${currCase.deviceName} #${j + 1}`)
                    };
                }
                groupedChildTitles.push(tempGroup)
            } else {
                expect(response.ok).toBe(false);
            }
        };
        // console.log("groupParentRecords: ", groupParentRecords)
        // console.log("groupedChildKeys: ", groupedChildKeys)
        // console.log("groupedChildTitles: ", groupedChildTitles)
	}, 60000);

	// More tests

});