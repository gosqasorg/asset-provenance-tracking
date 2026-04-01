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
        const customTitles = ["a1", "b2"];
        const testCases = [
            [
                "1st Test",
                "1 custom record title",
                1,
                ["a1"]
            ],
            [
                "2nd Test",
                "3 custom record titles",
                3,
                ["a1", "b2", "c3"]
            ],
            [
                "3rd Test",
                "3 children, 2 custom record titles",
                3,
                ["a1", "b2"]
            ],
            [
                "4th Test",
                "3 children, no custom record titles",
                3
            ],
            [
                "5th Test",
                "3 children, empty children_name array",
                3,
                []
            ]
            
        ]

        // for (let i = 0; i < groupRecords.length; i++) {

        // };

        const response = await fetch(`${baseUrl}/createGroup`, {
            method: "POST",
            body: JSON.stringify({
                deviceName: "Group Title",
                description: "Group Description",
                number_of_children: 3,
                children_name: customTitles
            })
        });

        let url = (await response.json()).groupUrl;
        let key = url.substring(url.lastIndexOf('/') + 1);
        let prov = await (await fetch(`${baseUrl}/provenance/${key}`)).json();

        // TODO: delete below
        console.log("int test:", url);
        console.log("resp:", response);
        console.log(response.ok);
        console.log(response.body);
        console.log(response.status);
        console.log(response.headers);
        // console.log(await response.text())
        console.log(url);
        console.log(key);

        console.log(prov[0].record);
        console.log(prov[0].record.children_key[0])
        console.log(await (await fetch(`${baseUrl}/provenance/${prov[0].record.children_key[0]}`)).json())

	});

	// More tests
})