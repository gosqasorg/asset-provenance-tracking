#!/usr/bin/env bash

echo 'Starting frontend...'

export BACKEND_URL=http://localhost:7071/api

npm i && npm run dev
