#!/usr/bin/env bash

# TODO:
# DONE -- FIRST get the script to update a record that we are NOT subscribe to
# -- THEN get the script to update a record that I am subscribed to (subscribe and update once, then run the loop only once to see if email sends)
# -- FINALLY can loop it (monitor first 51 to make sure 1 min is long enough, then let the rest run on it's own)



# Set device key to the manually defined record (make sure you are already subscribed to the record as well)
# key="RptEVbgeq6DJgGdKXxgNdD"
key="HZa9Q9vp1o8nU3WcKgpNwi" # *TODO: dev test record so we can keep our regular record clean (remove when done)

# Loop updating the record 51 times (1 minute sleep in between)
emailsSent=0 # num of emails already sent
iterations=1 # num of emails to send this time (51 * 9 = 459 emails to send total, DO THE FIRST 51 SEPARATELY)

for i in $(seq 1 $iterations); do
  # Define a record to post
  ((emailsSent += 1))
  record=$(jq -n \
    --arg blobType "deviceRecord" \
    --arg description "email #$emailsSent" \
    --arg children_key "" \
    '$ARGS.named')

  echo "Record stored: $record"

  # NOTE: We probably should not put the raw dev backend url in the script!! Find another way!!!
  curl -X POST http://localhost:7071/api/provenance/$key \
    -F "provenanceRecord=$record"

  echo "done!"
  sleep 60
done