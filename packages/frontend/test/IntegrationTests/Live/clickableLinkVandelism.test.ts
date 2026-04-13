// import { describe, it, expect } from "vitest";
// import { makeEncodedDeviceKey, validateKey } from "../../../../backend/src/utils/keyFuncs";
// import { readFile } from 'fs/promises';

// const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/';
// let timeout = 30000;


// // Grab unique device key from the backend.
// async function getDeviceKey(): Promise<string> {
//     const response = await fetch('https://gdtprodbackend.azurewebsites.net/api/getNewDeviceKey');
//     return (await response.text()).trim();
// }

// // func to create record 
// // Create a record with a given description, and return the device key used in record 
// async function createRecord(description: string): Promise<string> {
//     const deviceKey = await makeEncodedDeviceKey();
//     console.log(deviceKey);
//     let fullUrl = `${baseUrl}${deviceKey}`;

//     expect(deviceKey.length).toBe(22);
//     expect(validateKey(deviceKey)).toBe(true);
    
//     const data = {
//         blobType: 'deviceInitializer',
//         deviceName: "Vandilism Test Record",
//         description: description,
//         tags: {},
//         children_key: '',
//         hasParent: false,
//         isReportingKey: false,        
//     }
    
//     const formData = new FormData();
//     formData.append("provenanceRecord", JSON.stringify(data));

//     const postResponse = await fetch(fullUrl, {
//         method: "POST",
//         body: formData,
//     });

//     const responseText = await postResponse.text();
//     console.log("POST status:", postResponse.status);
//     console.log("POST body:", responseText);
//     console.log("POST URL:", fullUrl);

//     expect(postResponse.ok).toBe(true);

//     return deviceKey;
// }

// // Fetch record using its device key and return the description
// async function fetchDescription (deviceKey: string): Promise<string> {
//     let fullUrl = `${baseUrl}${deviceKey}`;
//     let getResponse = await fetch(fullUrl); 
//     let data = await getResponse.json();

//     let responseString = JSON.parse(JSON.stringify(data[data.length - 1]));
//     return responseString.record.description;
// }



// describe('clickableLink: Vandalism Integration Tests', () => {

//     // Baic Check
//     it("smoketest", () => {
// 		expect(0).toBe(0);  
// 	}, timeout);

//     // TODO: Legitamate usages 

//     it('Random Test', async() => {
// 		// Create record key
// 		const deviceKey = await makeEncodedDeviceKey();
// 		console.log("Created Device Key: " + deviceKey);
// 		let fullUrl = `${baseUrl}${deviceKey}`
// 		expect(deviceKey.length).toBe(22);
// 		expect(validateKey(deviceKey)).toBe(true);

// 		// POST record key
// 		try {
// 			const data = {
// 				blobType: 'deviceInitializer',
// 				deviceName: "Create Record Test",
// 				description: "An API Feature Test-Attachments",
// 				tags: {},
// 				children_key: '',
// 				hasParent: false,
// 				isReportingKey: false,
// 			}
// 			const formData = new FormData();
//     		formData.append("provenanceRecord", JSON.stringify(data));

//             const buffer = await readFile('./test/attachments/a200.jpg');
// 			const blob = new Blob([buffer], { type: 'image/jpeg' });
// 			formData.append('kirby.png', blob);

// 			const postResponse = await fetch(fullUrl, {
// 				method: "POST",
// 				body: formData,
// 			});

// 			expect(postResponse.ok).toBe(true);

// 		} catch (error) {
// 			console.error("(Create POST Test) Error creating a record: " + error); 
// 			throw error;
// 		}
//     })

//     // // Should not break safe urls
//     // it('Valid url', async () => {
//     //     const description = 'Check out https://gosqas.org it is amazing';

//     //     try {
//     //         const deviceKey = await createRecord(description);
//     //         const fetchedDescription = await fetchDescription(deviceKey);
//     //         const html = clickableLink(fetchedDescription) as string;

//     //         // url should return whole
//     //         expect(fetchedDescription).toContain('https://gosqas.org');

//     //         // should have a safe and complete anchor tag
//     //         expect(html).toContain('<a ');
//     //         expect(html).toContain('href="https://gosqas.org"');
//     //         expect(html).toContain('target="_blank"');
//     //         expect(html).toContain('rel="noopener noreferrer"');

//     //     } catch (error) {
//     //         console.error('(Safe URL Test) Error: ', error);
//     //         throw error;
//     //     }
//     // }, timeout);

//     // HTML tags as text to display literally


//     // TODO: Script Injection <script> tag

//     // TODO: HTML Tag Injections - img, svg, style

//     // TODO: Alert Injection

// })