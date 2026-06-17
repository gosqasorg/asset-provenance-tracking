#!/usr/bin/env bash

./stop.sh

npm i
./scripts/start-azurite.sh &
./scripts/start-shell.sh &
