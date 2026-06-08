import json
import os
import pycountry

"""
This file transforms the data and normalizes JSON datasets
Ideally, this should be run after convert_azure_to_json.py 
"""

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


# ISO 3 special cases

SPECIAL_CASES = {
    "UK": "GBR",
    "United Kingdom": "GBR",
    "South Korea": "KOR",
    "North Korea": "PRK",
    "Russia": "RUS",
    "Vietnam": "VNM",
    "Iran": "IRN",
    "Syria": "SYR",
    "Venezuela": "VEN",
    "Bolivia": "BOL",
    "Tanzania": "TZA",
    "Moldova": "MDA",
    "Laos": "LAO",
    "Brunei": "BRN",
    "Czechia": "CZE",
    "State Of Palestine": "PSX",
    "Occupied Palestinian Territory": "PSX"
}


def get_iso3(country_name):
    if not country_name:
        return None

    if country_name in SPECIAL_CASES:
        return SPECIAL_CASES[country_name]

    try:
        return pycountry.countries.lookup(country_name).alpha_3
    except LookupError:
        print(f"Unknown country: {country_name}")
        return None



def normalize_countries(rows):

    # this normalizes the countries to reflect iso_3
    result = []

    for r in rows:
        country_name = r.get("ClientCountryOrRegion")
        requests = r.get("request_count", 0)

        iso = get_iso3(country_name)

        if iso:
            result.append({
                "country": iso,
                "requests": requests
            })

    aggregated = {}
    for item in result:
        country = item["country"]
        aggregated[country] = aggregated.get(country, 0) + item["requests"]


    result = [{"country": k, "requests": v} for k, v in aggregated.items()]
    return result



def process_requests_by_country(input_path, output_path):
    # Data Preprocessing for requests_by_country dataset
    raw = load_json(input_path)

    table = raw["tables"][0]
    rows = table["rows"] 

    clean = normalize_countries(rows=rows)

    write_json(output_path, clean)



def process_requests_by_endpoint(input_path, output_path):
    # Data Preprocessing for requests_by_endpoint dataset
    raw = load_json(input_path)

    table = raw["tables"][0]
    rows = table["rows"]

    clean = [
        {
            "endpoint": r.get("Name"),  
            "requests": r.get("request_count", 0)
        }
        for r in rows
        if r.get("Name") is not None
    ]

    write_json(output_path, clean)

def process_hourly_traffic_volume(input_path, output_path):
    # Data Preprocessing for hourly_traffic_volume dataset
    raw = load_json(input_path)

    table = raw["tables"][0]
    rows = table["rows"]

    clean = [
        {
            "time": r.get("TimeGenerated"),
            "requests": r.get("request_count", 0)
        }
        for r in rows
    ]

    write_json(output_path, clean)

def process_success_failure_endpoint(input_path, output_path):
    # Data Preprocessing for sucess_failure_endpoint dataset
    raw = load_json(input_path)

    table = raw["tables"][0]
    rows = table["rows"]

    clean = [
        {
            "endpoint": r.get("Name"),
            "total_requests": r.get("total", 0),
            "failures": r.get("failures", 0),
            "sucesses": r.get("total", 0) - r.get("failures", 0)
        }
        for r in rows
        if r.get("Name") is not None
    ]

    write_json(output_path, clean)

def process_requests_by_city(input_path, output_path):
    # Data Preprocessing for requests_by_city dataset
    raw = load_json(input_path)

    table = raw["tables"][0]
    rows = table["rows"]

    clean = [
        {
            "city": r.get("ClientCity"), 
            "state/province": r.get("ClientStateOrProvince", 0),
            "country/region": r.get("ClientCountryOrRegion", 0),
            "requests": r.get("request_count", 0)
        }
        for r in rows
        if r.get("ClientCity") is not None
        if r.get("ClientStateOrProvince") is not None
        if r.get("ClientCountryOrRegion") is not None
    ]

    write_json(output_path, clean)

def process_requests_by_region_within_country(input_path, output_path):
    # Data Preprocessing for requests_by_region_within_a_country dataset
    raw = load_json(input_path)

    table = raw["tables"][0]
    rows = table["rows"]

    clean = [
        {
            "country/region": r.get("ClientCountryOrRegion"),
            "state/province": r.get("ClientStateOrProvince"),
            "requests": r.get("request_count", 0)
        }
        for r in rows
        if r.get("ClientStateOrProvince") is not None
        if r.get("ClientCountryOrRegion") is not None
    ]

    write_json(output_path, clean)

def process_recent_requests(input_path, output_path):
    # Data Preprocessing for recent_requests dataset
    raw = load_json(input_path)

    table = raw["tables"][0]
    rows = table["rows"]

    clean = [
        {
            "time": r.get("TimeGenerated"),
            "endpoint": r.get("Name"),
            "url": r.get("Url"),
            "success": r.get("Success"),
            "status": r.get("ResultCode"),
            "duration_ms": r.get("DurationMs"),
            "country": r.get("ClientCountryOrRegion"),
            "city": r.get("ClientCity"),
            "region": r.get("ClientStateOrProvince"),
            "client_ip": r.get("ClientIP")
        }
        for r in rows
        if r.get("TimeGenerated") is not None
    ]

    # sort newest first
    clean.sort(key=lambda x: x["time"], reverse=True)

    write_json(output_path, clean)

def process_requests_by_ip(input_path, output_path):
    # Data Preprocessing for requests_by_ip dataset
    raw = load_json(input_path)

    table = raw["tables"][0]
    rows = table["rows"]

    clean = [
        {
            "ip": r.get("ClientIP"), 
            "requests": r.get("request_count", 0)
        }
        for r in rows
        if r.get("ClientIP") is not None
    ]

    write_json(output_path, clean)




if __name__ == "__main__":

    process_requests_by_country(
        "data-raw/json/requests-by-country.json",
        "data/requests-by-country.json"
    )

    # Add more when ready:
    # process_requests_by_endpoint(
    #     "data-raw/json/requests-by-endpoint.json",
    #     "data/requests-by-endpoint.json"
    # )

    # process_hourly_traffic_volume(
    #     "data-raw/json/hourly-traffic-volume.json",
    #     "data/hourly-traffic-volume.json"
    # )

    # process_success_failure_endpoint(
    #     "data-raw/json/success-failure-endpoint.json",
    #     "data/success-failure-endpoint.json"
    # )

    # process_requests_by_city(
    #     "data-raw/json/requests-by-city.json",
    #     "data/requests-by-city.json"
    # )

    # process_requests_by_region_within_country(
    #     "data-raw/json/requests-by-region-within-country.json",
    #     "data/requests-by-region-within-country.json"
    # )

    # process_recent_requests(
    #     "data-raw/json/recent-requests.json",
    #     "data/recent-requests.json"
    # )

    # process_requests_by_ip(
    #     "data-raw/json/requests-by-ip.json",
    #     "data/requests-by-ip.json"
    # )

    print("Data preprocessing completed!")
