import { describe, it, expect } from "vitest";

let timeout = 30000;  // Milliseconds; integration testing can be laggy

let baseTestName: string;
describe(baseTestName = "Tests for getVersion and setVersion", () => {

	let thisTestName: string;

	it(thisTestName = "API test for getVersion", async () => {


        // ---- Section 0/2: Setup --------------- // 
        const baseUrl = 'https://red-stone-00f5d251e.5.azurestaticapps.net/'
        const suffix = 'getVersion'
        const fullUrl = `${baseUrl}${suffix}`

        // ---- Section 1/2: Invoking the API ---- //

        let response; 
        try {
            response = await fetch(fullUrl);
            response = await response.json(); 
        } catch(error) {  
            const testName = baseTestName + thisTestName;
            const errorMessage = 'Failed to fetch (get) url: '
            console.error(testName + errorMessage + fullUrl) 
            throw error;
        }


        // ---- Section 2/2: Tests -------------- // 

        expect(response.status).toBe(200)

        // ----------------------------------------------------------------------
        // ---- Section 1/2: Invoking the API ---- //

        /*const theRecord = 'Ra1rnStUK7CctNehGVWtDa'  // Hardcoded
        const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'
        const fullUrl = `${baseUrl}${theRecord}`

        
        
        // ---- Section 2/2: Tests ---- // 

        // Check overall type 
        expect(Array.isArray(response)).toBe(true);

        // Elements: Check number of keys
        const blob_element = response[0]; 
        expect(Object.keys(blob_element).length).toBe(4)  // Known to be 4

        // Elements: Check identity of keys
        const keysToCheckOff = new Set(['record', 'attachments', 'deviceID', 'timestamp'])
        Object.keys(blob_element).forEach(key => {
            if(!keysToCheckOff.has(key)) { throw new Error(
                `Unexpected key: ${key}`
            )}

            keysToCheckOff.delete(key)
        })
        expect(keysToCheckOff.size).toBe(0)
*/
    }, timeout);

	it(baseTestName = "API test for setVersion", () => {
		// structured similar to above
	}, timeout);

})