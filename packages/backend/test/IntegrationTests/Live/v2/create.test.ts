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
    // Tests group child custom titles
	it("Custom Record Titles", async () => {
		const baseUrl = "http://localhost:7071/api";
        const groupParentRecords = []
        const groupedChildKeys = []
        const groupedChildTitles = []

        // Test cases are structured as follows, note the children_name key can be left out, an empty array used as a value, or less than number_of_children:
        // [ deviceName,
        // description,
        // number_of_children,
        // children_name ]
        const testCases = [
            [
                "0th Test",
                "1 custom record title",
                1,
                ["a1"]
            ],
            [
                "1st Test",
                "3 custom record titles",
                3,
                ["a1", "b2", "c3"]
            ],
            [
                "2nd Test",
                "3 children, 1 custom record title, 2 records without custom title",
                3,
                ["a1"]
            ],
            [
                "3rd Test",
                "3 children, empty children_name array",
                3,
                []
            ],
            [
                "4th Test",
                "4 children, no children_name array",
                4
            ],
            [
                "",
                "5th Test: completely empty parent deviceName string, no children_name array",
                5
            ],
            [
                " ",
                "6th Test: single space as parent deviceName string, no children_name array",
                6
            ],
            [
                "7th Test",
                "non-array children_name value, will fail Zod validation",
                3,
                "a"
            ],
            [
                "8th Test",
                "children_name array with unexpected number, will fail Zod validation",
                3,
                ["a1", 9, "c3"]
            ]
        ]
        
        for (let i = 0; i < testCases.length; i++) {
            let currCase = testCases[i];
            let response;

            // Creates group records based on whether or not test case contains children_name field
            if (currCase.length === 4) {
                response = await fetch(`${baseUrl}/createGroup`, {
                    method: "POST",
                    body: JSON.stringify({
                        deviceName: currCase[0],
                        description: currCase[1],
                        number_of_children: currCase[2],
                        children_name: currCase[3]
                    })
                });
            } else {
                response = await fetch(`${baseUrl}/createGroup`, {
                    method: "POST",
                    body: JSON.stringify({
                        deviceName: currCase[0],
                        description: currCase[1],
                        number_of_children: currCase[2]
                    })
                });
            }

            // last two test cases, 7 & 8, are meant to fail during record creation
            if (i < testCases.length - 2){
                // checks if fetch() response was sucessful (status in 200 - 299)
                expect(response.ok).toBe(true);
                
                let url = (await response.json()).groupUrl;
                console.log(`Custom title test case #${i}: ${url}`)

                // retrieves and stores parent records and tests that parent deviceName matches test cases
                let parentKey = url.substring(url.lastIndexOf('/') + 1);
                let prov = await (await fetch(`${baseUrl}/provenance/${parentKey}`)).json();
                let parentRecord = prov[0].record
                expect(parentRecord.deviceName).toBe(currCase[0])
                groupParentRecords.push(parentRecord);

                // stores child keys by group
                let childKeys = parentRecord.children_key
                groupedChildKeys.push(childKeys);
                
                // retrieves and stores custom child titles by group
                let tempGroup = []
                for (let j = 0; j < childKeys.length; j ++) {
                    let childProv = await (await fetch(`${baseUrl}/provenance/${childKeys[j]}`)).json();
                    let childTitle = childProv[0].record.deviceName
                    tempGroup.push(childTitle)

                    // tests that retrieved custom child titles match test cases based on existence, length, and contents of children_name key and parent deviceName
                    if (currCase.length === 4) {
                        if (j <= currCase[3].length - 1) {
                            expect(childTitle).toBe(currCase[3][j])
                        } else {
                            expect(childTitle).toBe("")
                        }
                    } else {
                        if (currCase[0] === "") {
                            expect(childTitle).toBe("")
                        } else {
                            expect(childTitle).toBe(`${currCase[0]} #${j + 1}`)
                        }
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
	});

	// More tests
})