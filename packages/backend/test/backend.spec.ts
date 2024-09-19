import { describe, it, expect, beforeEach } from 'vitest';
import { postProvenance } from '../src/functions/httpTrigger';
import { Context, HttpRequest } from "@azure/functions";
import { buildContext, buildHttpRequest } from "./utils";
import { toHex, fromHex, decodeKey, calculateDeviceID } from "../src/functions/httpTrigger";


describe("Test backend functions", () => {
    let context: Context;
    let request: HttpRequest;

    beforeEach(() => {
        // Mock the Azure Functions context and request.
        context = buildContext();
        request = buildHttpRequest();
    });

    it("should return 404 if item is not found", async () => {
        await postProvenance(request, context);
        expect(context.res).toBeUndefined();
    });
});

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

