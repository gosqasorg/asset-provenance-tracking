// Centralize the data the map uses by moving it all to one file. 
// At the top of this file, create a json object that stores as key-value pairs the "variable name as used by the map at present" as the key, 
// with "the variable containing the data" as the value.
// Set the map to reference this data object.

const cityGeocoded = [
  {
    "city": "Vancouver",
    "state/province": "British Columbia",
    "country/region": "Canada",
    "requests": 1414,
    "lat": 49.2608724,
    "lon": -123.113952
  },
  {
    "city": "Tucson",
    "state/province": "Arizona",
    "country/region": "United States",
    "requests": 618,
    "lat": 32.2228765,
    "lon": -110.974847
  },
  {
    "city": "Chicago",
    "state/province": "Illinois",
    "country/region": "United States",
    "requests": 564,
    "lat": 41.8755616,
    "lon": -87.6244212
  },
  {
    "city": "Temecula",
    "state/province": "California",
    "country/region": "United States",
    "requests": 560,
    "lat": 33.4946353,
    "lon": -117.147366
  },
  {
    "city": "Boydton",
    "state/province": "Virginia",
    "country/region": "United States",
    "requests": 428,
    "lat": 36.6673066,
    "lon": -78.3882002
  },
  {
    "city": "Temple Hills",
    "state/province": "Maryland",
    "country/region": "United States",
    "requests": 359,
    "lat": 38.8140024,
    "lon": -76.9455296
  },
  {
    "city": "Washington",
    "state/province": "Virginia",
    "country/region": "United States",
    "requests": 312,
    "lat": 38.7129721,
    "lon": -78.1593468
  },
  {
    "city": "Cheyenne",
    "state/province": "Wyoming",
    "country/region": "United States",
    "requests": 298,
    "lat": 41.139981,
    "lon": -104.820246
  },
  {
    "city": "San Jose",
    "state/province": "California",
    "country/region": "United States",
    "requests": 216,
    "lat": 37.3361663,
    "lon": -121.890591
  },
  {
    "city": "Wakefield",
    "state/province": "Massachusetts",
    "country/region": "United States",
    "requests": 159,
    "lat": 42.506484,
    "lon": -71.0728306
  },
  {
    "city": "Des Moines",
    "state/province": "Iowa",
    "country/region": "United States",
    "requests": 145,
    "lat": 41.5868654,
    "lon": -93.6249494
  },
  {
    "city": "Phoenix",
    "state/province": "Arizona",
    "country/region": "United States",
    "requests": 141,
    "lat": 33.4484367,
    "lon": -112.074141
  },
  {
    "city": "Durham",
    "state/province": "North Carolina",
    "country/region": "United States",
    "requests": 141,
    "lat": 35.996653,
    "lon": -78.9018053
  },
  {
    "city": "Paris",
    "state/province": "Paris",
    "country/region": "France",
    "requests": 138,
    "lat": 48.8588897,
    "lon": 2.320041
  },
  {
    "city": "Nablus",
    "state/province": "Nablus",
    "country/region": "State Of Palestine",
    "requests": 137,
    "lat": 32.2179482,
    "lon": 35.2670849
  },
  {
    "city": "Raleigh",
    "state/province": "North Carolina",
    "country/region": "United States",
    "requests": 130,
    "lat": 35.7803977,
    "lon": -78.6390989
  },
  {
    "city": "Wayne",
    "state/province": "New Jersey",
    "country/region": "United States",
    "requests": 127,
    "lat": 40.9491723,
    "lon": -74.2376802
  },
  {
    "city": "Dallas",
    "state/province": "Texas",
    "country/region": "United States",
    "requests": 97,
    "lat": 32.7762719,
    "lon": -96.7968559
  },
  {
    "city": "Mountain View",
    "state/province": "California",
    "country/region": "United States",
    "requests": 78,
    "lat": 37.3893889,
    "lon": -122.0832101
  },
  {
    "city": "Quincy",
    "state/province": "Massachusetts",
    "country/region": "United States",
    "requests": 67,
    "lat": 42.2509914,
    "lon": -71.0037374
  },
  {
    "city": "Peabody",
    "state/province": "Massachusetts",
    "country/region": "United States",
    "requests": 58,
    "lat": 42.5278731,
    "lon": -70.9286609
  },
  {
    "city": "Los Angeles",
    "state/province": "California",
    "country/region": "United States",
    "requests": 48,
    "lat": 34.0536909,
    "lon": -118.242766
  },
  {
    "city": "Beaumont",
    "state/province": "Texas",
    "country/region": "United States",
    "requests": 45,
    "lat": 30.0829344,
    "lon": -94.0984277
  },
  {
    "city": "Nablus",
    "state/province": "Nablus",
    "country/region": "Occupied Palestinian Territory",
    "requests": 44,
    "lat": 31.92157,
    "lon": 35.20329
  },
  {
    "city": "Singapore",
    "state/province": "Central Singapore",
    "country/region": "Singapore",
    "requests": 28,
    "lat": 1.2959845,
    "lon": 103.7766186
  },
  {
    "city": "Quincy",
    "state/province": "Washington",
    "country/region": "United States",
    "requests": 25,
    "lat": 47.2343673,
    "lon": -119.8535054
  },
  {
    "city": "London",
    "state/province": "Ontario",
    "country/region": "Canada",
    "requests": 16,
    "lat": 42.9836747,
    "lon": -81.2496068
  },
  {
    "city": "Savigny-Le-Temple",
    "state/province": "Seine-Et-Marne",
    "country/region": "France",
    "requests": 12,
    "lat": 48.5958681,
    "lon": 2.5798953
  },
  {
    "city": "New York",
    "state/province": "New York",
    "country/region": "United States",
    "requests": 9,
    "lat": 40.7127281,
    "lon": -74.0060152
  },
  {
    "city": "Austin",
    "state/province": "Texas",
    "country/region": "United States",
    "requests": 9,
    "lat": 30.2711286,
    "lon": -97.7436995
  },
  {
    "city": "Orsay",
    "state/province": "Essonne",
    "country/region": "France",
    "requests": 7,
    "lat": 48.699184,
    "lon": 2.187457
  },
  {
    "city": "Gif-Sur-Yvette",
    "state/province": "Essonne",
    "country/region": "France",
    "requests": 7,
    "lat": 48.7018823,
    "lon": 2.134529
  },
  {
    "city": "Columbus",
    "state/province": "Ohio",
    "country/region": "United States",
    "requests": 7,
    "lat": 39.9622601,
    "lon": -83.0007065
  },
  {
    "city": "Las Vegas",
    "state/province": "Nevada",
    "country/region": "United States",
    "requests": 5,
    "lat": 36.1674263,
    "lon": -115.1484131
  },
  {
    "city": "Gaza",
    "state/province": "Gaza",
    "country/region": "State Of Palestine",
    "requests": 5,
    "lat": 31.5128679,
    "lon": 34.4581358
  },
  {
    "city": "Saint-Ave",
    "state/province": "Morbihan",
    "country/region": "France",
    "requests": 5,
    "lat": 47.6903849,
    "lon": -2.7358875
  },
  {
    "city": "Villejuif",
    "state/province": "Val-De-Marne",
    "country/region": "France",
    "requests": 5,
    "lat": 48.7921098,
    "lon": 2.3633048
  },
  {
    "city": "Seynod",
    "state/province": "Haute-Savoie",
    "country/region": "France",
    "requests": 5,
    "lat": 45.8880398,
    "lon": 6.0992785
  },
  {
    "city": "Ramsey",
    "state/province": "New Jersey",
    "country/region": "United States",
    "requests": 3,
    "lat": 41.0573188,
    "lon": -74.1409771
  },
  {
    "city": "Florence",
    "state/province": "Colorado",
    "country/region": "United States",
    "requests": 3,
    "lat": 38.3902777,
    "lon": -105.1185988
  },
  {
    "city": "Koeln",
    "state/province": "Nordrhein-Westfalen",
    "country/region": "Germany",
    "requests": 2,
    "lat": 50.938361,
    "lon": 6.959974
  }
]

