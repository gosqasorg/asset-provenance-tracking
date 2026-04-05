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

describe("Group Creation v2 tests", () => {
    it("should create a group record with multiple attachments (one image, one PDF file), with multiple children", async () => {
    // const baseUrl = "https://gosqasbe.azurewebsites.net/api";
    const baseUrl = "http://localhost:7071/api";

    const payload = {
        deviceName: "group_record_with_attachments",
        description: "group record with attachents (image and pdf), and with two children",
        number_of_children: 2,
    };

    const formData = new FormData();
    formData.append("groupRecord", JSON.stringify(payload));

    const imageBuffer = await readFile("./test/attachments/a200.jpg");
    const imageBlob = new Blob([Uint8Array.from(imageBuffer)], { type: "image/jpeg" });
    formData.append("attachment", imageBlob, "a200.jpg");

    const pdfBuffer = await readFile("./test/attachments/PDFTest2.pdf");
    const pdfBlob = new Blob([Uint8Array.from(pdfBuffer)], { type: "application/pdf" });
    formData.append("attachment", pdfBlob, "PDFTest2.pdf");

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
});