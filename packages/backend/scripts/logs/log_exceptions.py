import requests

directory_id = "2cdccd46-d3ed-4eeb-ab6d-3c580f10014d"
app_registration_id = "11825a45-727c-489a-bf19-4a7ea72894a7"
secret_value = "UrF8Q~mZchNHMKDf1hYlh0Jp4P3cFItvOoZEScSK"

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
workspace_id = "f26c73b7-a547-497e-a33f-6f8f0b125fe3"

def run_query(label, query):
    result = requests.post(
        f"https://api.loganalytics.io/v1/workspaces/{workspace_id}/query",
        headers={"Authorization": f"Bearer {token}"},
        json={"query": query}
    )
    print(f"\n===** {label} **===")
    print(result.json())

run_query(
    "Recent Exceptions",
    "AppExceptions | where TimeGenerated > ago(7d) | order by TimeGenerated desc | limit 20"
)
