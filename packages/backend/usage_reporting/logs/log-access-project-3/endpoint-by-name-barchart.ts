#!/usr/bin/env npx tsx

import { runQuery } from './utils.ts'

let query = "AppRequests \
| where TimeGenerated > ago(90d) \
| summarize requestCount=sum(ItemCount) by Name \
| order by requestCount desc"

let response = await runQuery(query)
console.table(response.tables[0].rows)
