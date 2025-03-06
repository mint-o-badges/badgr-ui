#!/bin/bash

http=0
# Poll every 10s for maximum of 20 minutes
for i in $(seq 1 120)
do
    SECONDS=0
    http=$(curl https://$pr.coolify.openbadges.education/ --insecure -w "%{http_code}" -s -o /dev/null)
    if [ "$http" = 200 ]; then
        break
    fi
    to_sleep=$((10-$SECONDS))
    if [ "$to_sleep" -lt 0 ]; then
        to_sleep=0
    fi
    sleep "${to_sleep}s"
done

echo "final_http_code=$http"
