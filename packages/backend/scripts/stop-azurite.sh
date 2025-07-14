#!/usr/bin/env bash

if [ "$(lsof -i :10000 | wc -l)" -eq 0 ]; then 
    echo 'Azurite not seen to be running'
    exit 1
fi

lsof -i :10000 -P | grep 10000 | sed 's,^[^0-9]*\([^ ]*\)  *.*$,\1,' | xargs kill
