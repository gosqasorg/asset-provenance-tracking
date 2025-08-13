#!/usr/bin/env bash

cd packages/backend
./start.sh &
cd -
cd packages/frontend
./start.sh &
cd -

