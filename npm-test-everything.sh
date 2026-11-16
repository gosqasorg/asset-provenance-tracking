#!/usr/bin/env bash

cd packages/backend && npm run test-noninteractive && cd -
cd packages/frontend && npm run test-noninteractive && cd -
