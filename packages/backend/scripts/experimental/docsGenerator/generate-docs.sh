#!/usr/bin/env bash

npx tsx translateAzureToSwagger.ts ../src/functions/httpTrigger.ts \
    ../api-docs/experimental-generated-openAPI-docs.yaml
