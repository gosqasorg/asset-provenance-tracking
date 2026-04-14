import requests


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

# --- AppTraces ---
run_query(
    "Recent Traces",
    "AppTraces | where TimeGenerated > ago(7d) | order by TimeGenerated desc | limit 20"
)

run_query(
    "Traces by Severity",
    "AppTraces | where TimeGenerated > ago(7d) | summarize count() by SeverityLevel | order by count_ desc"
)

run_query(
    "Traces by Function",
    "AppTraces | where TimeGenerated > ago(7d) | summarize count() by OperationName | order by count_ desc"
)

run_query(
    "Unique Devices from Traces",
    """AppTraces
    | where TimeGenerated > ago(30d)
    | where Message contains 'deviceID'
    | extend deviceID = extract('deviceID.*?([a-f0-9]{64})', 1, Message)
    | where isnotempty(deviceID)
    | summarize dcount(deviceID) by bin(TimeGenerated, 1d)
    | order by TimeGenerated asc"""
)

# run_query(
#     "Exposed Device Keys",
#     "AppTraces | where TimeGenerated > ago(7d) | where Message contains 'deviceKey' | project TimeGenerated, Message, OperationName | order by TimeGenerated desc"
# )