import { describe, it, expect } from 'vitest';
import { toHex, fromHex, decodeKey, calculateDeviceID } from "../src/functions/httpTrigger";

describe("Test algorithms", () => {
    it("should decode the key", () => {
        const deviceKey = "5LAtuNjm3iuAR3ohpjTMy7";
        const key = decodeKey(deviceKey);
        expect(toHex(key)).toEqual("2311c8c1bbb6bd7b4198c6e47711bb96");
    });

    it("should calculate the device key as a string", async () => {
        const deviceKey = "5LAtuNjm3iuAR3ohpjTMy7";
        const id = await calculateDeviceID(deviceKey);
        expect(id).toEqual(id);
    });

    it("should calculate the device key as binary", async () => {
        const deviceKey = "5LAtuNjm3iuAR3ohpjTMy7";
        const id = await calculateDeviceID(fromHex(deviceKey));
        expect(id).toEqual(id);
    });

});