const recent = [
  {
    "time": "2026-04-07T21:53:21.7099352Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/TbRUZY9JZ3f8xMtpCxvmKQ",
    "success": true,
    "status": "200",
    "duration_ms": 53.1261,
    "country": "United States",
    "city": "Columbus",
    "region": "Ohio",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T21:53:21.5881613Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/TbRUZY9JZ3f8xMtpCxvmKQ",
    "success": true,
    "status": "200",
    "duration_ms": 43.247,
    "country": "United States",
    "city": "Columbus",
    "region": "Ohio",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T21:53:21.4641895Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/TbRUZY9JZ3f8xMtpCxvmKQ",
    "success": true,
    "status": "200",
    "duration_ms": 85.451,
    "country": "United States",
    "city": "Columbus",
    "region": "Ohio",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T21:50:19.7469684Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/TbRUZY9JZ3f8xMtpCxvmKQ",
    "success": true,
    "status": "200",
    "duration_ms": 47.6119,
    "country": "United States",
    "city": "Florence",
    "region": "Colorado",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T21:50:19.6248305Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/TbRUZY9JZ3f8xMtpCxvmKQ",
    "success": true,
    "status": "200",
    "duration_ms": 49.2397,
    "country": "United States",
    "city": "Florence",
    "region": "Colorado",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T21:50:18.9405653Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/TbRUZY9JZ3f8xMtpCxvmKQ",
    "success": true,
    "status": "200",
    "duration_ms": 550.9611,
    "country": "United States",
    "city": "Florence",
    "region": "Colorado",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T16:17:21.4437144Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/H3DgG7dCDsD5C6EL8jChwj",
    "success": true,
    "status": "200",
    "duration_ms": 80.3537,
    "country": "Canada",
    "city": "London",
    "region": "Ontario",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T16:17:19.8115509Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/H3DgG7dCDsD5C6EL8jChwj",
    "success": true,
    "status": "200",
    "duration_ms": 1596.1316,
    "country": "Canada",
    "city": "London",
    "region": "Ontario",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T12:43:22.516117Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/LsFaZmCLfp96jKHpKz1Upd",
    "success": true,
    "status": "200",
    "duration_ms": 51.2721,
    "country": "Singapore",
    "city": "Singapore",
    "region": "Central Singapore",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T12:43:21.5101104Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/LsFaZmCLfp96jKHpKz1Upd",
    "success": true,
    "status": "200",
    "duration_ms": 52.9037,
    "country": "Singapore",
    "city": "Singapore",
    "region": "Central Singapore",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T12:43:18.7991848Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/LsFaZmCLfp96jKHpKz1Upd",
    "success": true,
    "status": "200",
    "duration_ms": 1474.4915,
    "country": "Singapore",
    "city": "Singapore",
    "region": "Central Singapore",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T03:48:41.9202908Z",
    "endpoint": "getAttachmentName",
    "url": "https://gdtprodbackend.azurewebsites.net/api/attachment/VfPLp8T6DhtzKd2nz93fFJ/dedd0985fd55be3a49e91e47175b41e2d0500ef91d0dd76451af45baf12a32e6/name",
    "success": true,
    "status": "200",
    "duration_ms": 125.5892,
    "country": "United States",
    "city": "Mountain View",
    "region": "California",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T03:48:41.8128393Z",
    "endpoint": "getAttachmentName",
    "url": "https://gdtprodbackend.azurewebsites.net/api/attachment/VfPLp8T6DhtzKd2nz93fFJ/2a3c3f67d3ed6d993707d5dc9211d755a80a0eca7fb989030d9af9e1ab91c1b6/name",
    "success": true,
    "status": "200",
    "duration_ms": 90.3034,
    "country": "United States",
    "city": "Mountain View",
    "region": "California",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T03:48:41.6499469Z",
    "endpoint": "getAttachmentName",
    "url": "https://gdtprodbackend.azurewebsites.net/api/attachment/VfPLp8T6DhtzKd2nz93fFJ/fb15ebc5836108355c20f063e79117141839beaaf561060a4a2a77969ad148af/name",
    "success": true,
    "status": "200",
    "duration_ms": 117.1453,
    "country": "United States",
    "city": "Mountain View",
    "region": "California",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T03:48:30.4584655Z",
    "endpoint": "getAttachment",
    "url": "https://gdtprodbackend.azurewebsites.net/api/attachment/VfPLp8T6DhtzKd2nz93fFJ/dedd0985fd55be3a49e91e47175b41e2d0500ef91d0dd76451af45baf12a32e6",
    "success": true,
    "status": "200",
    "duration_ms": 203.0937,
    "country": "United States",
    "city": "Mountain View",
    "region": "California",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T03:48:30.2689916Z",
    "endpoint": "getAttachment",
    "url": "https://gdtprodbackend.azurewebsites.net/api/attachment/VfPLp8T6DhtzKd2nz93fFJ/2a3c3f67d3ed6d993707d5dc9211d755a80a0eca7fb989030d9af9e1ab91c1b6",
    "success": true,
    "status": "200",
    "duration_ms": 164.3418,
    "country": "United States",
    "city": "Mountain View",
    "region": "California",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T03:48:29.9101671Z",
    "endpoint": "getAttachment",
    "url": "https://gdtprodbackend.azurewebsites.net/api/attachment/VfPLp8T6DhtzKd2nz93fFJ/fb15ebc5836108355c20f063e79117141839beaaf561060a4a2a77969ad148af",
    "success": true,
    "status": "200",
    "duration_ms": 216.46,
    "country": "United States",
    "city": "Mountain View",
    "region": "California",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T03:48:29.4199856Z",
    "endpoint": "getAttachment",
    "url": "https://gdtprodbackend.azurewebsites.net/api/attachment/VfPLp8T6DhtzKd2nz93fFJ/2257c5a5184689e144f86efe2faf86f374d27e83747be9ef5c166cd8d6c1db53",
    "success": true,
    "status": "200",
    "duration_ms": 456.2304,
    "country": "United States",
    "city": "Mountain View",
    "region": "California",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-07T03:48:20.2645015Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/VfPLp8T6DhtzKd2nz93fFJ",
    "success": true,
    "status": "200",
    "duration_ms": 689.5778,
    "country": "United States",
    "city": "Mountain View",
    "region": "California",
    "client_ip": "0.0.0.0"
  },
  {
    "time": "2026-04-06T20:50:00.4911051Z",
    "endpoint": "getProvenance",
    "url": "https://gdtprodbackend.azurewebsites.net/api/provenance/GYT3zq6CZAj5aoMGgxzAAE",
    "success": true,
    "status": "200",
    "duration_ms": 31.6385,
    "country": "United States",
    "city": "Washington",
    "region": "Virginia",
    "client_ip": "0.0.0.0"
  }
]

