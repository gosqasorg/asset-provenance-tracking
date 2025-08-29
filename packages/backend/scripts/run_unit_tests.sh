#!/usr/bin/env bash

# Get azure default env vars
eval $(cat local.settings.json | grep -i azure | egrep -vi 'comment|index' | sed 's,^  *,,' | sed 's,",,g' | sed 's/,//' | sed 's,: ,=,' | sed "s,=,=\'," | sed "s,$,',"  | sed 's,^,export ,')

# Run unit tests: tests/functions/httptrigger.endpoints.spec.ts
npx vitest run test/functions/httpTrigger.endpoints.spec.ts

