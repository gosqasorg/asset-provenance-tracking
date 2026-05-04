import define1 from "./notebook-chunk.js";

function _selectedCountry(){return(
null
)}

function _selectedRegion(){return(
null
)}

function _selectedCity(){return(
null
)}

function _chart(d3,filteredCountryData,countries,filteredRegionData,filteredCityData,Legend,countrymesh,admin1Features,filteredRegionValuemap,geocodedCities,regionValuemap,$0,$1,$2,regionCountryLookup)
{
  const width = 928;
  const marginTop = 46;
  const height = width / 2 + marginTop;

  const projection = d3.geoEqualEarth().fitExtent([[2, marginTop + 2], [width - 2, height]], {type: "Sphere"});
  const path = d3.geoPath(projection);

  const valuemap = new Map(filteredCountryData.map(d => [d.country, d.requests]));
  const guToCountry = new Map([
    ["FXX", "FRA"],
    ["WEB", "PSX"],
    ["GAZ", "PSX"],
  ]);
  const hardcodedBounds = new Map([
    ["USA", [[-124.848974, 24.396308], [-66.885444, 49.384358]]],  // continental US
    ["RUS", [[26.0, 41.0], [180.0, 77.0]]],                        // European + Asian Russia
    ["FJI", [[177.0, -19.0], [180.0, -16.0]]],                     // main Fiji islands
    ["KIR", [[-173.0, -3.0], [-168.0, 3.0]]],                      // main Kiribati islands  
    ["NZL", [[166.0, -47.0], [178.0, -34.0]]],                     // North + South Island
  ]);

  const hardcodedRegionBounds = new Map([
    // USA
    ["Alaska", [[-168.0, 54.5], [-130.0, 71.5]]],
    ["Hawaii", [[-160.5, 18.5], [-154.5, 22.5]]],
    
    // Russia — far eastern regions that wrap the antimeridian
    ["Chukotka Autonomous Okrug", [[-180.0, 60.0], [180.0, 72.0]]],
    ["Kamchatka Krai", [[155.0, 50.0], [170.0, 63.0]]],
    ["Sakhalin Oblast", [[141.0, 45.0], [145.0, 55.0]]],
    
    // New Zealand outlying islands
    ["Chatham Islands", [[-177.0, -44.5], [-175.0, -43.0]]],
    
    // Fiji
    ["Rotuma", [[177.0, -12.6], [177.5, -12.4]]],
    
    // Kiribati
    ["Line Islands", [[-157.0, -2.0], [-150.0, 2.0]]],
    ["Phoenix Islands", [[-172.0, -4.0], [-170.0, -3.0]]],
    ["Gilbert Islands", [[172.0, -3.0], [177.0, 3.0]]],
  ])
  const sortedFeatures = [...countries.features].sort((a, b) => {
    if (a.properties.ADM0_A3 === "PSX") return 1;
    if (b.properties.ADM0_A3 === "PSX") return -1;
    return 0;
  });
  const color = d3.scaleSequential(d3.extent(filteredCountryData, d => d.requests), d3.interpolateYlOrRd);
  const regionColor = d3.scaleSequential(
    d3.extent(filteredRegionData, d => d.requests),
    d3.interpolateBlues
  );
  const radius = d3.scaleSqrt()
    .domain([0, d3.max(filteredCityData, d => d.requests)])
    .range([2, 20]);
  
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  const g = svg.append("g");

  // Legend stays on svg
  svg.append("g")
      .attr("transform", "translate(20,0)")
      .append(() => Legend(color, {title: "Website Requests", width: 260}));

  // 1. Sphere
  g.append("path")
    .datum({type: "Sphere"})
    .attr("fill", "white")
    .attr("stroke", "currentColor")
    .attr("d", path)
    .on("click", reset);

  // 2. Country choropleth
  g.append("g")
    .selectAll("path")
    .data(sortedFeatures)
    .join("path")
      .attr("fill", d => {
        const gu = d.properties.GU_A3;
        const key = guToCountry.get(gu) || gu;
        const val = valuemap.get(key);
        return val !== undefined ? color(val) : "#ccc";
      })
      .attr("d", path)
      .on("click", clicked)
    .append("title")
      .text(d => `${d.properties.ADM0_A3}\n${valuemap.get(d.properties.ADM0_A3)}`);

  // 3. Mesh
  g.append("path")
    .datum(countrymesh)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("d", path);

  // Pin layer for tiny countries
  const tinyThreshold = 5;
  
  // Deduplicate by ADM0_A3 so Palestine only gets one pin
  const tinyFeatures = sortedFeatures
  .filter(d => {
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    const isSmall = Math.max(x1 - x0, y1 - y0) < tinyThreshold;
    const gu = d.properties.GU_A3;
    const key = guToCountry.get(gu) || gu;
    const hasData = valuemap.has(key); // only countries with data is featured in pin
    return isSmall && hasData;
  })
  .reduce((acc, d) => {
    if (!acc.find(f => f.properties.ADM0_A3 === d.properties.ADM0_A3)) {
      acc.push(d);
    }
    return acc;
  }, []);
  
  g.append("g")
  .selectAll("path")
  .data(tinyFeatures)
  .join("path")
    .attr("transform", d => {
      const [cx, cy] = path.centroid(d);
      return `translate(${cx}, ${cy - 10})`; // offset up so point touches country
    })
    .attr("d", "M0,-10 C-5,-10 -8,-6 -8,-3 C-8,3 0,10 0,10 C0,10 8,3 8,-3 C8,-6 5,-10 0,-10 Z")
    .attr("fill", "red")
    .attr("stroke", "white")
    .attr("stroke-width", 0.8)
    .attr("cursor", "pointer")
    .on("click", clicked)
  .append("title")
    .text(d => {
      const gu = d.properties.GU_A3;
      const key = guToCountry.get(gu) || gu;
      return `${d.properties.NAME}\n${valuemap.get(key) ?? "No data"} requests`;
    });

  // 4. Region layer: hidden by default
  const regionLayer = g.append("g")
    .attr("display", "none")
    .attr("opacity", 0.85);

  regionLayer.selectAll("path")
    .data(admin1Features)
    .join("path")
      .attr("fill", d => {
        const key = `${d.properties.adm0_a3}|${d.properties.name}`;
        const val = filteredRegionValuemap.get(key); 
        const hasCity = geocodedCities.some(c => c["state/province"] === d.properties.name);
        if (val !== undefined) return regionColor(val);       // has region data: blue scale
        if (hasCity) return "#f0a500";                        // has city but no region data: orange
        return "#ddd";                                        // no data at all: grey
      })
      .attr("d", path)
      .attr("stroke", "white")
      .attr("stroke-width", 0.3)
      .attr("cursor", "pointer")
      .on("click", clickedRegion)
    .append("title")
      .text(d => {
        const key = `${d.properties.adm0_a3}|${d.properties.name}`;
        return `${d.properties.name}\n${regionValuemap.get(key) ?? "No data"} requests`;
      });


  const bubbleLayer = g.append("g")
    .attr("display", "none"); // hidden by default

  // 5. City bubbles
  bubbleLayer.selectAll("circle")
    .data(filteredCityData)
    .join("circle")
      .attr("transform", d => `translate(${projection([+d.lon, +d.lat])})`)
      .attr("r", d => radius(d.requests))
      .attr("fill", "steelblue")
      .attr("fill-opacity", 0.6)
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .on("click", (event, d) => {
        event.stopPropagation(); // prevent country click from occurring
        $0.value = d;
      })
    .append("title")
      .text(d => `${d.city}, ${d["state/province"]}\n${d.requests} requests`);

  const zoom = d3.zoom()
    .scaleExtent([1, Infinity])  // place to infinity for smaller country zoom
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
      const k = event.transform.k;
      g.selectAll("circle")
      .attr("r", d => radius(d.requests) / Math.sqrt(k)) // scale down bubbles as zoom in with respect to country/region size
      .attr("stroke-width", 0.5 / Math.sqrt(k));
    });

  function clicked(event, d) {
    event.stopPropagation();
    $1.value = d.properties.NAME;
    $2.value = null;
    $0.value = null;
    
    // For tiny countries the pin feature may have a bad bounding box
    // Find the best feature to zoom to by ADM0_A3
    const adm0 = d.properties.ADM0_A3;
    let x0, y0, x1, y1;

    if (hardcodedBounds.has(adm0)) {
      // Use hardcoded bounds for countries with mainland and antimeridian bounds 
      // For e.g. USA with Hawaii and Alaska
      const [sw, ne] = hardcodedBounds.get(adm0);
      [[x0, y0], [x1, y1]] = [projection(sw), projection(ne)];
    } else {
      const allMatchingFeatures = sortedFeatures.filter(f => f.properties.ADM0_A3 === adm0);
      const zoomTarget = allMatchingFeatures.reduce((best, f) => {
        const [[fx0, fy0], [fx1, fy1]] = path.bounds(f);
        const size = Math.max(fx1 - fx0, fy1 - fy0);
        const [[bx0, by0], [bx1, by1]] = path.bounds(best);
        const bestSize = Math.max(bx1 - bx0, by1 - by0);
        return size > bestSize ? f : best;
      });
      [[x0, y0], [x1, y1]] = path.bounds(zoomTarget);
    }
  
    regionLayer.attr("display", "inline");
    regionLayer.selectAll("path")
      .attr("display", dp =>
        dp.properties.adm0_a3 === adm0 ? "inline" : "none"
      );
  
    bubbleLayer.attr("display", "inline");
    bubbleLayer.selectAll("circle")
      .attr("display", dp =>
        dp["country/region"] === d.properties.NAME ||
        regionCountryLookup.get(dp["country/region"]) === adm0
          ? "inline" : "none"
      );

    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.7 / Math.max(
          (x1 - x0) / width,
          (y1 - y0) / height
        ))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
    );
  } 

  function clickedRegion(event, d) {
    event.stopPropagation();
    $2.value = d.properties.name;
    $0.value = null;
    let x0, y0, x1, y1;

    if (hardcodedRegionBounds.has(d.properties.name)) {
      // handles countries that are divided by mainland and non-mainland 
      // but not handled in country topjson
      const [sw, ne] = hardcodedRegionBounds.get(d.properties.name);
      [[x0, y0], [x1, y1]] = [projection(sw), projection(ne)];
    } else {
      [[x0, y0], [x1, y1]] = path.bounds(d);
    }
    
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(0.7 / Math.max(
          (x1 - x0) / width,
          (y1 - y0) / height
        ))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
    );
  }

  function reset() {
    regionLayer.attr("display", "none");
    bubbleLayer.attr("display", "none"); 
    $0.value = null;
    $2.value = null;
    $1.value = null;
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
    );
  }

  svg.call(zoom);
  return svg.node();
}


