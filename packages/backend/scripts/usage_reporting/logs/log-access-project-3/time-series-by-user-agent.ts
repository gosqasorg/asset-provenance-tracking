#!/usr/bin/env npx tsx

import { runQuery } from './utils.ts'

let filterColumns = '| project TimeGenerated, Name, ResultCode, ClientType, ClientCity, ClientStateOrProvince, ClientCountryOrRegion, ua, UserBrowsers'

let queryBots = `
    AppRequests
    | extend ua = tostring(parse_json(Properties)["user_agent.original"])
    | extend UserBrowsers = case(
        ua contains "ClaudeBot", "ClaudeBot",
        ua contains "Googlebot", "Googlebot",
        ua contains "bingbot", "Bingbot",
        ua contains "Baiduspider", "Baiduspider",
        ua contains "bot" or ua contains "crawler" or ua contains "spider", "Other bot",
        ""
    )
    | sort by TimeGenerated desc
    | where UserBrowsers != ""
` + filterColumns

let queryTools = `
    AppRequests
    | extend ua = tostring(parse_json(Properties)["user_agent.original"])
    | extend UserBrowsers = case(
        ua contains "curl", "curl",
        ua contains "node", "Node",
        ua contains "python" or ua contains "Python", "Python",
        ua contains ".NET", ".NET",
        ""
    )
    | sort by TimeGenerated desc
    | where UserBrowsers != ""
` + filterColumns

let queryBrowsers = `
    AppRequests
    | extend ua = tostring(parse_json(Properties)["user_agent.original"])
    | extend UserBrowsers = case(
        ua contains "MSIE" or ua contains "Trident", "Internet Explorer",
        ua contains "Edg/", "Edge",
        ua contains "Chrome", "Chrome",
        ua contains "Firefox", "Firefox",
        ua contains "Safari", "Safari",
        ua contains "DuckDuckGo", "DuckDuckGo",
        ""
    )
    | sort by TimeGenerated desc
    | where UserBrowsers != ""
` + filterColumns

let queryUncategorizable = `
    AppRequests
    | extend ua = tostring(parse_json(Properties)["user_agent.original"])
    | extend UserBrowsers = case(
        ua == "", "Unknown",
        "Other"
    )
    | sort by TimeGenerated desc
` + filterColumns


let response = await runQuery(queryBrowsers)
console.log(response)
let data = response.tables[0]
console.log(data.columns)
console.log(data.rows)
