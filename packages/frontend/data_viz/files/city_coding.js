import city from './cities-geocoded.json'
import { writeFile } from 'node:fs/promises'
import countries from "i18n-iso-countries";


console.log(city[0])
const cityGeo = {}

for (let i = 0; i < city.length; i++) {
  const cityName = city[i].city.toLowerCase()
  const stateName = city[i][`state/province`].toLowerCase()
  const countryName = city[i]['country/region']
  const countryIso = countries.getAlpha2Code(countryName, "en")
  if (!countryIso) {
    console.log(countryName)
  }


  const lat = city[i].lat
  const lon = city[i].lon  

  const key = `${countryIso}|${stateName}|${cityName}`
  cityGeo[key] = [lon, lat]
}

console.log(cityGeo)

async function saveToJson(filePath, data){
    try {
        const jsonString = JSON.stringify(data, null, 2)
        await writeFile(filePath, jsonString, 'utf8')

    } catch (error) {
        console.error("Error writing to file")
    }
}

saveToJson('./city-coords.json', cityGeo)