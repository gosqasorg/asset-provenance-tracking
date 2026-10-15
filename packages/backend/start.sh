#!/usr/bin/env bash

./stop.sh

./scripts/start-azurite.sh &
./scripts/start-shell.sh &
