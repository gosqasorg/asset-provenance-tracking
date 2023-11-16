#!/bin/bash
# on a mac:
# brew install qr
# brew install qrencode

BASE_SERVER="https://gosqas.org"
# BASE_SERVER="http://0.0.0.0:8000"
NUMBER_KEYS=$1

# This is a big complicated. Note that the last part fo the pipleline creates a file without
# putting a ".png" on the name
curl -H "Content-Type: application/x-www-form-urlencoded" -X GET $BASE_SERVER/manykeys/"MakerFaireBayArea"/$NUMBER_KEYS | jq '.keys .[]' | xargs -L1 -I'{}' qrencode -o {} $BASE_SERVER/provenance/{}
