#!/usr/bin/env npx tsx

import { runQuery } from './utils.ts'

async function getEndpoints() {
    let query = "AppRequests \
    | where TimeGenerated > ago(90d) \
    | summarize requestCount=sum(ItemCount) by Name \
    | order by Name asc"
    
    let response = await runQuery(query)
    let data = response.tables[0].rows
    
    let endpoints = []
    for(const datum of data) {
        endpoints.push(datum[0])
    }

    return endpoints
}

async function getTimeSeriesForEndpoint(an_endpoint) {
    // Note: endpoints[11] is postProvenance
    let query = `set notruncation; AppRequests \
    | where TimeGenerated > ago(90d) \
    | where Name == '${an_endpoint}' \
    | summarize requestCount=sum(ItemCount) by bin(TimeGenerated, 1d) \
    |order by TimeGenerated desc`
    
    let response = await runQuery(query)
    let data = response.tables[0].rows

    return data
}

let endpoints = await getEndpoints()
console.table(endpoints)

const data = await getTimeSeriesForEndpoint('postProvenance')
console.table(data)

// Sanity check
// Presently we're showing 50 days of use over the last 90
// A suspicious number
// Show that the number of invocations we're seeing here matches what we're
// seeing for the barchart of invocation counts.
let count = 0
for(const datum of data) {
        count += datum[1]
}
console.log(`Total invocation count: ${count}`)
