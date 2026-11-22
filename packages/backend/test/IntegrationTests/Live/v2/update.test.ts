import { describe, it, expect } from "vitest";
import { readFile } from "fs/promises";

const baseUrl = process.env['api_url']
const api_url = baseUrl;

describe("Update v2 Tests", () => {
  it("Updates records with new entries", async () => {
    const groupRecord = {
            deviceName: "Update v2 Tests",
            description: "Tests updates to records",
            tags: ["integration", "tests"],
            number_of_children: 2,
            children_name: ["Update child 1", "Update child 2"]
        }
        const testCases = [
            {

            },
            {
                description: "record entry with description",
            },
            {
                tags: ["entry", "with", "only", "tags"]
            },
            {
                attachments: [['./test/attachments/a200.jpg', 'record-entry-with-attachment.jpg']]
            },
            {
                description: "record entry with description, tags, and attachments",
                tags: ["test", "complete"],
                attachments: [['./test/attachments/b200.jpg', 'b200.jpg'], ['./test/attachments/c200.jpg', 'c200.jpg']]
            },
            {
                description: "record entry that gets sent to all children",
                tags: ["test", "demo"],
                send_to_all_children: true,
                attachments: [['./test/attachments/a200.jpg', 'a200.jpg']]
            }
        ]

        let groupResponse;
        const groupFormData = new FormData();
        groupFormData.append("provenanceRecord", JSON.stringify(groupRecord));
        let theUrl = `${api_url}/createGroup`
        console.log(theUrl)
        groupResponse = await fetch(theUrl, {
            method: "POST",
            body: groupFormData
        })
        console.log(groupResponse)
        console.log(JSON.stringify(groupResponse))
        expect(groupResponse.ok).toBe(true);
        const url = (await groupResponse.json()).groupUrl;
        console.log("Update tests group url:", url)

        const parentKey = url.substring(url.lastIndexOf('/') + 1);
        const initialProv = await (await fetch(`${api_url}/provenance/${parentKey}`)).json();
        const parentRecord = initialProv[0].record
        let childKeys = parentRecord.children_key

        for (let i = 0; i < testCases.length; i++) {
            let currCase = testCases[i];
            let response;

            const caseFormData = new FormData();

            if(!currCase.attachments) {
                caseFormData.append("provenanceRecord", JSON.stringify(currCase));
            } else {
                const { attachments: attachInfo, ...currCaseWithoutAttachInfo } = currCase;
                caseFormData.append("provenanceRecord", JSON.stringify(currCaseWithoutAttachInfo));

                for (let j = 0; j < attachInfo.length; j++) {
                    const buffer = await readFile(attachInfo[j][0]);
                    const blob = new Blob([buffer], { type: 'image/jpg' });
                    caseFormData.append(attachInfo[j][1], blob, attachInfo[j][1]);
                    
                }
            };

            response = await fetch(`${api_url}/addEntry/${parentKey}`, {
                method: "POST",
                body: caseFormData
            });
            expect(response.ok).toBe(true);

            let parentProvs = await (await fetch(`${api_url}/provenance/${parentKey}`)).json();
            let currRecord = parentProvs[0].record

            if (currCase.description) {
                expect(currRecord.description).toBe(currCase.description)
            }
            if (i != (testCases.length - 1) && currCase.tags) {  // Don't check "send to children" case here (since it adds a new tag)
                expect(currRecord.tags).toStrictEqual(currCase.tags)
            }
            if (currCase.attachments) {
                expect(parentProvs[0].attachments.length).toBe(currCase.attachments.length)
            }
        }

        for (let i = 0; i < parentRecord.number_of_children; i ++) {
            let childProv = await (await fetch(`${api_url}/provenance/${childKeys[i]}`)).json();
            expect(childProv[0].record.description).toBe(testCases[(testCases.length - 1)].description);
            expect(childProv[0].record.tags).toStrictEqual(["test", "demo", "sent_to_all_children"]);
        }
  }, 60000);

  // More tests
})