import { describe, it, expect } from 'vitest';
import { toHex, decodeKey } from "../src/functions/httpTrigger.js";

describe("Test algorithms", () => {
    it("should decode the key", () => {
        const deviceKey = "5LAtuNjm3iuAR3ohpjTMy7";
        const key = decodeKey(deviceKey);
        expect(toHex(key)).toEqual("2311c8c1bbb6bd7b4198c6e47711bb96");
    });
});

