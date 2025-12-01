#!/usr/bin/env bash

# Generate OpenAPI YAML
npx tsx translateAzureToSwagger.ts ../../../src/functions/httpTrigger.ts ../../../api-docs/openAPI-docs.yaml

echo "OpenAPI docs generated: YAML -> api-docs/openAPI-docs.yaml"

# Convert YAML to JSON for frontend
node -e "const yaml = require('./node_modules/js-yaml'); const fs = require('fs'); const doc = yaml.load(fs.readFileSync('../../../api-docs/openAPI-docs.yaml', 'utf8')); fs.writeFileSync('../../../../frontend/public/openAPI-docs.json', JSON.stringify(doc, null, 2));"

echo "OpenAPI docs generated: JSON -> frontend/public/openAPI-docs.json"
