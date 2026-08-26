#!/usr/bin/env bash

# Something we need everyone to run
git update-index --skip-worktree packages/backend/local.settings.json

#############
# Ensure correct node version is in use
#############

# 1. Load node
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Set node version
nvm alias default 22


#############
# Install modules
#############

./npm-install-everything.sh


#############
# Start GDT
#############

# 1. Ensure stopped
./stop.sh

# 2. Start frontend and backend
cd packages/backend
npm run build
./start.sh &
cd -
cd packages/frontend
npm run build
./start.sh &
cd -

