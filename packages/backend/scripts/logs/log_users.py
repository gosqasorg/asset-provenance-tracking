import json
from os import environ

import requests
from dotenv import load_dotenv

load_dotenv()

directory_id=environ['directory_id']
app_registration_id=environ['app_registration_id']
secret_value=environ['secret_value']
workspace_id=environ['workspace_id']

response = requests.post(
    f"https://login.microsoftonline.com/{directory_id}/oauth2/v2.0/token",
    data={
        "client_id": app_registration_id,
        "client_secret": secret_value,
        "grant_type": "client_credentials",
        "scope": "https://api.loganalytics.io/.default"
    }
)

token = response.json()["access_token"]

def run_query(label, query):
    result = requests.post(
        f"https://api.loganalytics.io/v1/workspaces/{workspace_id}/query",
        headers={"Authorization": f"Bearer {token}"},
        json={"query": query}
    )
    print(f"\n===** {label} **===")
    print(result.json())

# Run a query that filters out bots
run_query(
    "Non-Bot Users",
    """AppRequests
    | where TimeGenerated > ago(999d)
    | extend ua = tostring(parse_json(Properties)["user_agent.original"])
    | extend UserBrowsers = case(
        ua contains "ClaudeBot", "ClaudeBot",
        ua contains "Googlebot", "Googlebot",
        ua contains "bingbot", "Bingbot",
        ua contains "Baiduspider", "Baiduspider",
        ua contains "bot" or ua contains "crawler" or ua contains "spider", "Other bot",
        ua contains "curl", "curl",
        ua contains "node", "Node",
        ua contains "python" or ua contains "Python", "Python",
        ua contains "MSIE" or ua contains "Trident", "Internet Explorer",
        ua contains ".NET", ".NET",
        ua contains "Edg/", "Edge",
        ua contains "Chrome", "Chrome",
        ua contains "Firefox", "Firefox",
        ua contains "Safari", "Safari",
        ua contains "DuckDuckGo", "DuckDuckGo",
        ua == "", "Unknown",
        "Other"
    )
    | where UserBrowsers !contains "bot"
    | summarize count() by UserBrowsers
    | order by count_ desc"""
)

# Run a query that filters out dev users
dev_users = ['Durham', 'Quincy'] # Note: these are just example cities, real cities go in an env variable in .env
run_query(
    "Non-Dev Users",
    f"""AppRequests
    | where TimeGenerated > ago(999d)
    | where not(ClientCity has_any (dynamic({dev_users})))
    | summarize count() by ClientCity
    | order by count_ desc"""
)

run_query(
    "Non-Bot And Non-Dev Users",
    f"""AppRequests
    | where TimeGenerated > ago(999d)
    | where not(ClientCity has_any (dynamic({environ['dev_cities']})))
    | extend ua = tostring(parse_json(Properties)["user_agent.original"])
    | extend UserBrowsers = case(
        ua contains "ClaudeBot", "ClaudeBot",
        ua contains "Googlebot", "Googlebot",
        ua contains "bingbot", "Bingbot",
        ua contains "Baiduspider", "Baiduspider",
        ua contains "bot" or ua contains "crawler" or ua contains "spider", "Other bot",
        ua contains "curl", "curl",
        ua contains "node", "Node",
        ua contains "python" or ua contains "Python", "Python",
        ua contains "MSIE" or ua contains "Trident", "Internet Explorer",
        ua contains ".NET", ".NET",
        ua contains "Edg/", "Edge",
        ua contains "Chrome", "Chrome",
        ua contains "Firefox", "Firefox",
        ua contains "Safari", "Safari",
        ua contains "DuckDuckGo", "DuckDuckGo",
        ua == "", "Unknown",
        "Other"
    )
    | where UserBrowsers !contains "bot"
    | summarize count() by ClientCity
    | order by count_ desc"""
)
