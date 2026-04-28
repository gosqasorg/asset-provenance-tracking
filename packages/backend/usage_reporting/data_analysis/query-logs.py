#!/usr/bin/env uv run

import json
from os import environ

import requests
from dotenv import load_dotenv

load_dotenv()

directory_id = environ['directory_id']
app_registration_id = environ['app_registration_id']
secret_value = environ['secret_value']
workspace_id = environ['workspace_id']


def get_token():
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

    return token


def prettify_json(func):
    def wrapper(*args, **kwargs):
        some_dictionary = func(*args, **kwargs)
        return json.dumps(some_dictionary, indent=4)
    return wrapper


@prettify_json
def logs_hello_world(token):
    logs = requests.post(
        f"https://api.loganalytics.io/v1/workspaces/{workspace_id}/query",
        headers={"Authorization": f"Bearer {token}"},
        json={"query": "FunctionAppLogs | where TimeGenerated > ago(24h) | order by TimeGenerated desc"}
    )

    return logs.json()


@prettify_json
def run_query(token, label, query):
    return requests.post(
        f"https://api.loganalytics.io/v1/workspaces/{workspace_id}/query",
        headers={"Authorization": f"Bearer {token}"},
        json={"query": query}
    ).json()
   

if __name__ == '__main__':
    token = get_token()
    logs = logs_hello_world(token)
    print(logs)

    logs = run_query(
        token, 
        "Traces",
        "AppTraces | where TimeGenerated > ago(7d) | order by TimeGenerated desc | limit 20"
    )

    print(logs)

    print(run_query(
        token, 
        "Recent Requests",
        "AppRequests | where TimeGenerated > ago(7d) | order by TimeGenerated desc | limit 20"
    ))
    
    print(run_query(
        token, 
        "Requests by IP",
        "AppRequests | where TimeGenerated > ago(7d) | summarize request_count = count() by ClientIP | order by request_count desc"
    ))
    
    print(run_query(
        token, 
        "Requests by Country",
        "AppRequests | where TimeGenerated > ago(7d) | summarize request_count = count() by ClientCountryOrRegion | order by request_count desc"
    ))
    
    print(run_query(
        token, 
        "Recent Exceptions",
        "AppExceptions | where TimeGenerated > ago(7d) | order by TimeGenerated desc | limit 20"
    ))


