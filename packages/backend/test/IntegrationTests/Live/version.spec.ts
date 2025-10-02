import { describe, it, expect } from "vitest";
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

let accountName:string = process.env["AZURE_STORAGE_ACCOUNT_NAME"]!
    
let accountKey:string = process.env["AZURE_STORAGE_ACCOUNT_KEY"]!

let timeout = 30000;  // Milliseconds; integration testing can be laggycd

let baseTestName: string;
describe(baseTestName = "Tests for getVersion and setVersion", () => {

	let thisTestName: string;

	it(thisTestName = "API test for getVersion", async () => {

        // ---- Section 0/2: Setup --------------- // 
        const fullUrl = "http://192.168.1.9:7071/api/getVersion" 

        // ---- Section 1/2: Invoking the API ---- //

        let response
        let response_code;
        let data_body; 
        try {
            response = await fetch(fullUrl).then(function(response){
                response_code = response.status
                return response.text();
            }).then(function(data){
                data_body = data,
                console.log(data);
            })
            //console.log(response.body)
        } catch(error) {   
            const testName = baseTestName + thisTestName;
            const errorMessage = 'Failed to fetch (get) url: '
            console.error(testName + errorMessage + fullUrl) 
            throw error;
        }


        // ---- Section 2/2: Tests -------------- // 

        expect(data_body).toBe("12345")
        expect(response_code).toBe(200)

    // ----------------------------------------------------------------------
    

    }, timeout);

	it(baseTestName = "API test for setVersion", async () => {
		// ---- Section 0/2: Setup --------------- //

        // grab the current server version
        const fullUrl = "http://192.168.1.9:7071/api/getVersion"

        let response
        let version 
        try {
            response = await fetch(fullUrl).then(function(response){
                return response.text();
            }).then(function(data){
                version = data
            })
        } catch(error){
            const testName = baseTestName + thisTestName;
            const errorMessage = "Failed to fetch (get) url: "
            console.error(testName + errorMessage + fullUrl)
            throw error;
        }
        console.log(version)
        // ---- Section 1/2: Invoking the API ---- //


	}, timeout);

})