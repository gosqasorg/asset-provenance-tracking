#!/usr/bin/env bash

# Ensure stopped
./stop.sh

# Start frontend and backend
cd packages/backend
./start.sh &
cd -
cd packages/frontend
./start.sh &
cd -

