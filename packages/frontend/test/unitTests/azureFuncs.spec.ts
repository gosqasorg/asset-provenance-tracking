import { describe, expect, it } from 'vitest';
import { cacheRequest, emptyCache, offlineTestFetch, getProvenance } from '~/services/azureFuncs';
import { makeEncodedDeviceKey } from '~/utils/keyFuncs';
import * as z from 'zod';

async function createRequest(key: string, name: string, description: string): Promise<[string, FormData]> {
	const baseUrl = useRuntimeConfig().public.baseUrl;
	const formUrl = baseUrl + '/provenance/' + key;
	const record = {
		blobType: 'deviceInitializer',
		deviceName: name,
		description: description,
		tags: [],
		children_key: '',
		hasParent: false,
		isReportingKey: false
	};

	const formData = new FormData();
	formData.append("provenanceRecord", JSON.stringify(record));
	return [formUrl, formData]
}

describe('Tests to see if user is online and offline', () => {
	it('Test to see if user is online', async () => {
		let result = await offlineTestFetch();
		expect(result).toBe(true);
	});

	it('Test to see if user is offline', async () => {
		let result = await offlineTestFetch('https://www.fakeurl.com');
		expect(result).toBe(false);
	});
});

describe('Tests to see if requests can be cached', () => {
	it('Test to see if returned data types are correct', async () => {
		const key = await makeEncodedDeviceKey();
		let [formUrl, formData] = await createRequest(key, "Stored Record", "Test record stored in localStorage then created from emptyCache()")

		localStorage.setItem('cache_counter', "0") // need to reset counter in case an earlier test fails
		cacheRequest(formUrl, formData);
		let requestFromCache = JSON.parse(localStorage.getItem('gosqas_offline_cache_1'));

		// Confirm that the datatypes are the same as they started
		const returnedFormUrl = requestFromCache[0][1];
		const returnedFormData = JSON.parse(requestFromCache[1][1]);
		expect(typeof returnedFormUrl).toEqual(typeof formUrl);
		expect(returnedFormUrl).toEqual(formUrl);
		expect(JSON.stringify(returnedFormData)).toStrictEqual(formData.get('provenanceRecord'));

		// Convert returned request back to FormData (stored in localStorage as string)
		const formData2 = new FormData();
		formData2.append('provenanceRecord', JSON.stringify(returnedFormData));
		expect(formData2).toStrictEqual(formData);

		// Validate that the formData has the correct format
		const ValidFormData = z.object({
			blobType: z.string(),
			deviceName: z.string().optional(),
			description: z.string(),
			tags: z.array(z.string()),
			children_key: z.union([z.string(), z.array(z.string())]),
			hasParent: z.boolean().optional(),
			isReportingKey: z.boolean().optional()
		});
		ValidFormData.parse(returnedFormData);

		// Remove item from cache and reset naming counter
		localStorage.removeItem('gosqas_offline_cache_1')
		localStorage.setItem('cache_counter', '0');
	});

	it('Test to see if we can store multiple requests', async () => {
		const key1 = await makeEncodedDeviceKey();
		const key2 = await makeEncodedDeviceKey();
		let [formUrl1, formData1] = await createRequest(key1, "name", "description")
		let [formUrl2, formData2] = await createRequest(key2, "name2", "slightly longer description")

		localStorage.setItem('cache_counter', "0")
		cacheRequest(formUrl1, formData1);
		cacheRequest(formUrl2, formData2);

		let requestFromCache = JSON.parse(localStorage.getItem('gosqas_offline_cache_1'));
		const returnedFormUrl = requestFromCache[0][1];
		const returnedFormData = JSON.parse(requestFromCache[1][1]);
		expect(returnedFormUrl).toEqual(formUrl1);
		expect(JSON.stringify(returnedFormData)).toStrictEqual(formData1.get('provenanceRecord'));

		let requestFromCache2 = JSON.parse(localStorage.getItem('gosqas_offline_cache_2'));
		const returnedFormUrl2 = requestFromCache2[0][1];
		const returnedFormData2 = JSON.parse(requestFromCache2[1][1]);
		expect(returnedFormUrl2).toEqual(formUrl2);
		expect(JSON.stringify(returnedFormData2)).toStrictEqual(formData2.get('provenanceRecord'));

		// Check that the correct record was stored at each request
		expect(returnedFormData.deviceName).toEqual('name');
		expect(returnedFormData2.deviceName).toEqual('name2');
		expect(returnedFormData.description).toEqual('description');
		expect(returnedFormData2.description).toEqual('slightly longer description');

		// Remove item from cache and reset naming counter
		localStorage.removeItem('gosqas_offline_cache_1')
		localStorage.removeItem('gosqas_offline_cache_2')
		localStorage.setItem('cache_counter', '0');
	});
});

