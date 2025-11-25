import { describe, it, expect } from "vitest";
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

const baseUrl = "https://gosqasbe.azurewebsites.net/api";

let timeout = 30000;  // Milliseconds; integration testing can be laggycd

let baseTestName: string;
describe(baseTestName = "Tests for getVersion and setVersion", () => {

    let thisTestName: string;
    /*
    it(thisTestName = "API test for getVersion", async () => {

        // ---- Section 0/2: Setup --------------- // 
        const fullUrl = baseUrl + '/getVersion'

        // ---- Section 1/2: Invoking the API ---- //


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
    */

    it(baseTestName = "API test for setVersion", async () => {
        /*
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
        */



        // ---- Section 1/2: Invoking the API ---- //

        // setVersion(bogusVersion) 
        let response
        let testVersion = "44444"
        const bogusVersion = 44444
        const testUrl = baseUrl + '/setVersion?version=' + `${bogusVersion}`
        try {
            response = await fetch(testUrl) 
            /*.then(function(response){
                let text = response.text();
                console.log('vvv')
                console.log(text)
                console.log('^^^')
                return text
            }).then(function(data){
                console.log('FOOOOOBAARRRRRR')
                console.log(data)
                console.log('FOOOOOBAARRRRRR')
            })
            */
            console.log('vvvv')
            console.log(response)
            console.log(response.text)
            let text = response.text
            console.log(text)
            text = await text
            console.log(text)
            console.log('^^^^')
        } catch(error){
            const testName = baseTestName + thisTestName;
            const errorMessage = 'Failed to fetch (get) testUrl: '
            console.error(testName + errorMessage + testUrl)
            throw error;
        }

        // ---- Section 2/2: Tests ---- //

        // const checkTestVersion = getVersion()

        let checkTestVersion;
        const fullGetUrl = baseUrl + '/getVersion'
        try {
            response = await fetch(fullGetUrl).then(function(response){  
                let responseText = response.text();
                console.log('vvv')                
                console.log(responseText)
                console.log('vvv')
            }).then(function(data){
                checkTestVersion = data,
                                console.log('vvv')
                console.log(data);
                                console.log('vvv')
            })
        } catch(error){
            const testName = baseTestName + thisTestName;
            const errorMessage = 'Failed to fetch (get) testUrl: '
            console.error(testName + errorMessage + fullGetUrl)
            throw error;
        }

        expect(checkTestVersion).toBe(testVersion)

    }, timeout);

})