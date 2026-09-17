#!/usr/bin/env bash

if [ ! -d 'azurite_path.ignore' ]; then
    mkdir azurite_path.ignore
fi

azurite --silent --skipApiVersionCheck --location azurite_path.ignore &
