#!/usr/bin/env npx tsx

import { runQuery } from './utils.ts'

let query = "AppRequests \
| where TimeGenerated > ago(90d) \
| summarize requestCount=sum(ItemCount) by Name"

let response = await runQuery(query)
console.table(JSON.stringify(response.tables[0].rows, null, 2))
console.table(response.tables[0].rows)
