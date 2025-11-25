import { describe, it, expect } from "vitest";
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

let timeout = 30000;  // Milliseconds; integration testing can be laggycd

let accountName; if (isEmpty(accountName = process.env["AZURE_STORAGE_ACCOUNT_NAME"])) {
    throw new Error('Env vars not set')
}
let accountKey; if (isEmpty(accountKey = process.env["AZURE_STORAGE_ACCOUNT_KEY"])) {
    throw new Error('Env vars not set')
} 

const baseUrl = accountName === "devstoreaccount1"
    ? `http://127.0.0.1:10000/devstoreaccount1`
    : `https://${accountName}.blob.core.windows.net`;


let baseTestName: string;
describe(baseTestName = "Tests for getVersion and setVersion", () => {

	let thisTestName: string;

	it(thisTestName = "API test for getVersion", async () => {

        // ---- Section 0/2: Setup --------------- // 
        const fullUrl = baseUrl + '/api/getVersion'

        // ---- Section 1/2: Invoking the API ---- //

        let response
        let responseCode;
        let dataBody; 
        try {
            response = await fetch(fullUrl).then(function(response){
                responseCode = response.status
                return response.text();
            }).then(function(data){
                dataBody = data;
            })
            //console.log(response.body)
        } catch(error) {   
            const testName = baseTestName + thisTestName;
            const errorMessage = 'Failed to fetch (get) url: '
            console.error(testName + errorMessage + fullUrl) 
            throw error;
        }


        // ---- Section 2/2: Tests -------------- // 

        expect(dataBody).toBe("44444")
        expect(responseCode).toBe(200)

    // ----------------------------------------------------------------------
    

    }, timeout);
thisTestName: string;
 22
 23     it(thisTestName = "API test for getVersion", async () => {
 24
 25         // ---- Section 0/2: Setup --------------- //
 26         const fullUrl = baseUrl + '/api/getVersion'
 27
 28         // ---- Section 1/2: Invoking the API ---- //
 29
 30         let response
 31         let responseCode;
 32         let dataBody;
 33         try {
 34             response = await fetch(fullUrl).then(function(response){
 35                 responseCode = response.status
 36                 return response.text();
 37             }).then(function(data){
 38                 dataBody = data;
 39             })
 40             //console.log(response.body)
 41         } catch(error) {
 42             const testName = baseTestName + thisTestName;
 43             const errorMessage = 'Failed to fetch (get) url: '
 44             console.error(testName + errorMessage + fullUrl)
 45             throw error;
 46         }
 47
 48
 49         // ---- Section 2/2: Tests -------------- //
 50
 51         expect(dataBody).toBe("44444")
 52         expect(responseCode).toBe(200)
 53
 54     // ----------------------------------------------------------------------
 55
 56
 57     }, timeout);
	it(baseTestName = "API test for setVersion", async () => {

		// ---- Section 0/2: Setup --------------- //

        const fullUrl = "http://localhost:7071/api/getVersion" 

        let response
        let responseCode;

        // originalVersion = getVersion()
        let originalVersion; 
        try {
            response = await fetch(fullUrl).then(function(response){
                responseCode = response.status
                return response.text();
            }).then(function(data){
                originalVersion = data;
            })
        } catch(error) {   
            const testName = baseTestName + thisTestName;
            const errorMessage = 'Failed to fetch (get) url: '
            console.error(testName + errorMessage + fullUrl) 
            throw error;
        }
        
        // testVersion
        let testVersion = "44444"

        // ---- Section 1/2: Invoking the API ---- //

        // setVersion(bogusVersion) 
        const bogusVersion = 44444
        const testUrl = "http://localhost:7071/api/setVersion?version=" + `${bogusVersion}`
        let checkTestVersion 
        try {
            response = await fetch(testUrl).then(function(response){
                return response.text();
            }).then(function(data){
            })
        } catch(error){
            const testName = baseTestName + thisTestName;
            const errorMessage = 'Failed to fetch (get) testUrl: '
            console.error(testName + errorMessage + fullUrl)
            throw error;
        }

        // ---- Section 2/2: Tests ---- //

        // const checkTestVersion = getVersion()
        try {
            response = await fetch(fullUrl).then(function(response){  
                return response.text();
            }).then(function(data){
                checkTestVersion = data,
                console.log(data);
            })
        } catch(error){
            const testName = baseTestName + thisTestName;
            const errorMessage = 'Failed to fetch (get) testUrl: '
            console.error(testName + errorMessage + fullUrl)
            throw error;
        }

        expect(checkTestVersion).toBe(testVersion)

	}, timeout);

})
