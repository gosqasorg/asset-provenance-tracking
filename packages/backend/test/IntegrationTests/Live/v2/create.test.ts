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
        const groupParentRecords = []
        const groupedChildKeys = []
        const groupedChildTitles = []

        // Test cases are built as follows, note the children_name key can be left out or an empty array used as a value:
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
            let testCase;

            // Creates group records based on whether or not test case contains children_name field"
            if (testCases[i].length === 4) {
                testCase = await fetch(`${baseUrl}/createGroup`, {
                    method: "POST",
                    body: JSON.stringify({
                        deviceName: testCases[i][0],
                        description: testCases[i][1],
                        number_of_children: testCases[i][2],
                        children_name: testCases[i][3]
                    })
                });
            } else {
                testCase = await fetch(`${baseUrl}/createGroup`, {
                    method: "POST",
                    body: JSON.stringify({
                        deviceName: testCases[i][0],
                        description: testCases[i][1],
                        number_of_children: testCases[i][2]
                    })
                });
            }

            // Checks if fetch() response was sucessful (status in 200 - 299), then prepares to pull children
            // test case 7 & 8 are meant to fail
            if (i < 7){
                expect(testCase.ok).toBe(true);
                
                let url = (await testCase.json()).groupUrl;
                console.log(`Custom title test case #${i}: ${url}`)

                let parentKey = url.substring(url.lastIndexOf('/') + 1);
                let prov = await (await fetch(`${baseUrl}/provenance/${parentKey}`)).json();
                let parentRecord = prov[0].record
                groupParentRecords.push(parentRecord);

                let childKeys = parentRecord.children_key
                groupedChildKeys.push(childKeys);
                
                let tempGroup = []
                for (let j = 0; j < childKeys.length; j ++) {
                    let childProv = await (await fetch(`${baseUrl}/provenance/${childKeys[j]}`)).json();
                    tempGroup.push(childProv[0].record.deviceName)
                }
                groupedChildTitles.push(tempGroup)
            } else { 
                expect(testCase.ok).toBe(false);
            }
        };

        // const response = await fetch(`${baseUrl}/createGroup`, {
        //     method: "POST",
        //     body: JSON.stringify({
        //         deviceName: "Group Title",
        //         description: "Group Description",
        //         number_of_children: 3,
        //         children_name: customTitles
        //     })
        // });

        // let url = (await response.json()).groupUrl;
        // let key = url.substring(url.lastIndexOf('/') + 1);
        // let prov = await (await fetch(`${baseUrl}/provenance/${key}`)).json();

        // // TODO: delete below
        // console.log("int test:", url);
        // console.log("resp:", response);
        // console.log(response.ok);
        // console.log(response.body);
        // console.log(response.status);
        // console.log(response.headers);
        // // console.log(await response.text())
        // console.log(url);
        // console.log(key);

        // console.log(prov[0].record);
        // console.log(prov[0].record.children_key[0])
        // console.log(await (await fetch(`${baseUrl}/provenance/${prov[0].record.children_key[0]}`)).json())
        console.log("groupParentRecords: ", groupParentRecords)
        console.log("groupedChildKeys: ", groupedChildKeys)
        console.log("groupedChildTitles: ", groupedChildTitles)
	});

	// More tests
})