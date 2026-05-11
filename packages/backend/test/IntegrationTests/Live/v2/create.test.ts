import { describe, it, expect } from "vitest";


describe ("v2 Group Creation Tests", () => {

    it("should should verify that tags are applied correctly", async() => {

        const baseUrl = "https://gosqasbe.azurewebsites.net/api";
        const apiUrl = `${baseUrl}/v2/createGroup`;

        const payload = {
            deviceName: "ItHasATag",
            description: "Testing tags in record creation",
            number_of_children: 3,
            tags: ["Harry", "Ron"]

        };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)

        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.groupUrl).toContain("/record/");

        const groupKey = data.groupUrl.split('/').pop();
        const verifyResponse = await fetch(`${baseUrl}/provenance/${groupKey}`);
        const actualRecord = await verifyResponse.json();
        expect(actualRecord.deviceName).toBe(payload.deviceName);
        expect(actualRecord.tags).toEqual(["Harry", "Ron"]);
// need to put in try and catch block!
// need to double run and double check if the splicing works or should i use diff method?
// find run and then check if it passes the tests 
// create test it is meant to fail like the wrong devicename etc or the run tags


    });



});