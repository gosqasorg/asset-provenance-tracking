import { describe, it, expect } from "vitest";


describe ("v2 Group Creation Tests", () => {

    it("should verify that tags are applied correctly", async() => {

        const baseUrl = "http://localhost:7071/api";
        const apiUrl = `${baseUrl}/createGroup`;

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
        //temporary to debug 
        console.log("Response Status:", response.status);
        
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.groupUrl).toContain("/record/");

        const groupKey = data.groupUrl.split('/').pop();
        const verifyResponse = await fetch(`${baseUrl}/provenance/${groupKey}`);
        const responseData = await verifyResponse.json();
        const actualRecord = responseData[0];
        console.log(actualRecord);
        expect(actualRecord.deviceName).toBe(payload.deviceName);
        expect(actualRecord.tags).toEqual(["Harry", "Ron"]);
        


    }, 3000);



});