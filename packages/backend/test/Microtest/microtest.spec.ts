/*
Intended for cyclically running individual tests for rapid development before
relocating developed tests into the suite. 

Code is not to be kept here. This is a whiteboard. Erase and add your own
as needed. 
*/


// Do not remove. Vitest Requirement
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Do not remove. Vitest Requirement

/* ================================================================= * 
   README: If you are reading this, you may delete what's here.
   That being said, I used what was here previously as an example.
   It was useful. What's left here was done in the hopes it may be.

   This working "development-driven testing" environment is, I find,
   massively useful for dev.

   To run it, ./cycle-microtest.sh to initiate the test loop. Once 
   the loop is active, vitest tests this directory every 5 seconds.

   To use it, detach the terminal and leave it running where it's at
   least partially in view.

   To stop it, simply hit ctrl + c. 

   Then, code away. 
   If you hit an error, you know immediately. 
   Once it's solved, you know immediately. 

   Code tends to originate here, and migrate elsewhere in two types:
   * Utilities / functions / non-test code, and
   * You get at least one test out of it for free. That test is
     set up and ready to be slotted into place. 
 * ================================================================= */


/* ------ Actual Imports -------- */



/* ================= Utility Functions Supporting The Test ======== */



/* ================== Function Under Development ================= */



/* ========================= The Test ============================ */

