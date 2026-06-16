#!/usr/bin/env bash

npm i
./scripts/start-azurite.sh &
./scripts/start-shell.sh &