describe('Tests to see if we can remove from the cache', () => {
	it('Create and remove a request', async () => {
		const key = await makeEncodedDeviceKey();
		let [formUrl, formData] = await createRequest(key, "Stored Record", "Test record stored in localStorage then created from emptyCache()")

		localStorage.setItem('cache_counter', "0")
		cacheRequest(formUrl, formData);
		expect(localStorage.getItem('cache_counter')).toEqual("1")

		// Empty the cache and confirm it posted the new record
		let statusCode = await emptyCache(true);
		expect(statusCode).toEqual(200);

		// Make sure the record was removed from the cache and the counter = 0
		expect(localStorage.getItem('cache_counter')).toEqual("0")
		expect(localStorage.getItem('gosqas_offline_cache_1')).toEqual(null)

		const provenance = await getProvenance(key);
		expect(provenance).not.toEqual([])
		expect(provenance[0].record.deviceName).toEqual("Stored Record")
		expect(provenance[0].record.description).toEqual("Test record stored in localStorage then created from emptyCache()")
	});

	it("Add and remove two requests", async () => {
		const key1 = await makeEncodedDeviceKey();
		const key2 = await makeEncodedDeviceKey();
		let [formUrl1, formData1] = await createRequest(key1, "first stored record", "this is a test")
		let [formUrl2, formData2] = await createRequest(key2, "second stored record", "this is the same test")

		localStorage.setItem('cache_counter', "0")
		cacheRequest(formUrl1, formData1);
		cacheRequest(formUrl2, formData2);

		expect(localStorage.getItem('cache_counter')).toEqual("2")

		// Empty cache and confirm both records were posted
		let statusCode = await emptyCache(true);
		expect(statusCode).toEqual(200);

		expect(localStorage.getItem('cache_counter')).toEqual("0")
		expect(localStorage.getItem('gosqas_offline_cache_1')).toEqual(null)
		expect(localStorage.getItem('gosqas_offline_cache_2')).toEqual(null)

		const provenance1 = await getProvenance(key1);
		expect(provenance1).not.toEqual([])
		expect(provenance1[0].record.deviceName).toEqual("first stored record")
		expect(provenance1[0].record.description).toEqual("this is a test")

		const provenance2 = await getProvenance(key2);
		expect(provenance2).not.toEqual([])
		expect(provenance2[0].record.deviceName).toEqual("second stored record")
		expect(provenance2[0].record.description).toEqual("this is the same test")
	});

	it("Try to emptyCache when nothing is cached", async () => {
		// Should just return when cache_counter = 0
		localStorage.setItem('cache_counter', "0")
		expect(localStorage.getItem('cache_counter')).toEqual("0")
		let statusCode = await emptyCache();
		expect(statusCode).toEqual(200);

		// Same thing should happen when cache_counter = null
		localStorage.removeItem('cache_counter')
		expect(localStorage.getItem('cache_counter')).toEqual(null)
		statusCode = await emptyCache();
		expect(statusCode).toEqual(200);
	});

	it("Make sure record isn't removed from localStorage when post fails", async () => {
		const key = await makeEncodedDeviceKey();
		let [formUrl, formData] = await createRequest(key, "Failed Record", "A record that will fail to post")

		localStorage.setItem('cache_counter', "0")
		cacheRequest(formUrl, formData);
		expect(localStorage.getItem('cache_counter')).toEqual("1")

		// Empty the cache using the non-test version (so it will fail to post)
		let statusCode = await emptyCache();
		expect(statusCode).toEqual(404);

		// Make sure the record is still in the cache and the counter still = 1
		const request = JSON.parse(localStorage.getItem('gosqas_offline_cache_1'));
		expect(request).not.toEqual(null);
		expect(request[0][1]).toEqual(formUrl);
		expect(JSON.parse(request[1][1]).deviceName).toEqual('Failed Record');
		expect(JSON.parse(request[1][1]).description).toEqual('A record that will fail to post');
		expect(request[1][1]).toStrictEqual(formData.get('provenanceRecord'));
		expect(localStorage.getItem('cache_counter')).toEqual("1");
	});
});
