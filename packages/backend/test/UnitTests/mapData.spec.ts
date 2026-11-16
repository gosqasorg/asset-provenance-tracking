import { describe, it, expect, vi, beforeEach } from 'vitest';
import {mapData} from '../../src/utils/mapData';

// since we dont actually need to look in azure
vi.mock('@azure/identity', () => ({
    ClientSecretCredential: class {
        async getToken() {
            return { token: 'totally-real-token'}
        }
    }
}))

const mockFetch = vi.fn();
global.fetch = mockFetch;

const context = {
invocationId: 'test-invocation-id',
functionName: 'test-function',
extraInputs: { get: vi.fn(), set: vi.fn() },
extraOutputs: { get: vi.fn(), set: vi.fn() },
log: vi.fn(), trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(),
options: { trigger: { type: 'http', name: 'req' }, extraInputs: [], extraOutputs: [] },
};

// function to create mock map rows 
// day, country, state, city, req, failed, responsetime
function mockRows(rows: any[][]){
    mockFetch.mockResolvedValue({
        ok: true,
        json: async() => ({tables: [{rows}] }),
    })
}

beforeEach(() => {
    vi.resetAllMocks();
    console.log("Resetting mocks...")
})

// summation for country
describe('Map Queries', async() => {
    it ('sum rows for the same country and week', async() => {
        mockRows([
            ['2026-09-07', 'United States', 'Maryland', 'Baltimore', 3, 1, 100],
            ['2026-09-07', 'United States', 'Utah', 'Salt Lake City', 2, 4, 125]
        ])

        await mapData.mapRefresh(context)

        const countryData = mapData.getCountryStats()['US']
        console.log(countryData.weeks)
        console.log(countryData.weeks['2026-09-07'])
        expect(countryData.requests).toBe(5)
        expect(countryData.failed).toBe(5)
        expect(countryData.responseTime).toBe(225)
        expect(countryData.weeks['2026-09-07'].requests).toBe(5)
    });

    // key statesand cities
    it('key states and cities by key', async () => {
        mockRows([
            ['2026-09-08', 'United States', 'Utah', 'Salt Lake City', 2, 4, 100],
            ['2026-09-08', 'United States', 'Utah', 'Pepper River City', 2, 4, 125]
        ])

       await mapData.mapRefresh(context)
    
       console.log(mapData.getCountryStats())
       const stateData = mapData.getStateStats()['US|utah'] 
       expect(stateData.responseTime).toBe(225);

       const cityData = mapData.getCityStats()['US|utah|salt lake city']
       expect(cityData.responseTime).toBe(100);
       expect(cityData.stateKey).toBe('US|utah')
    });

    // skip unknown locations
    it('skips unknown countries and logs them', async() => {
        mockRows([
            ['2026-09-09', 'Land of Oz', 'Yellow Brick Road', 'Wizards House', 2, 4, 100]
        ])

        await mapData.mapRefresh(context)

        console.log(mapData.getCountryStats())
        expect(mapData.getCountryStats()).toEqual({});
        expect(context.log).toHaveBeenCalledWith('No ISO code for "Land of Oz"')
    })
}
)
