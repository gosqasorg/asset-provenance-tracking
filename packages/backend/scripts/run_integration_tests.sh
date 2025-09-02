#!/usr/bin/env bash

# Note: needs Azurite running

# Run integration tests: test/test.ts
npx tsx ./test/integrationTests.ts --put
npx tsx ./test/integrationTests.ts
npx tsx ./test/integrationTests.ts --statistics

