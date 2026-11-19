#!/usr/bin/env node

let deviceKey = 'Wp741y2VSAjvenrYQqAiqP'
const api_url = "https://gosqasbe.azurewebsites.net/api";
let fullUrl = `${api_url}/provenance/${deviceKey}`

const data = {
	blobType: 'deviceInitializer',
	deviceName: "Create Record Test",
	description: "An API smoketest for creating the most basic record",
	tags: [],
	children_key: '',
	hasParent: false,
	isPublicKey: false,
}
const formData = new FormData();
formData.append("provenanceRecord", JSON.stringify(data));

const postResponse = await fetch(fullUrl, {
	method: "POST",
	body: formData,
}); 

console.log(formData)
console.log(postResponse)
