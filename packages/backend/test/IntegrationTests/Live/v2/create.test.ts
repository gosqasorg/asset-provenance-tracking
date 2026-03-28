import { describe, it, expect } from "vitest";

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
		expect(childKeys.length).toBe(groupPayload.number_of_children + 1);

		const reportingKey = childKeys.at(-1) as string;
		expect(groupRecord.reportingKey).toBe(reportingKey);

		// Verify reporting key
		const reportingKeyRes = await fetch(`${baseUrl}/provenance/${reportingKey}`)
		expect(reportingKeyRes.ok).toBe(true);
		const reportigKeyAttributes = await reportingKeyRes.json();
		expect(reportigKeyAttributes.length).toBeGreaterThan(0);
		const reportingKeyRecord = reportigKeyAttributes[0].record;
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


});