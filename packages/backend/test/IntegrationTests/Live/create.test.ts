import { describe, vi, it, expect } from "vitest";
import { makeEncodedDeviceKey, validateKey } from '../../../src/utils/keyFuncs';
import { postProvenance, getNewDeviceKey } from '../../../src/functions/httpTrigger';

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

describe("Group Creation Tests", () => {

	// Placeholder
	// The most basic possible test
	it("smoketest", () => {
		expect(0).toBe(0);
	});

	// Placeholder
	// Most basic + one feature
	it("smoketest", () => {
		expect(0).toBe(0);
	});

	// Placeholder
	// Everything all at once
	it("feature-complete test", () => {
		expect(0).toBe(0);
	});
	
});

// TODO: Add record creation tests here
function makeHttpRequest(deviceKey: any, formData: any, url: any, overrides: any = {}) {
	return {
	  method: 'POST',
	  url: url,
	  headers: new Headers(),
	  query: {},
	  params: { deviceKey: deviceKey },  // for makeEncodedDeviceKey
	//   params: { deviceKey },  // for getNewDeviceKey
	  user: undefined,
	  body: undefined,
	  bodyUsed: false,
	  arrayBuffer: async () => new ArrayBuffer(0),
	  text: async () => '',
	  json: async () => ({}),
	  formData: async () => (formData),
	  ...overrides,
	};
  }

describe("Record Creation Tests", () => {
	// TODO: works on localhost (need to run azurite and set BACKEND_URL to localhost 7071), but still fails to GET on gdtprod
	// let baseUrl = 'http://localhost:7071/api/provenance/'  // localhost (works)

	// NOTE: I created a record on the site, and this is what the url of the POST request was:
	// https://gdtprodbackend.azurewebsites.net/api/provenance/TH1p2kEuayaS2M8Rox6VFg
	let baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'  // TODO: url from read tests (fails)


	// Create the most basic record
	it("most basic smoketest", async () => {
		// Create record key
		const deviceKey = await makeEncodedDeviceKey();
		console.log("Created Device Key: " + deviceKey);

		let fullUrl = `${baseUrl}${deviceKey}`

		expect(deviceKey.length).toBe(22);
		expect(validateKey(deviceKey)).toBe(true);

		// POST a new record
		try {
			// POST record to backend
			const data = {
				blobType: 'deviceInitializer',
				deviceName: "Create Record Test",
				description: "An API smoketest for the Create Record feature",
				tags: {},
				children_key: '',
				hasParent: false,
				isReportingKey: false,
			}
			const formData = new FormData();
    		formData.append("provenanceRecord", JSON.stringify(data));

			// TODO: USE FETCH TO POST!!
			const postResponse = await fetch(fullUrl, {
				method: "POST",
				body: formData,
			});
			console.log("response: ", postResponse);

			// let req = makeHttpRequest(deviceKey, formData, fullUrl);

			// const context = {
			// 	invocationId: 'test-invocation-id',
			// 	functionName: 'test-function',
			// 	extraInputs: { get: vi.fn(), set: vi.fn() },
			// 	extraOutputs: { get: vi.fn(), set: vi.fn() },
			// 	log: vi.fn(), trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(),
			// 	options: { trigger: { type: 'http', name: 'req' }, extraInputs: [], extraOutputs: [] },
			// };

			// // Call postProv
			// const postResponse = await postProvenance(req, context);
			// console.log("postProv Response: " + JSON.stringify(postResponse));
			
			// expect(postResponse).toHaveProperty('jsonBody');
		} catch (error) {
			console.error("(Create POST Test) Error creating a record: " + error); 
			throw error;
		}

		// GET the record to make sure it exists
		let getResponse; 
		try {
			// TODO ERROR: failed to fetch https://gdtprodbackend.azurewebsites.net/api/provenance/{deviceKey}
			// Because it is never getting POSTed to that url
			getResponse = await fetch(fullUrl);
			getResponse = await getResponse.json();
			console.log("getProv Response: " + JSON.stringify(getResponse) + " type: " + typeof(getResponse));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(typeof(getResponse)).toBe('object');
			// TODO: add more detailed tests! (check if title, descr, etc. match what we inputed them as)
		} catch(error) {
			console.error('(Create GET Test) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
			throw error;
		}
	}, 100000);  // TODO: last value is timeout value (remove/shorten if it is not needed anymore)



	// Placeholder
	// The most basic possible test (create a record) -- working on that now, see above
	it("smoketest", () => {
		expect(0).toBe(0);
	});

	// Placeholder
	// Most basic + one feature -- create a record with tags
	it("second smoketest", () => {
		expect(0).toBe(0);
	});

	// Placeholder
	// Everything all at once -- create a record with tags and an image?
	it("feature-complete test", () => {
		expect(0).toBe(0);
	});
	
});