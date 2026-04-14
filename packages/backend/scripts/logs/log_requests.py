import requests

directory_id = process.env["directory_id"]
app_registration_id = process.env["app_registration_id"]
secret_value = process.env["secret_value"]

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

run_query(
    "Recent Requests",
    "AppRequests | where TimeGenerated > ago(14d) | order by TimeGenerated desc | limit 20"
)

run_query(
    "Requests by IP",
    "AppRequests | where TimeGenerated > ago(14d) | summarize request_count = count() by ClientIP | order by request_count desc"
)

run_query(
    "Requests by Country",
    "AppRequests | where TimeGenerated > ago(30d) | summarize request_count = count() by ClientCountryOrRegion | order by request_count desc"
)

run_query(
    "Requests by Endpoint",
    "AppRequests | where TimeGenerated > ago(7d) | summarize request_count = count() by Name | order by request_count desc"
)

run_query(
    "Hourly Traffic Volume",
    "AppRequests | where TimeGenerated > ago(7d) | summarize request_count = count() by bin(TimeGenerated, 1h) | order by TimeGenerated asc"
)

run_query(
    "Requests by City",
    "AppRequests | where TimeGenerated > ago(30d) | summarize request_count = count() by ClientCity, ClientStateOrProvince, ClientCountryOrRegion | order by request_count desc"
)

run_query(
    "Requests by Region within Country",
    "AppRequests | where TimeGenerated > ago(30d) | summarize request_count = count() by ClientCountryOrRegion, ClientStateOrProvince | order by ClientCountryOrRegion asc, request_count desc"
)