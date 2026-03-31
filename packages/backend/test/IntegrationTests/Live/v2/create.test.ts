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

describe("Group Creation v2 tests", () => {
	// it("Brief description that this tests foo", () => {
	// 	var val = do_thing();
	// 	expect(val).toBe(0);
	// });

	// it("Brief description that this tests bar", () => {
	// 	// structured similar to above
	// });

	it("Custom Record Titles", async () => {
		const baseUrl = "http://localhost:7071/api";
        const customTitles = ["a1", "b2", "c3"];

        const response = await fetch(`${baseUrl}/createGroup`, {
            method: "POST",
            body: JSON.stringify({
                deviceName: "Group Title",
                description: "Group Description",
                number_of_children: 5,
                children_name: customTitles
            }) 
        });

        console.log("test:", await response.json())
	});

	// More tests
})