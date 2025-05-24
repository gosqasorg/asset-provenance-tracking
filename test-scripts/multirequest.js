const axios = require('axios');

async function makeRequests(url, numRequests) {
  const promises = [];

  for (let i = 0; i < numRequests; i++) {
    promises.push(
      axios.get(url)
        .then(response => {
          console.log(`Request ${i + 1} successful: ${response.status}`);
          return response.data;
        })
        .catch(error => {
          console.error(`Request ${i + 1} failed: ${error.message}`);
          return null;
        })
    );
  }
  return Promise.all(promises);
}

async function main() {
    const url = 'https://red-stone-00f5d251e.5.azurestaticapps.net/record/8n7Q4wyLdymzmypCbuGdnm';
//  const url = 'https://red-stone-00f5d251e.5.azurestaticapps.net/'; // Replace with your target URL
  const numRequests = 500; // Number of requests to make

  console.log(`Making ${numRequests} requests to ${url}...`);

  const results = await makeRequests(url, numRequests);

  console.log('All requests completed.');
}

main();
