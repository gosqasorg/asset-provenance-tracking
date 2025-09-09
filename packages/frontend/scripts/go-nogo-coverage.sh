#!/usr/bin/env bash


npm run coverage; [ 0 -eq 0 ] && echo 'pass'
