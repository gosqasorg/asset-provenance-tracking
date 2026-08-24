#!/usr/bin/env bash

trap "kill 0" EXIT

npx tsc -w > /dev/null &

cd ../..

while true; do
    npm run microtest
    sleep 5
done

cd -