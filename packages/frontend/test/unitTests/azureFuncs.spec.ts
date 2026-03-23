import { describe, expect, it } from 'vitest'
import { onlineTestFetch } from '~/services/azureFuncs'
import { stashRequest } from '~/services/azureFuncs';
import * as z from 'zod';

describe('Tests to see if user is online and offline', () => {
    it('Test to see if user is online', async () => {
        let result = await onlineTestFetch();
        expect(result).toBe(true);
    });

    it('Test to see if user is offline', async () => {
        let result = await onlineTestFetch('https://www.fakeurl.com');
        expect(result).toBe(false);
    });

});

describe('Tests to see if requests can be stashed', () => {
    it('Test to see if returned data types are correct', async () => {
        // Reset the naming counter (for testing purposes)
        localStorage.setItem('stash_counter', '0');

        const baseUrl = useRuntimeConfig().public.baseUrl;
        const deviceKey = await makeEncodedDeviceKey();
        const formUrl = baseUrl + '/record/' + deviceKey;
        const record = {
            blobType: 'deviceInitializer',
            deviceName: 'name',
            description: 'description',
            tags: [],
            children_key: '',
            hasParent: false,
            isReportingKey: false
        };
        const formData = new FormData();
        formData.append('provenanceRecord', JSON.stringify(record));

        stashRequest(formUrl, formData);
        let requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1'));

        // Confirm that the datatypes are the same as they started
        const returnedFormUrl = requestFromStash[0][1];
        const returnedFormData = JSON.parse(requestFromStash[1][1]);
        expect(typeof returnedFormUrl).toEqual(typeof formUrl);
        expect(returnedFormUrl).toEqual(formUrl);

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
    });

    it('Test to see if we can store multiple requests', async () => {
        localStorage.setItem('stash_counter', '0');

        const baseUrl = useRuntimeConfig().public.baseUrl;
        const deviceKey = await makeEncodedDeviceKey();
        const formUrl = baseUrl + '/record/' + deviceKey;
        const record = {
            blobType: 'deviceInitializer',
            deviceName: 'name',
            description: 'description',
            tags: [],
            children_key: '',
            hasParent: false,
            isReportingKey: false
        };
        const record2 = {
            blobType: 'deviceInitializer',
            deviceName: 'name2',
            description: 'slightly longer description',
            tags: [],
            children_key: '',
            hasParent: false,
            isReportingKey: false
        };

        // Store two records in localStorage and confirm that they were stored correctly
        const formData = new FormData();
        const formData2 = new FormData();
        formData.append('provenanceRecord', JSON.stringify(record));
        formData2.append('provenanceRecord', JSON.stringify(record2));

        stashRequest(formUrl, formData);
        stashRequest(formUrl, formData2);

        let requestFromStash = JSON.parse(localStorage.getItem('gosqas_offline_stash_1'));
        const returnedFormUrl = requestFromStash[0][1];
        const returnedFormData = JSON.parse(requestFromStash[1][1]);
        expect(returnedFormUrl).toEqual(formUrl);

        let requestFromStash2 = JSON.parse(localStorage.getItem('gosqas_offline_stash_2'));
        const returnedFormUrl2 = requestFromStash2[0][1];
        const returnedFormData2 = JSON.parse(requestFromStash2[1][1]);
        expect(returnedFormUrl2).toEqual(formUrl);

        // Check that the correct record was stored at each request
        expect(returnedFormData.deviceName).toEqual('name');
        expect(returnedFormData2.deviceName).toEqual('name2');
        expect(returnedFormData.description).toEqual('description');
        expect(returnedFormData2.description).toEqual('slightly longer description');
    });
});
