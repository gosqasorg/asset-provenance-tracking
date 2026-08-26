#!/usr/bin/env bash

./stop.sh
npm install
./scripts/start-azurite.sh &
./scripts/start-shell.sh &
