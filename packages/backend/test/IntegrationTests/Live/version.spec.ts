import { describe, it, expect } from "vitest";

let timeout = 30000;  // Milliseconds; integration testing can be laggy

let baseName;
describe(baseName = "Group of tests", () => {

	let testName;

	it(testName = "Brief description that this tests foo", () => {
		var val = 0;
		expect(val).toBe(0);
    }, timeout);


	it(testName = "Brief description that this tests bar", () => {
		// structured similar to above
	}, timeout);

	it(testName = "Another test", () => {
		// More test contents
	}, timeout);

})