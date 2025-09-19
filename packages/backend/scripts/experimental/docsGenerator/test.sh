#!/usr/bin/env bash

npx tsx experimental/docsGenerator/translateAzureToSwagger.ts experimental/docsGenerator/httpTrigger.ts \
    ../api-docs/openAPI-docs.yaml

