#!/usr/bin/env bash

# NOTE: Set device key to a manually defined record (make sure you are already subscribed to the record as well)
baseUrl="http://localhost:7071/api"
key="RptEVbgeq6DJgGdKXxgNdD"

# Loop updating the record 51 times (1 minute of sleep in between)
emailsSent=0 # num of emails already sent
iterations=51 # num of emails to send this time

for i in $(seq 1 $iterations); do
  # Define a record to post
  ((emailsSent += 1))
  record=$(jq -n \
    --arg blobType "deviceRecord" \
    --arg description "email #$emailsSent" \
    --arg children_key "" \
    '$ARGS.named')

  echo -e "\nsending email number $emailsSent..."

  # Post a new record entry
  curl -X POST $baseUrl/provenance/$key \
    -F "provenanceRecord=$record"

  # Try to email subscribers about the new entry, and exit the loop on failure
  {
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST $baseUrl/notifySubscribers/$key \
      -F "provenanceRecord=$record")
    
    if [[ "$response" != "200" ]]; then
      echo -e "\nbad request! status code $response"
      break
    fi
  } || {
    echo -e "\nerror caught!"
    break
  }

  sleep 60
done

echo -e "\nemail send script complete!"