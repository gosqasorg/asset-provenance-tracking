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
        // "https://gosqasbe.azurewebsites.net/api"
        // "http://localhost:7071/api"
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
                description: "1 child, 3 custom record titles",
                number_of_children: 1,
                children_name: ["a1", "b2", "c3"]
            },
            {
                deviceName: "8th Test",
                description: "no number_of_children key, 3 custom record titles",
                children_name: ["a1", "b2", "c3"]
            },
            {
                deviceName: "9th Test",
                description: "non-array children_name value, will fail Zod validation",
                number_of_children: 3,
                children_name: "a"
            },
            {
                deviceName: "10th Test",
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

            // last two test cases, 9 & 10, are meant to fail during record creation
            if (i < testCases.length - 2){
                // checks if fetch() response was sucessful (status in 200 - 299)
                expect(response.ok).toBe(true);
                
                let url = (await response.json()).groupUrl;
                console.log(`Custom title test case #${i}: ${url}`)

                // retrieves and stores parent records and tests that parent deviceName matches test cases
                let parentKey = url.substring(url.lastIndexOf('/') + 1);
                let y = await fetch(`${baseUrl}/provenance/${parentKey}`)
                console.log("y: ", y)
                let prov = await y.json();
                console.log("prov: ", prov)
                let parentRecord = prov[0].record
                console.log("parentRecord: ", parentRecord)
                expect(parentRecord.deviceName).toBe(currCase.deviceName)
                groupParentRecords.push(parentRecord);

                // stores child keys by group
                let childKeys = parentRecord.children_key
                console.log("childKeys: ", childKeys)
                groupedChildKeys.push(childKeys);
                
                // retrieves and stores custom child titles by group
                let tempGroup = []
                console.log("currCase: ", currCase)
                console.log(currCase.number_of_children)
                console.log(0 < currCase.number_of_children)
                for (let j = 0; j < currCase.number_of_children; j ++) {
                    let x = await fetch(`${baseUrl}/provenance/${childKeys[j]}`)
                    console.log("x: ", x)
                    let childProv = await x.json();
                    let childTitle = childProv[0].record.deviceName
                    console.log(childProv, childTitle)
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
                // console.log(currCase) 
                expect(response.ok).toBe(false);
            }
        };
        // console.log("groupParentRecords: ", groupParentRecords)
        // console.log("groupedChildKeys: ", groupedChildKeys)
        // console.log("groupedChildTitles: ", groupedChildTitles)
	}, 60000);

	// More tests
});