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
            {
                deviceName: "0th Test",
                description: "1 custom record title",
                number_of_children: 1,
                children_name: ["a1"]
            },
            {
                deviceName: "1st Test",
                description: "3 custom record titles",
                number_of_children: 3,
                children_name: ["a1", "b2", "c3"]
            },
            {
                deviceName: "2nd Test",
                description: "3 children, 1 custom record title, 2 records without custom title",
                number_of_children: 3,
                children_name: ["a1"]
            },
            {
                deviceName: "3rd Test",
                description: "3 children, empty children_name array",
                number_of_children: 3,
                children_name: []
            },
            {
                deviceName: "4th Test",
                description: "4 children, no children_name array",
                number_of_children: 4
            },
            {
                deviceName: "",
                description: "5th Test: completely empty parent deviceName string, no children_name array",
                number_of_children: 5
            },
            {
                deviceName: " ",
                description: "6th Test: single space as parent deviceName string, no children_name array",
                number_of_children: 6
            },
            {
                deviceName: "7th Test",
                description: "non-array children_name value, will fail Zod validation",
                number_of_children: 3,
                children_name: "a"
            },
            {
                deviceName: "8th Test",
                description: "children_name array with unexpected number, will fail Zod validation",
                number_of_children: 3,
                children_name: ["a1", 9, "c3"]
            }
        ]
        
        for (let i = 0; i < testCases.length; i++) {
            let currCase = testCases[i];
            let response;

            // creates group records as found in above in testCases
            response = await fetch(`${baseUrl}/createGroup`, {
                method: "POST",
                body: JSON.stringify(currCase)
            });

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
                        if (currCase.deviceName === "") {
                            expect(childTitle).toBe("")
                        } else {
                            expect(childTitle).toBe(`${currCase.deviceName} #${j + 1}`)
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
	}, 60000);

	// More tests
});