const city = [
  {
    "city": "Vancouver",
    "state/province": "British Columbia",
    "country/region": "Canada",
    "requests": 1414
  },
  {
    "city": "Tucson",
    "state/province": "Arizona",
    "country/region": "United States",
    "requests": 618
  },
  {
    "city": "Chicago",
    "state/province": "Illinois",
    "country/region": "United States",
    "requests": 564
  },
  {
    "city": "Temecula",
    "state/province": "California",
    "country/region": "United States",
    "requests": 560
  },
  {
    "city": "Boydton",
    "state/province": "Virginia",
    "country/region": "United States",
    "requests": 428
  },
  {
    "city": "Temple Hills",
    "state/province": "Maryland",
    "country/region": "United States",
    "requests": 359
  },
  {
    "city": "Washington",
    "state/province": "Virginia",
    "country/region": "United States",
    "requests": 312
  },
  {
    "city": "Cheyenne",
    "state/province": "Wyoming",
    "country/region": "United States",
    "requests": 298
  },
  {
    "city": "San Jose",
    "state/province": "California",
    "country/region": "United States",
    "requests": 216
  },
  {
    "city": "Wakefield",
    "state/province": "Massachusetts",
    "country/region": "United States",
    "requests": 159
  },
  {
    "city": "Des Moines",
    "state/province": "Iowa",
    "country/region": "United States",
    "requests": 145
  },
  {
    "city": "Phoenix",
    "state/province": "Arizona",
    "country/region": "United States",
    "requests": 141
  },
  {
    "city": "Durham",
    "state/province": "North Carolina",
    "country/region": "United States",
    "requests": 141
  },
  {
    "city": "Paris",
    "state/province": "Paris",
    "country/region": "France",
    "requests": 138
  },
  {
    "city": "Nablus",
    "state/province": "Nablus",
    "country/region": "State Of Palestine",
    "requests": 137
  },
  {
    "city": "Raleigh",
    "state/province": "North Carolina",
    "country/region": "United States",
    "requests": 130
  },
  {
    "city": "Wayne",
    "state/province": "New Jersey",
    "country/region": "United States",
    "requests": 127
  },
  {
    "city": "Dallas",
    "state/province": "Texas",
    "country/region": "United States",
    "requests": 97
  },
  {
    "city": "Mountain View",
    "state/province": "California",
    "country/region": "United States",
    "requests": 78
  },
  {
    "city": "Quincy",
    "state/province": "Massachusetts",
    "country/region": "United States",
    "requests": 67
  },
  {
    "city": "Peabody",
    "state/province": "Massachusetts",
    "country/region": "United States",
    "requests": 58
  },
  {
    "city": "Los Angeles",
    "state/province": "California",
    "country/region": "United States",
    "requests": 48
  },
  {
    "city": "Beaumont",
    "state/province": "Texas",
    "country/region": "United States",
    "requests": 45
  },
  {
    "city": "Nablus",
    "state/province": "Nablus",
    "country/region": "Occupied Palestinian Territory",
    "requests": 44
  },
  {
    "city": "Singapore",
    "state/province": "Central Singapore",
    "country/region": "Singapore",
    "requests": 28
  },
  {
    "city": "Quincy",
    "state/province": "Washington",
    "country/region": "United States",
    "requests": 25
  },
  {
    "city": "London",
    "state/province": "Ontario",
    "country/region": "Canada",
    "requests": 16
  },
  {
    "city": "Savigny-Le-Temple",
    "state/province": "Seine-Et-Marne",
    "country/region": "France",
    "requests": 12
  },
  {
    "city": "New York",
    "state/province": "New York",
    "country/region": "United States",
    "requests": 9
  },
  {
    "city": "Austin",
    "state/province": "Texas",
    "country/region": "United States",
    "requests": 9
  },
  {
    "city": "Orsay",
    "state/province": "Essonne",
    "country/region": "France",
    "requests": 7
  },
  {
    "city": "Gif-Sur-Yvette",
    "state/province": "Essonne",
    "country/region": "France",
    "requests": 7
  },
  {
    "city": "Columbus",
    "state/province": "Ohio",
    "country/region": "United States",
    "requests": 7
  },
  {
    "city": "Las Vegas",
    "state/province": "Nevada",
    "country/region": "United States",
    "requests": 5
  },
  {
    "city": "Gaza",
    "state/province": "Gaza",
    "country/region": "State Of Palestine",
    "requests": 5
  },
  {
    "city": "Saint-Ave",
    "state/province": "Morbihan",
    "country/region": "France",
    "requests": 5
  },
  {
    "city": "Villejuif",
    "state/province": "Val-De-Marne",
    "country/region": "France",
    "requests": 5
  },
  {
    "city": "Seynod",
    "state/province": "Haute-Savoie",
    "country/region": "France",
    "requests": 5
  },
  {
    "city": "Ramsey",
    "state/province": "New Jersey",
    "country/region": "United States",
    "requests": 3
  },
  {
    "city": "Florence",
    "state/province": "Colorado",
    "country/region": "United States",
    "requests": 3
  },
  {
    "city": "Koeln",
    "state/province": "Nordrhein-Westfalen",
    "country/region": "Germany",
    "requests": 2
  }
]

