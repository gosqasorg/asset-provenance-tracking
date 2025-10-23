

describe("Creating records with attachments", () => {
	const baseUrl = 'https://gdtprodbackend.azurewebsites.net/api/provenance/'

	// create a record with an attachement 
	it("(Smoketest) Create the most basic record", async () => {
		// Create record key
		const deviceKey = await makeEncodedDeviceKey();
		console.log("Created Device Key: " + deviceKey);
		let fullUrl = `${baseUrl}${deviceKey}`
		expect(deviceKey.length).toBe(22);
		expect(validateKey(deviceKey)).toBe(true);

		// POST record key
		try {
			const data = {
				blobType: 'deviceInitializer',
				deviceName: "Create Record Test",
				description: "An API Feature Test-Attachments",
				tags: {},
				children_key: '',
				hasParent: false,
				isReportingKey: false,
			}
			const formData = new FormData();
    		formData.append("provenanceRecord", JSON.stringify(data));

            const buffer = await readFile('./test/attachments/a200.jpg');
			const blob = new Blob([buffer], { type: 'image/jpeg' });
			formData.append('kirby.png', blob);

			const postResponse = await fetch(fullUrl, {
				method: "POST",
				body: formData,
			});

			expect(postResponse.ok).toBe(true);

		} catch (error) {
			console.error("(Create POST Test) Error creating a record: " + error); 
			throw error;
		}

		// GET record key to make sure it exists
		let getResponse; 
		try {
			getResponse = await fetch(fullUrl);
			getResponse = await getResponse.json();
			let responseString = JSON.parse(JSON.stringify(getResponse[0]));

			expect(JSON.stringify(getResponse)).not.toBe('[]');
			expect(responseString.record.deviceName).toBe('Create Record Test');
			expect(responseString.record.description).toBe('An API Feature Test-Attachments');
			expect(responseString.record.children_key).toBe("");
			expect(responseString.record.hasParent).toBe(false);
			expect(responseString.record.isReportingKey).toBe(false);
            expect(responseString.attachments.length).toBe(1)

		} catch(error) {
			console.error('(Create GET Test) Failed to fetch url: ' + fullUrl + '\nError: ' + error) 
			throw error;
		}
	});
	
});
