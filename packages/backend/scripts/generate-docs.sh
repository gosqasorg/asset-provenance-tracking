#!/usr/bin/env bash

npx tsx experimental/docsGenerator/translateAzureToSwagger.ts ../src/functions/httpTrigger.ts \
    ../api-docs/openAPI-docs.yaml