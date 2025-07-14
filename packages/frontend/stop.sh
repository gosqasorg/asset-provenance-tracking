#!/usr/bin/env bash


#!/usr/bin/env bash

if [ "$(lsof -i :3000 | wc -l)" -eq 0 ]; then
    echo 'Local Frontend not seen to be running'
    exit 1
fi

lsof -i :3000 -P | grep 3000 | sed 's,^[^0-9]*\([^ ]*\)  *.*$,\1,' | xargs kill
