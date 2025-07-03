#!/usr/bin/env bash

if [ ! -d 'azurite_path.ignore' ]; then
    mkdir azurite_path.ignore
fi

azurite --location azurite_path.ignore &
