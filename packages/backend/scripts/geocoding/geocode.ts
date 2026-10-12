// File to create a json file with the geocoding data for cities 
// this way we dont have to query geocoding services for every request 
// This is a one time script 

import { readFileSync, writeFileSync } from "node:fs";

// Helper funcs 
function openFile(path: string) {
    return readFileSync(path, 'utf8').split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('\t'))
};

// norm the string to remove accents 
function normalizeString(str: string) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

//  convert the geonames state codes to the state name for azure 
const admin1Name  = new Map(openFile('admin1CodesASCII.txt').map(col => [col[0], col[1]]))

const output = {}

// loop through the cities file and create a key for each city and match with its coordinate 
for (const col of openFile('cities5000.txt')) {
    const country = regionNames.of(col[8]) ?? ''
    const state = admin1Name.get(`${col[8]}.${col[10]}`) ?? ''
    const coords : [Number, Number] = [Number(col[4]), Number(col[5])]

    for (const name of ([col[1], col[2]])) {
        const key = `${normalizeString(name)}|${normalizeString(state)}|${normalizeString(country)}`
        // keep first match only, for some reason geonames has duplicates 
        if (output[key] === null || output[key] === undefined) {
            output[key] = coords
        }
    }
}

writeFileSync('./cities.json', JSON.stringify(output));
console.log(`${Object.keys(output).length} keys written`);


const countriesOutput = {};
const countryInfo = openFile('countryInfo.txt');

for (const [iso, , num, , name] of countryInfo) {
  countriesOutput[normalizeString(name)] = {iso: iso, numeric: num.padStart(3, '0')};            // "united states" -> "US"
}

writeFileSync('./countries.json', JSON.stringify(countriesOutput, null, 2));
console.log(`${Object.keys(countriesOutput).length} countries written`);