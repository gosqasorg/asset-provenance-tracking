import { describe, it, expect } from "vitest";

// A test of the tests themselves
describe("Tests-Selftest-Smoketest", () => {
	it("Can the tests run?", () => {
		try { 
			console.log('Can we run the api integration tests smoketest?')
			expect(0).toBe(0);
			console.log('Yes.')
		} catch(error) {
			console.error('No.')
			throw error;
		}
	});
});