async function _data(FileAttachment){return(
(await FileAttachment("requests-by-country@5.json").json())
  .map(d => ({country: d.country, requests: +d.requests}))
)}

function _6(md){return(
md`The world geometries are represented in TopoJSON, which we convert into GeoJSON using topojson.feature. (TopoJSON, like D3, is available by default in all Observable notebooks.) These geometries are represented in spherical coordinates (*i.e.*, latitude and longitude in degrees); therefore we’ll need the *projection* option above to convert to screen coordinates (*i.e.*, pixels).`
)}

function _world(FileAttachment){return(
FileAttachment("ne_50m_admin_0_map_units@2.json").json()
)}

function _countries(topojson,world){return(
topojson.feature(world, world.objects.ne_50m_admin_0_map_units)
)}

function _9(md){return(
md`The *countrymesh* is just the internal borders between countries, *i.e.*, everything but the coastlines. This avoids an additional stroke on the perimeter of the map, which would otherwise mask intricate features such as islands and inlets. (Try removing the last argument to topojson.mesh below to see the effect.)`
)}

function _countrymesh(topojson,world){return(
topojson.mesh(world, world.objects.ne_50m_admin_0_map_units, (a, b) => a !== b)
)}

function _geocodeCity(){return(
async function geocodeCity(city, state, country) {
  const query = `${city}, ${state}, ${country}`;
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const url = `https://corsproxy.io/?${encodeURIComponent(nominatimUrl)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.length) return { lat: null, lon: null };
  return { lat: +data[0].lat, lon: +data[0].lon };
}
)}

function _requestsByCity(FileAttachment){return(
FileAttachment("requests-by-city@1.json").json()
)}

async function _geocodedCities(FileAttachment,requestsByCity,geocodeCity)
{
  // Start with already geocoded cities
  const cached = await FileAttachment("cities-geocoded.json").json();
  const cachedMap = new Map(cached.map(d => [`${d.city}|${d["country/region"]}`, d]));
  
  const results = [];
  for (const d of requestsByCity) {
    const key = `${d.city}|${d["country/region"]}`;
    
    if (cachedMap.has(key)) {
      // Already geocoded, use cached coordinates
      results.push(cachedMap.get(key));
    } else {
      // For new cities, use Nominatim to get the coordinates
      // N.B. Nominatim is free to use, but has a rate limit.
      // Getting an OpenCage API key would be a better solution 
      // Free tier has 2,500 requests per day.
      const coords = await geocodeCity(d.city, d["state/province"], d["country/region"]);
      results.push({ ...d, ...coords });
    }
  }
  return results;
}


function _admin1(FileAttachment){return(
FileAttachment("ne_10m_admin_1_states_provinces.json").json()
)}

function _regionData(FileAttachment){return(
FileAttachment("requests-by-region-within-country.json").json()
)}

function _admin1Features(topojson,admin1){return(
topojson.feature(admin1, admin1.objects.ne_10m_admin_1_states_provinces).features
)}

function _regionCountryLookup(){return(
new Map([
  ["Bangladesh", "BGD"],
  ["Canada", "CAN"],
  ["France", "FRA"],
  ["Germany", "DEU"],
  ["Occupied Palestinian Territory", "PSX"],
  ["Singapore", "SGP"],
  ["State Of Palestine", "PSX"],
  ["United States", "USA"]
])
)}

function _regionValuemap(regionData,regionCountryLookup){return(
new Map(
  regionData.map(d => [
    `${regionCountryLookup.get(d["country/region"])}|${d["state/province"]}`,
    d.requests
  ])
)
)}

function _recentRequests(FileAttachment){return(
FileAttachment("recent-requests.json").json()
)}

function _selectedWindow(Inputs){return(
Inputs.radio(
  ["1d", "1w", "1m", "3m", "6m", "1y"],
  {value: "1d", label: "Time window", 
   format: x => ({"1d": "1 Day", "1w": "1 Week", "1m": "1 Month", "3m": "3 Months", "6m": "6 Months", "1y": "1 Year"})[x]}
)
)}

function _detailPanel(selectedCity,selectedRegion,selectedCountry,html,selectedWindow,recentRequests)
{
  // Determine what level is selected
  const level = selectedCity ? "city" 
    : selectedRegion ? "region" 
    : selectedCountry ? "country" 
    : null;
  if (!level) {
    return html`<div style="padding: 16px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; color: #999; font-family: sans-serif;">
      Click a country, region or city bubble to see request details
    </div>`;
  }
  const now = new Date();
  const cutoff = new Date(now);
  if (selectedWindow === "1d") cutoff.setDate(now.getDate() - 1);
  if (selectedWindow === "1w") cutoff.setDate(now.getDate() - 7);
  if (selectedWindow === "1m") cutoff.setMonth(now.getMonth() - 1);
  if (selectedWindow === "3m") cutoff.setMonth(now.getMonth() - 3);
  if (selectedWindow === "6m") cutoff.setMonth(now.getMonth() - 6);
  if (selectedWindow === "1y") cutoff.setMonth(now.getFullYear() - 1);

  // Filter based on level
  const filtered = recentRequests.filter(d => {
    const inTime = new Date(d.time) >= cutoff;
    if (level === "city") return d.city === selectedCity.city && inTime;
    if (level === "region") return d.region === selectedRegion && inTime;
    if (level === "country") return d.country === selectedCountry && inTime;
    return false;
  });

   // Header title
  const title = selectedCity 
    ? `${selectedCity.city}, ${selectedCity["state/province"]}` 
    : selectedRegion 
    ? selectedRegion 
    : selectedCountry;

  const successRate = filtered.length
    ? ((filtered.filter(d => d.success).length / filtered.length) * 100).toFixed(1)
    : 0;
  const avgDuration = filtered.length
    ? (filtered.reduce((sum, d) => sum + d.duration_ms, 0) / filtered.length).toFixed(1)
    : 0;
  function maskIp(ip) {
    if (!ip) return "N/A";
    const parts = ip.split(".");
    if (parts.length !== 4) return "N/A";
    return `${parts[0]}.${parts[1]}.*.*`;
  }

  return html`
    <div style="padding: 16px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; font-family: sans-serif;">
      <h3 style="margin: 0 0 4px 0">${title}</h3>
      <div style="margin-bottom: 12px; color: #999; font-size: 12px; text-transform: uppercase;">
        ${level === "city" ? "City" : level === "region" ? "Region" : "Country"} view
      </div>

      <div style="margin-bottom: 12px; color: #555; font-size: 13px">
        ${filtered.length} requests &nbsp;|&nbsp;
        Success rate: ${successRate}% &nbsp;|&nbsp;
        Avg duration: ${avgDuration}ms
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px">
        <thead>
          <tr style="background: #eee">
            <th style="padding: 6px 8px; text-align: left">Time</th>
            <th style="padding: 6px 8px; text-align: left">Endpoint</th>
            <th style="padding: 6px 8px; text-align: left">Status</th>
            <th style="padding: 6px 8px; text-align: left">Duration</th>
            <th style="padding: 6px 8px; text-align: left">Success</th>
            <th style="padding: 6px 8px; text-align: left">IP</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(d => html`
            <tr style="border-bottom: 1px solid #eee">
              <td style="padding: 6px 8px">${new Date(d.time).toLocaleString("en-GB", {
                timeZone: "UTC",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              })} UTC</td>
              <td style="padding: 6px 8px">${d.endpoint}</td>
              <td style="padding: 6px 8px">${d.status}</td>
              <td style="padding: 6px 8px">${d.duration_ms.toFixed(1)}ms</td>
              <td style="padding: 6px 8px">${d.success ? "✓" : "✗"}</td>
              <td style="padding: 6px 8px">${maskIp(d.client_ip)}</td>
            </tr>
          `)}
        </tbody>
      </table>

      ${filtered.length === 0 ? html`
        <p style="color: #999; text-align: center">No requests in this time window</p>
      ` : ""}
    </div>
  `;
}


function _countryNameToAlpha3(world)
{
  const lookup = new Map();
  const geometries = world.objects.ne_50m_admin_0_map_units.geometries;
  for (const g of geometries) {
    const p = g.properties;
    if (!p) continue;
    // Map all name variants to ADM0_A3
    if (p.NAME)       lookup.set(p.NAME, p.ADM0_A3);
    if (p.NAME_LONG)  lookup.set(p.NAME_LONG, p.ADM0_A3);
    if (p.ADMIN)      lookup.set(p.ADMIN, p.ADM0_A3);
    if (p.FORMAL_EN)  lookup.set(p.FORMAL_EN, p.ADM0_A3);
    if (p.NAME_CIAWF) lookup.set(p.NAME_CIAWF, p.ADM0_A3);
  }
  // Manual overrides for known edge cases
  lookup.set("Occupied Palestinian Territory", "PSX");
  lookup.set("State Of Palestine", "PSX");
  lookup.set("United States", "USA");
  lookup.set("South Korea", "KOR");
  lookup.set("North Korea", "PRK");
  lookup.set("Russia", "RUS");
  lookup.set("Iran", "IRN");
  lookup.set("Syria", "SYR");
  lookup.set("Bolivia", "BOL");
  lookup.set("Tanzania", "TZA");
  lookup.set("Vietnam", "VNM");
  return lookup;
}


function _filteredCountryData(selectedWindow,d3,recentRequests,data,countryNameToAlpha3)
{
  const now = new Date();
  const cutoff = new Date(now);
  if (selectedWindow === "1d") cutoff.setDate(now.getDate() - 1);
  if (selectedWindow === "1m") cutoff.setMonth(now.getMonth() - 1);
  if (selectedWindow === "3m") cutoff.setMonth(now.getMonth() - 3);
  if (selectedWindow === "6m") cutoff.setMonth(now.getMonth() - 6);
  if (selectedWindow === "1y") cutoff.setFullYear(now.getFullYear() - 1);

  // Check if recentRequests covers this window
  const earliest = d3.min(recentRequests, d => new Date(d.time));
  const windowCovered = earliest <= cutoff;

  if (!windowCovered) {
    // Fall back to static all-time data
    return data.map(d => ({
      country: d.country,
      requests: d.requests
    }));
  }

  // Use recentRequests for covered windows
  const counts = d3.rollup(
    recentRequests.filter(d => new Date(d.time) >= cutoff),
    v => v.length,
    d => d.country
  );
  return [...counts.entries()].map(([country, requests]) => ({
    country: countryNameToAlpha3.get(country) || country,
    requests
  }));
}


function _filteredRegionData(selectedWindow,d3,recentRequests)
{
  const now = new Date();
  const cutoff = new Date(now);
  if (selectedWindow === "1d") cutoff.setDate(now.getDate() - 1);
  if (selectedWindow === "1m") cutoff.setMonth(now.getMonth() - 1);
  if (selectedWindow === "3m") cutoff.setMonth(now.getMonth() - 3);
  if (selectedWindow === "6m") cutoff.setMonth(now.getMonth() - 6);
  if (selectedWindow === "1y") cutoff.setFullYear(now.getFullYear() - 1);

  const counts = d3.rollup(
    recentRequests.filter(d => new Date(d.time) >= cutoff),
    v => v.length,
    d => d.country,
    d => d.region
  );

  const result = [];
  for (const [country, regionMap] of counts) {
    for (const [region, requests] of regionMap) {
      result.push({
        "country/region": country,
        "state/province": region,
        requests
      });
    }
  }
  return result;
}


function _filteredCityData(selectedWindow,d3,recentRequests,geocodedCities)
{
  const now = new Date();
  const cutoff = new Date(now);
  if (selectedWindow === "1d") cutoff.setDate(now.getDate() - 1);
  if (selectedWindow === "1m") cutoff.setMonth(now.getMonth() - 1);
  if (selectedWindow === "3m") cutoff.setMonth(now.getMonth() - 3);
  if (selectedWindow === "6m") cutoff.setMonth(now.getMonth() - 6);
  if (selectedWindow === "1y") cutoff.setFullYear(now.getFullYear() - 1);

  const counts = d3.rollup(
    recentRequests.filter(d => new Date(d.time) >= cutoff),
    v => v.length,
    d => d.city
  );

  return geocodedCities.map(d => ({
    ...d,
    requests: counts.get(d.city) || 0
  })).filter(d => d.requests > 0);
}


function _filteredRegionValuemap(filteredRegionData,regionCountryLookup){return(
new Map(
  filteredRegionData.map(d => [
    `${regionCountryLookup.get(d["country/region"])}|${d["state/province"]}`,
    d.requests
  ])
)
)}

function _dashboard(chart,html,detailPanel,viewofSelectedWindow)
{
  const mapNode = chart;
  
  const container = html`
    <div>
      <div style="margin-bottom:12px">${viewofSelectedWindow}</div>
      ${mapNode}
      ${detailPanel}
    </div>
  `;
  return container;
}


export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["ne_50m_admin_0_map_units@2.json", {url: new URL("./files/ne_50m_admin_0_map_units@2.json", import.meta.url), mimeType: "application/json", toString}],
    ["requests-by-country@5.json", {url: new URL("./files/requests-by-country@5.json", import.meta.url), mimeType: "application/json", toString}],
    ["requests-by-city@1.json", {url: new URL("./files/requests-by-city@1.json", import.meta.url), mimeType: "application/json", toString}],
    ["cities-geocoded.json", {url: new URL("./files/cities-geocoded.json", import.meta.url), mimeType: "application/json", toString}],
    ["requests-by-region-within-country.json", {url: new URL("./files/requests-by-region-within-country.json", import.meta.url), mimeType: "application/json", toString}],
    ["ne_10m_admin_1_states_provinces.json", {url: new URL("./files/ne_10m_admin_1_states_provinces.json", import.meta.url), mimeType: "application/json", toString}],
    ["recent-requests.json", {url: new URL("./files/recent-requests.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.define("initial selectedCountry", _selectedCountry);
  main.variable(null).define("mutable selectedCountry", ["Mutable", "initial selectedCountry"], (M, _) => new M(_));
  main.variable(null).define("selectedCountry", ["mutable selectedCountry"], _ => _.generator);
  main.define("initial selectedRegion", _selectedRegion);
  main.variable(null).define("mutable selectedRegion", ["Mutable", "initial selectedRegion"], (M, _) => new M(_));
  main.variable(null).define("selectedRegion", ["mutable selectedRegion"], _ => _.generator);
  main.define("initial selectedCity", _selectedCity);
  main.variable(null).define("mutable selectedCity", ["Mutable", "initial selectedCity"], (M, _) => new M(_));
  main.variable(null).define("selectedCity", ["mutable selectedCity"], _ => _.generator);
  main.variable(null).define("chart", ["d3","filteredCountryData","countries","filteredRegionData","filteredCityData","Legend","countrymesh","admin1Features","filteredRegionValuemap","geocodedCities","regionValuemap","mutable selectedCity","mutable selectedCountry","mutable selectedRegion","regionCountryLookup"], _chart);
  main.variable(null).define("data", ["FileAttachment"], _data);
  main.variable(null).define(["md"], _6);
  main.variable(null).define("world", ["FileAttachment"], _world);
  main.variable(null).define("countries", ["topojson","world"], _countries);
  main.variable(null).define(["md"], _9);
  main.variable(null).define("countrymesh", ["topojson","world"], _countrymesh);
  const child1 = runtime.module(define1);
  main.import("Legend", child1);
  main.variable(null).define("geocodeCity", _geocodeCity);
  main.variable(null).define("requestsByCity", ["FileAttachment"], _requestsByCity);
  main.variable(null).define("geocodedCities", ["FileAttachment","requestsByCity","geocodeCity"], _geocodedCities);
  main.variable(null).define("admin1", ["FileAttachment"], _admin1);
  main.variable(null).define("regionData", ["FileAttachment"], _regionData);
  main.variable(null).define("admin1Features", ["topojson","admin1"], _admin1Features);
  main.variable(null).define("regionCountryLookup", _regionCountryLookup);
  main.variable(null).define("regionValuemap", ["regionData","regionCountryLookup"], _regionValuemap);
  main.variable(null).define("recentRequests", ["FileAttachment"], _recentRequests);
  main.variable(null).define("viewof selectedWindow", ["Inputs"], _selectedWindow);
  main.variable(null).define("selectedWindow", ["Generators", "viewof selectedWindow"], (G, _) => G.input(_));
  main.variable(null).define("detailPanel", ["selectedCity","selectedRegion","selectedCountry","html","selectedWindow","recentRequests"], _detailPanel);
  main.variable(null).define("countryNameToAlpha3", ["world"], _countryNameToAlpha3);
  main.variable(null).define("filteredCountryData", ["selectedWindow","d3","recentRequests","data","countryNameToAlpha3"], _filteredCountryData);
  main.variable(null).define("filteredRegionData", ["selectedWindow","d3","recentRequests"], _filteredRegionData);
  main.variable(null).define("filteredCityData", ["selectedWindow","d3","recentRequests","geocodedCities"], _filteredCityData);
  main.variable(null).define("filteredRegionValuemap", ["filteredRegionData","regionCountryLookup"], _filteredRegionValuemap);
  main.variable(observer("dashboard")).define("dashboard", ["chart","html","detailPanel","viewof selectedWindow"], _dashboard);
  return main;
}
