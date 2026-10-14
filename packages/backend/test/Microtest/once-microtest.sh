#!/usr/bin/env bash

trap "kill 0" EXIT

npx tsc -w > /dev/null &

cd ../..
npm run microtest
cd -
