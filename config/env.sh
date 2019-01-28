#!/bin/sh
export SERVICE_PORT='8080'
export LOG_LEVEL='debug'
export MONITORED_URLS='[{"name": "shoreline", "url":"http://localhost:8009/auth/status"},{"name": "gatekeeper", "url":"http://localhost:8009/access/status"},{"name": "tide-whisperer", "url":"http://localhost:8009/data/status"}]'