const country = [
  {
    "country": "USA",
    "one_year": 18661,
    "six_months": 18661,
    "three_months": 18661,
    "one_month": 4789,
    "one_week": 1718,
    "one_day": 0
  },
  {
    "country": "CAN",
    "one_year": 770,
    "six_months": 770,
    "three_months": 770,
    "one_month": 90,
    "one_week": 0,
    "one_day": 0
  },
  {
    "country": "FRA",
    "one_year": 91,
    "six_months": 91,
    "three_months": 91,
    "one_month": 8,
    "one_week": 0,
    "one_day": 0
  },
  {
    "country": "PSX",
    "one_year": 1342,
    "six_months": 1342,
    "three_months": 1342,
    "one_month": 122,
    "one_week": 12,
    "one_day": 0
  },
  {
    "country": "SGP",
    "one_year": 1,
    "six_months": 1,
    "three_months": 1,
    "one_month": 0,
    "one_week": 0,
    "one_day": 0
  },
  {
    "country": "ZAF",
    "one_year": 219,
    "six_months": 219,
    "three_months": 219,
    "one_month": 172,
    "one_week": 57,
    "one_day": 1
  }
]

const region_within_country = [
  {
    "country/region": "Canada",
    "state/province": "British Columbia",
    "requests": 1414
  },
  {
    "country/region": "Canada",
    "state/province": "Ontario",
    "requests": 16
  },
  {
    "country/region": "France",
    "state/province": "Paris",
    "requests": 138
  },
  {
    "country/region": "France",
    "state/province": "Essonne",
    "requests": 14
  },
  {
    "country/region": "France",
    "state/province": "Seine-Et-Marne",
    "requests": 12
  },
  {
    "country/region": "France",
    "state/province": "Morbihan",
    "requests": 5
  },
  {
    "country/region": "France",
    "state/province": "Haute-Savoie",
    "requests": 5
  },
  {
    "country/region": "France",
    "state/province": "Val-De-Marne",
    "requests": 5
  },
  {
    "country/region": "Germany",
    "state/province": "Nordrhein-Westfalen",
    "requests": 2
  },
  {
    "country/region": "Occupied Palestinian Territory",
    "state/province": "Nablus",
    "requests": 44
  },
  {
    "country/region": "Singapore",
    "state/province": "Central Singapore",
    "requests": 28
  },
  {
    "country/region": "State Of Palestine",
    "state/province": "Nablus",
    "requests": 137
  },
  {
    "country/region": "State Of Palestine",
    "state/province": "Gaza",
    "requests": 5
  },
  {
    "country/region": "United States",
    "state/province": "California",
    "requests": 904
  },
  {
    "country/region": "United States",
    "state/province": "Arizona",
    "requests": 759
  },
  {
    "country/region": "United States",
    "state/province": "Virginia",
    "requests": 740
  },
  {
    "country/region": "United States",
    "state/province": "Illinois",
    "requests": 564
  },
  {
    "country/region": "United States",
    "state/province": "Maryland",
    "requests": 359
  },
  {
    "country/region": "United States",
    "state/province": "Wyoming",
    "requests": 298
  },
  {
    "country/region": "United States",
    "state/province": "Massachusetts",
    "requests": 284
  },
  {
    "country/region": "United States",
    "state/province": "North Carolina",
    "requests": 271
  },
  {
    "country/region": "United States",
    "state/province": "Texas",
    "requests": 151
  },
  {
    "country/region": "United States",
    "state/province": "Iowa",
    "requests": 145
  },
  {
    "country/region": "United States",
    "state/province": "New Jersey",
    "requests": 130
  },
  {
    "country/region": "United States",
    "state/province": "Washington",
    "requests": 25
  },
  {
    "country/region": "United States",
    "state/province": "New York",
    "requests": 9
  },
  {
    "country/region": "United States",
    "state/province": "Ohio",
    "requests": 7
  },
  {
    "country/region": "United States",
    "state/province": "Nevada",
    "requests": 5
  },
  {
    "country/region": "United States",
    "state/province": "Colorado",
    "requests": 4
  }
]

export const geoRequests = {
    regionData: region_within_country,
    data: country,
    requestsByCity: city,
    recentRequests: recent,
    citiesGeocoded: cityGeocoded
}