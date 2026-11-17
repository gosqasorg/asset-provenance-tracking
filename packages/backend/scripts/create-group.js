#!/usr/bin/env node

const payload = {
  deviceName: "Case of Tourniquets",
  description: "Example group",
  tags: [],
  number_of_children: 2
};

let formData = new FormData();
formData.append("provenanceRecord", JSON.stringify(payload));

let response = await fetch(`https://gdtprodbackend.azurewebsites.net/api/createGroup`, {
  method: "POST",
  body: formData,
});


console.log(response)
const data = await response.json()
console.dir(data.groupUrl)

