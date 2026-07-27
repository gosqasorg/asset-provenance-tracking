#!/usr/bin/env bash

#############
# Ensure correct node version is in use
#############

# 1. Load node
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Set node version
nvm alias default 22


#############
# Start GDT
#############

# 1. Ensure stopped
./stop.sh

# 2. Start frontend and backend
cd packages/backend
./start.sh &
cd -
cd packages/frontend
./start.sh &
cd -

