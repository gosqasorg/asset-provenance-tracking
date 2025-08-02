#!/usr/bin/env bash

cd packages/backend
./stop.sh &
cd -
cd packages/frontend
./stop.sh &
cd -

