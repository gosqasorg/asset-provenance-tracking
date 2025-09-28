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
function makeHttpRequest(deviceKey: any, formData: any, overrides: any = {}) {
	return {
	  method: 'POST',
	  url: '/',
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
	const baseUrl = 'http://localhost:7071/api/provenance/'  // localhost (works)
	// const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'  // url from read tests (fails)


	// Create the most basic record
	it("record creation test", async () => {
		try {
			// Create record key
			const deviceKey = await makeEncodedDeviceKey();
			console.log("Created Device Key: " + deviceKey);

			const fullUrl = `${baseUrl}${deviceKey}`

			expect(deviceKey.length).toBe(22);
			expect(validateKey(deviceKey)).toBe(true);


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

			let req = makeHttpRequest(deviceKey, formData);

			const context = {
				invocationId: 'test-invocation-id',
				functionName: 'test-function',
				extraInputs: { get: vi.fn(), set: vi.fn() },
				extraOutputs: { get: vi.fn(), set: vi.fn() },
				log: vi.fn(), trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(),
				options: { trigger: { type: 'http', name: 'req' }, extraInputs: [], extraOutputs: [] },
			};

			const postResponse = await postProvenance(req, context);
			console.log("postProv Response: " + JSON.stringify(postResponse));
			
			expect(postResponse).toHaveProperty('jsonBody');


			// GET record to make sure it exists
			let getResponse; 
			try {
				getResponse = await fetch(fullUrl);
				getResponse = await getResponse.json();
				console.log("getProv Response: " + JSON.stringify(getResponse) + " type: " + typeof(getResponse));
			} catch(error) {
				console.error('(Create GET Test) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
				throw error;
			}

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(typeof(getResponse)).toBe('object');

		} catch (error) {
			console.error("(Create POST Test) Error creating a record: " + error); 
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
	it("smoketest", () => {
		expect(0).toBe(0);
	});

	// Placeholder
	// Everything all at once -- create a record with tags and an image?
	it("feature-complete test", () => {
		expect(0).toBe(0);
	});
	
});