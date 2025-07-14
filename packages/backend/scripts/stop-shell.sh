#!/usr/bin/env bash

if [ "$(lsof -i :7071 | wc -l)" -eq 0 ]; then 
    echo 'Shell not seen to be running'
    exit 1
fi

lsof -i :7071 -P | grep 7071 | sed 's,^[^0-9]*\([^ ]*\)  *.*$,\1,' | xargs kill -SIGKILL
