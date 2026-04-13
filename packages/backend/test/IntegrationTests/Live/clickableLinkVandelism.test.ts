import { describe, it, expect } from "vitest";
import clickableLink from "../../../../frontend/utils/clickableLink";
import { makeEncodedDeviceKey, validateKey } from "../../../src/utils/keyFuncs";
import { readFile } from 'fs/promises';

const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/';
let timeout = 30000;

// Create a record with a given description and return the device key
async function createRecord(description: string): Promise<string> {
    const deviceKey = await makeEncodedDeviceKey();
    console.log(deviceKey);
    let fullUrl = `${baseUrl}${deviceKey}`;

    expect(deviceKey.length).toBe(22);
    expect(validateKey(deviceKey)).toBe(true);

    const data = {
        blobType: 'deviceInitializer',
        deviceName: "Vandilism Test Record",
        description: description,
        tags: {},
        children_key: '',
        hasParent: false,
        isReportingKey: false,
    }

    const formData = new FormData();
    formData.append("provenanceRecord", JSON.stringify(data));

    const postResponse = await fetch(fullUrl, {
        method: "POST",
        body: formData,
    });

    const responseText = await postResponse.text();
    console.log("POST status:", postResponse.status);
    console.log("POST body:", responseText);
    console.log("POST URL:", fullUrl);

    expect(postResponse.ok).toBe(true);

    return deviceKey;
}

// Fetch record using its device key and return the description
async function fetchDescription (deviceKey: string): Promise<string> {
    let fullUrl = `${baseUrl}${deviceKey}`;
    let getResponse = await fetch(fullUrl);
    let data = await getResponse.json();

    let responseString = JSON.parse(JSON.stringify(data[data.length - 1]));
    return responseString.record.description;
}



describe('clickableLink: Vandalism Integration Tests', () => {

    // Basic check
    it("smoketest", () => {
		expect(0).toBe(0);
	}, timeout);

    // Safe url should pass through and become a proper anchor tag
    it('Valid url', async () => {
        const description = 'Check out https://gosqas.org it is amazing';

        try {
            const deviceKey = await createRecord(description);
            const fetchedDescription = await fetchDescription(deviceKey);
            const html = clickableLink(fetchedDescription) as string;

            expect(fetchedDescription).toContain('https://gosqas.org');
            expect(html).toContain('<a ');
            expect(html).toContain('href="https://gosqas.org"');
            expect(html).toContain('target="_blank"');
            expect(html).toContain('rel="noopener noreferrer"');

        } catch (error) {
            console.error('(Safe URL Test) Error: ', error);
            throw error;
        }
    }, timeout);

    // <script> tags should be entity-encoded, not executed
    it('Script tag injected in description is entity-encoded', async () => {
        const payload = "<script>alert('xss')</script> Innocent description";

        const deviceKey = await createRecord(payload);
        const fetchedDescription = await fetchDescription(deviceKey);

        expect(fetchedDescription).toContain('<script>');

        const html = clickableLink(fetchedDescription) as string;

        expect(html).not.toContain('<script>');
        expect(html).not.toContain('</script>');
        expect(html).toContain('&lt');
        expect(html).toContain('&gt');
    }, timeout);

    // <img onerror> is a common XSS vector - should be entity-encoded
    it('Img onerror XSS payload in description is entity-encoded', async () => {
        const payload = '<img src=x onerror=alert(1)> Normal text';

        const deviceKey = await createRecord(payload);
        const fetchedDescription = await fetchDescription(deviceKey);

        expect(fetchedDescription).toContain('<img');

        const html = clickableLink(fetchedDescription) as string;

        expect(html).not.toContain('<img');
        expect(html).toContain('&lt');
    }, timeout);

    // <style> tags can hide content or exfiltrate data - should be entity-encoded
    it('Style tag with CSS injection is entity-encoded', async () => {
        const payload = '<style>body { display: none; }</style>';

        try {
            const deviceKey = await createRecord(payload);
            const fetchedDescription = await fetchDescription(deviceKey);
            const html = clickableLink(fetchedDescription) as string;

            expect(html).not.toContain('<style>');
            expect(html).toContain('&lt');
        } catch (error) {
            console.error('(Style Tag Test) Error: ' + error);
            throw error;
        }
    }, timeout);

    
    it('javascript: protocol string is not turned into an anchor tag', async () => {
        const payload = "javascript:alert('xss')";

        try {
            const deviceKey = await createRecord(payload);
            const fetchedDescription = await fetchDescription(deviceKey);
            const html = clickableLink(fetchedDescription) as string;

            expect(html).not.toContain('<a ');
            expect(html).not.toContain('href=');
        } catch (error) {
            console.error('(javascript: Protocol Test) Error: ' + error);
            throw error;
        }
    }, timeout);

    // " gets encoded to &quot before URL wrapping, so onmouseover can't break out of the href
    it('Quote injection in URL does not produce an executable onmouseover attribute', async () => {
        const payload = 'https://evil.com" onmouseover="alert(1)';

        try {
            const deviceKey = await createRecord(payload);
            const fetchedDescription = await fetchDescription(deviceKey);
            const html = clickableLink(fetchedDescription) as string;

            // onmouseover=" would mean the raw quote survived 
            expect(html).not.toContain('onmouseover="');
        } catch (error) {
            console.error('(Quote Injection Test) Error: ' + error);
            throw error;
        }
    }, timeout);

    // Safe url and a script tag in the same description - url should be linked, tag should be encoded
    it('Script tag alongside a valid URL: url is linked, tag is encoded', async () => {
        const payload = "Check out https://gosqas.org <script>alert('xss')</script>";

        try {
            const deviceKey = await createRecord(payload);
            const fetchedDescription = await fetchDescription(deviceKey);
            const html = clickableLink(fetchedDescription) as string;

            expect(html).toContain('href="https://gosqas.org"');
            expect(html).not.toContain('<script>');
            expect(html).toContain('&lt');
        } catch (error) {
            console.error('(Script + URL Test) Error: ' + error);
            throw error;
        }
    }, timeout);

})
