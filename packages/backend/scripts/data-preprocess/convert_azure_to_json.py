import json
import os
import ast

"""
This file converts Azure dataset to JSON. 
Ideally, this should be run before preprocess_json_data.py 
"""


def load_azure_file(path):
    """
    Handles Azure export format (Python dict style with single quotes)
    """
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    # Convert Python-style dict to Python object
    return ast.literal_eval(text)


def convert_table_to_objects(table):
    columns = [c["name"] for c in table["columns"]]
    rows = table["rows"]

    cleaned_rows = []

    for row in rows:
        obj = {}

        for i, col in enumerate(columns):
            if i < len(row):
                obj[col] = row[i]
            else:
                obj[col] = None

        cleaned_rows.append(obj)

    return cleaned_rows


if __name__ == "__main__":
    input_file = "data-raw/azure/recent-requests.txt" # paste your desired input file path here
    output_file = "data-raw/json/recent-requests1.json" # paste your desire output file path here

    raw = load_azure_file(input_file)

    table = raw["tables"][0]

    cleaned = convert_table_to_objects(table)

    result = {
        "tables": [
            {
                "rows": cleaned
            }
        ]
    }

    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"Converted {len(cleaned)} rows")