// Note: no need to delete the enclosing describe block
describe('MicroTestLand', () => {

let api_url = "https://gosqasbe.azurewebsites.net/api";
api_url = "http://localhost:7071/api"

  // Group Creation test with 2 child keys + send_to_all_children
  it("Group Creation - Sending Record Entry to Child Records", async () => {
    // Create new group and children keys
    const keysCreation = [fetch(`${api_url}/getNewDeviceKey`),...Array.from({length: 2}, () => fetch(`${api_url}/getNewDeviceKey`))];
    const keyResponses = await Promise.all(keysCreation);
    const keys = await Promise.all(keyResponses.map(res => res.text()));

    const groupKey = keys[0];
    const childKeys = keys.splice(1);

    // Create group parent key
    const groupFormData = new FormData();
    groupFormData.append("provenanceRecord", JSON.stringify({
      blobType: "deviceInitializer",
      deviceName: "Group Creation - Sending to Children",
      description: "Group record for Sending to Child Records test",
      tags: [],
      children_key: childKeys,
      hasParent: false,
      inPublicKey: false
    }));

    let childFormData;
    let childrenPromises;

    // Create child keys with tags
    childrenPromises = childKeys.map((key, i) => {
      childFormData = new FormData();
      childFormData.append("provenanceRecord", JSON.stringify({
        blobType: "deviceInitializer",
        deviceName: `child_${i + 1}`,
        description: "child for send to child records test",
        tags: [],
        children_key: "",
        hasParent: true,
        isPublicKey: false
      }));
      return fetch(`${api_url}/provenance/${key}`, {
        method: "POST",
        body: childFormData,
      });
    });
    
    // WAIT for children to be created
    const childResponses = await Promise.all(childrenPromises);
    childResponses.forEach(response => {
      expect(response.ok).toBe(true);
    });

    // CREATED THE GROUP RECORD 
    const groupResponse = await fetch(`${api_url}/provenance/${groupKey}`, {
      method: "POST",
      body: groupFormData,
    });
    
    expect(groupResponse.ok).toBe(true);

    // Add an entry to the group and send it to all children
    const payload = {
        description: "Record to send to all children",
        tags: ["Why hello, child"],
        send_to_all_children: true,
        //children_key: '',  /// NOTE: THIS WAS ADDED
    };
    const formData = new FormData();
    formData.append("provenanceRecord", JSON.stringify(payload));

    const response = await fetch(`${api_url}/addEntry/${groupKey}`, {
        method: "POST",
        body: formData,
    });
    //console.dir(response)
    console.log(formData)
    console.log(`${api_url}/addEntry/${groupKey}`)
    expect(response.status).toBe(200);

    // Verify tags are present in all child keys
    const verificationPromises = [fetch(`${api_url}/provenance/${groupKey}`), ...childKeys.map(key => fetch(`${api_url}/provenance/${key}`))];
    const verificationResponses = await Promise.all(verificationPromises);
    const verificationData = await Promise.all(verificationResponses.map(response => response.json()));
    const [retrievedGroup, ...retrievedChildren] = verificationData;

    retrievedChildren.forEach((child, i) => {
      expect(child[0].record.tags).toContain("Why hello, child");
    });
  }, 20000); 

/*
  // Need makeEncodedDeviceKey
  // Update and send record entry to all children
  it("Update and send to all children", async () => {
      // Create a group with one child
      const groupKey = await makeEncodedDeviceKey();
      const childKey = await makeEncodedDeviceKey();
      const grandchildKey = await makeEncodedDeviceKey();
      console.log("Update to test sent_to_all_children: " + groupKey);
  
      const groupFormData = new FormData();
      groupFormData.append("provenanceRecord", JSON.stringify({
        blobType: "deviceInitializer",
        deviceName: "grandparent_smoketest",
        description: "grandparent group for testing sent_to_all_children",
        tags: [],
        children_key: [childKey],
        hasParent: false,
        isPublicKey: false
      }));
  
      const childFormData = new FormData();
      childFormData.append("provenanceRecord", JSON.stringify({
        blobType: "deviceInitializer",
        deviceName: "parent_smoketest",
        description: "parent group for testing sent_to_all_children",
        tags: [],
        children_key: [grandchildKey],
        hasParent: true,
        isPublicKey: false
      }));
  
      const grandchildFormData = new FormData();
      grandchildFormData.append("provenanceRecord", JSON.stringify({
        blobType: "deviceInitializer",
        deviceName: "child_smoketest",
        description: "child record for testing sent_to_all_children",
        tags: [],
        children_key: "",
        hasParent: true,
        isPublicKey: false
      }));
  
      const [groupResponse, childResponse, grandchildResponse] = await Promise.all([
        fetch(`${baseUrl}${groupKey}`, {
          method: "POST",
          body: groupFormData,
        }),
        fetch(`${baseUrl}${childKey}`, {
          method: "POST",
          body: childFormData,
        }),
        fetch(`${baseUrl}${grandchildKey}`, {
          method: "POST",
          body: grandchildFormData,
        })
      ]);
  
      expect(groupResponse.ok).toBe(true);
      expect(childResponse.ok).toBe(true);
      expect(grandchildResponse.ok).toBe(true);
  
      // Add a new record to the parent group
      const updateData = {
        blobType: 'deviceRecord',
        description: "Record to be sent to all children",
        tags: ['sent_to_all_children', 'update_test'],
      };
  
      const updateFormData = new FormData();
      updateFormData.append("provenanceRecord", JSON.stringify(updateData));
  
      const updateResponse = await fetch(`${baseUrl}${groupKey}`, {
        method: "POST",
        body: updateFormData,
      });

      // Call the notifyChildren function to send record to all the children and grandchildren
      const sendToChildrenResponse = await fetch(`${baseUrl}sendToChildren/${groupKey}`, {
        method: "POST",
        body: updateFormData,
      });
      
      expect(sendToChildrenResponse.ok).toBe(true);
  
      // Test to see if the record was successfully sent to all children
      // To succeed, the record should exist in both group and child/grandchild record history
      const getGroupResponse = await fetch(`${baseUrl}${groupKey}`);
      const groupData = await getGroupResponse.json();
      const groupRecord = JSON.parse(JSON.stringify(groupData[0]));
  
      expect(groupRecord.record.tags).toStrictEqual(['sent_to_all_children', 'update_test'])
      expect(groupRecord.record.description).toBe("Record to be sent to all children");
  
      const getChildResponse = await fetch(`${baseUrl}${childKey}`);
      const childData = await getChildResponse.json();
      const childRecord = JSON.parse(JSON.stringify(childData[0]));
  
      expect(childRecord.record.tags).toStrictEqual(['sent_to_all_children', 'update_test'])
      expect(childRecord.record.description).toBe("Record to be sent to all children");

      const getGrandchildResponse = await fetch(`${baseUrl}${grandchildKey}`);
      const grandchildData = await getGrandchildResponse.json();
      const grandchildRecord = JSON.parse(JSON.stringify(grandchildData[0]));

      expect(grandchildRecord.record.tags).toStrictEqual(['sent_to_all_children', 'update_test'])
      expect(grandchildRecord.record.description).toBe("Record to be sent to all children");
  }, 10000);
*/


  it("Should send entry to the child record", async() => {
        // --- Note! If this test is updated, also update the example code in 
        // --- GDT-OpenAPI-Spec.yaml > createGroup > x-codeSamples
        // --- All that's needed is here up to expect(response.status)...

    // Create the group/children
        const payload = {
            deviceName: "Send To Children Basic Test",
            description: "Test for send_to_all_children feature",
            tags: [],
            number_of_children: 1
        };

        let formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(payload));

        let response = await fetch(`${api_url}/createGroup`, {
            method: "POST",
            body: formData,
        });

        console.log("APIv2 Test: Send to all children: Attempting to check response")
        console.log('The url and formdata: ', api_url, formData)
        console.log(`The response:`)
        console.dir(response)
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.groupUrl).toContain("/record/");
        console.log("(Basic Send to Children Test) Group Url:", data);

        const groupKey = data.groupUrl.split('/').pop();
        const groupResponse = await fetch(`${api_url}/provenance/${groupKey}`);
        let groupProvenance = await groupResponse.json();
        let groupRecord = groupProvenance[0].record;

        let childKeys: string[] = groupRecord.children_key;

        // Add an entry to the group and send it to all children
        const newPayload = {
            description: "Sending record entry to all children and confirming it sent...",
            tags: ["Harry", "Ron"],
            send_to_all_children: true,
            //children_key: ''   /// NOTE: THIS WAS ADDED
        };

        formData = new FormData();
        formData.append("provenanceRecord", JSON.stringify(newPayload));

        response = await fetch(`${api_url}/addEntry/${groupKey}`, {
            method: "POST",
            body: formData,
        });
        console.log("APIv2 Test: Send to all children: Attempting to check response")
        console.log('The url and formdata: ', api_url, formData)
        console.log(`The response:`)
        console.dir(JSON.stringify(response))
        expect(response.status).toBe(200);

        // Look at the most recent record entry on the group and confirm the entry was added successfully
        const groupData = await fetch(`${api_url}/provenance/${groupKey}`);
        groupProvenance = await groupData.json();
        groupRecord = groupProvenance[0].record;
        console.log("(Send to Children Test) Group Record:", groupRecord);

        expect(groupRecord.description).toBe(newPayload.description);
        expect(groupRecord.tags).toEqual(["Harry", "Ron", "sent_to_all_children"]);

        // Look at the most recent record entry on the child and confirm it has the tags from the parent
        const childData = await fetch(`${api_url}/provenance/${childKeys[0]}`);
        const childProvenance = await childData.json();
        const childRecord = childProvenance[0].record;
        console.log("(Send to Children Test) Child Record:", childRecord);

        expect(childRecord.description).toBe(newPayload.description);
        expect(childRecord.tags).toEqual(["Harry", "Ron", "sent_to_all_children"]);
  }, 60000);

  it("Should send entry to children but not to the public key", async() => {
      // Create the group/children
      const payload = {
          deviceName: "Send To Children But Not Public Key",
          description: "Testing that records sent from the group are not sent to the public key",
          tags: [],
          number_of_children: 2,
          hasPublicKey: true,
      };

      let formData = new FormData();
      formData.append("provenanceRecord", JSON.stringify(payload));

      let response = await fetch(`${api_url}/createGroup`, {
          method: "POST",
          body: formData,
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.groupUrl).toContain("/record/");
      console.log("(Send to Children Not Public Key Test) Group Url:", data);

      const groupKey = data.groupUrl.split('/').pop();
      const groupResponse = await fetch(`${api_url}/provenance/${groupKey}`);
      const groupProvenance = await groupResponse.json();
      const groupRecord = groupProvenance[0].record;

      const publicKey: string = groupRecord.publicKey;
      let childKeys: string[] = groupRecord.children_key;
      childKeys.splice(childKeys.indexOf(publicKey), 1);

      // Add an entry to the group and send it to all children
      const newPayload = {
          description: "Sending record entry to all children and confirming it's not sent to the public key...",
          tags: ["Harry", "Ron", "Hermione"],
          send_to_all_children: true,
          children_key: ''  /// Note: this was added
      };

      formData = new FormData();
      formData.append("provenanceRecord", JSON.stringify(newPayload));

      response = await fetch(`${api_url}/addEntry/${groupKey}`, {
          method: "POST",
          body: formData,
      });
      expect(response.status).toBe(200);

      // Look at the most recent record entry on the children and confirm they have the tags from the parent
      for (const child of childKeys) {
          const childData = await fetch(`${api_url}/provenance/${child}`);
          const childProvenance = await childData.json();
          const childRecord = childProvenance[0].record;

          expect(childRecord.description).toBe(newPayload.description);
          expect(childRecord.tags).toEqual(["Harry", "Ron", "Hermione", "sent_to_all_children"]);
      }

      // Look at the public key and confirm it did not receive the record entry
      const publicProvenance = await fetch(`${api_url}/provenance/${publicKey}`);
      const publicData = await publicProvenance.json();
      const publicRecord = publicData[0].record;

      expect(publicRecord.description).not.toBe(newPayload.description);
      expect(publicRecord.tags).not.toEqual(["Harry", "Ron", "Hermione", "sent_to_all_children"]);
  }, 60000);

  it("Should create new entry and not send to all children", async() => {
      // Create the group/children
      const payload = {
          deviceName: "Not Sent to Children",
          description: "Testing that send to all children does not occur when the boolean is false",
          tags: ["Dumbledore"],
          number_of_children: 2,
      };

      let formData = new FormData();
      formData.append("provenanceRecord", JSON.stringify(payload));

      let response = await fetch(`${api_url}/createGroup`, {
          method: "POST",
          body: formData,
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.groupUrl).toContain("/record/");
      console.log("(Don't Send to Children Test) Group Url:", data);

      const groupKey = data.groupUrl.split('/').pop();
      const groupResponse = await fetch(`${api_url}/provenance/${groupKey}`);
      let groupProvenance = await groupResponse.json();
      let groupRecord = groupProvenance[0].record;

      const childKeys: string[] = groupRecord.children_key;

      // Add an entry to the group and DON'T send it to all children
      const entryPayload = {
          description: "Record should NOT be sent to all children",
          tags: ["Snape"]
      };

      formData = new FormData();
      formData.append("provenanceRecord", JSON.stringify(entryPayload));

      response = await fetch(`${api_url}/addEntry/${groupKey}`, {
          method: "POST",
          body: formData,
      });
      expect(response.status).toBe(200);

      // Look at the most recent record entry on the group and confirm it doesn't have the sent_to_all_children tag
      const groupData = await fetch(`${api_url}/provenance/${groupKey}`);
      groupProvenance = await groupData.json();
      groupRecord = groupProvenance[0].record;

      expect(groupRecord.description).toBe(entryPayload.description);
      expect(groupRecord.tags).toEqual(["Snape"]);
      expect(groupRecord.tags).not.toContain(["sent_to_all_children"]);

      // Look at the most recent record entry on the children and confirm they don't have the tags from the parent
      for (const child of childKeys) {
          const childData = await fetch(`${api_url}/provenance/${child}`);
          const childProvenance = await childData.json();
          const childRecord = childProvenance[0].record;

          expect(childRecord.description).toBe(payload.description);  // description from parent creation
          expect(childRecord.tags).toEqual(["Dumbledore"]);
          expect(groupRecord.tags).not.toContain(["sent_to_all_children"]);
          expect(childProvenance.length).toBe(1);
      }
  }, 60000);

  it("Should use default 'Sent from Group' description when entry has no description", async() => {
      // Create the group/children
      const payload = {
          deviceName: "Sent Without Description Test",
          description: "Testing that record entries sent to children without descriptions have the default description",
          tags: [],
          number_of_children: 1,
      };

      let formData = new FormData();
      formData.append("provenanceRecord", JSON.stringify(payload));

      let response = await fetch(`${api_url}/createGroup`, {
          method: "POST",
          body: formData,
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.groupUrl).toContain("/record/");
      console.log("(Send to Children Default Description Test) Group Url:", data);

      const groupKey = data.groupUrl.split('/').pop();
      const groupResponse = await fetch(`${api_url}/provenance/${groupKey}`);
      const groupProvenance = await groupResponse.json();
      const groupRecord = groupProvenance[0].record;

      const childKeys: string[] = groupRecord.children_key;

      // Add an entry without a description to the group and send it to all children
      const entryPayload = {
          tags: ["Draco"],
          send_to_all_children: true
      };

      formData = new FormData();
      formData.append("provenanceRecord", JSON.stringify(entryPayload));

      response = await fetch(`${api_url}/addEntry/${groupKey}`, {
          method: "POST",
          body: formData,
      });
      expect(response.status).toBe(200);

      // Look at the most recent record entry on the child and confirm they have the default description
      for (const child of childKeys) {
          const childData = await fetch(`${api_url}/provenance/${child}`);
          const childProvenance = await childData.json();
          const childRecord = childProvenance[0].record;

          expect(childRecord.description).toBe("Record Entry sent from Group");
          expect(childRecord.tags).toEqual(["Draco", "sent_to_all_children"]);
      }
  }, 60000);


/* Needs readFile and the file it reads. 
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
*/
// closing brace of describe block
});
