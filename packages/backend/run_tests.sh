#!/usr/bin/env bash


# Get azure default env vars
eval $(cat local.settings.json | grep -i azure | egrep -vi 'comment|index' | sed 's,^  *,,' | sed 's,",,g' | sed 's/,//' | sed 's,: ,=,' | sed "s,=,=\'," | sed "s,$,',"  | sed 's,^,export ,')


# Run integration tests: tests/functions/httptrigger.endpoints.spec.ts
npx vitest run


# Run unit tests: test/test.ts
npx tsx ./test/integrationTests.ts --put
npx tsx ./test/integrationTests.ts
npx tsx ./test/integrationTests.ts --statistics
    
