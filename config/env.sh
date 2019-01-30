#!/bin/sh
echo 'load health check config'
export SERVICE_PORT='9180'
export MONITORED_URLS="[
    {\"name\": \"blip\", \"url\":\"http://${BLIP_HOST}:${BLIP_PORT_PREFIX}3000\"},
    {\"name\": \"gatekeeper\", \"url\":\"http://${GATEKEEPER_HOST}:${GATEKEEPER_PORT_PREFIX}9123/status\"},
    {\"name\": \"hakken\", \"url\":\"http://${HAKKEN_HOST}:${HAKKEN_PORT_PREFIX}8000/status\"},
    {\"name\": \"highwater\", \"url\":\"http://${HIGHWATER_HOST}:${HIGHWATER_PORT_PREFIX}9191/status\"},
    {\"name\": \"hydrophone\", \"url\":\"http://${HYDROPHONE_HOST}:${HYDROPHONE_PORT_PREFIX}9157/status\"},
    {\"name\": \"highwater\", \"url\":\"http://${HIGHWATER_HOST}:${HIGHWATER_PORT_PREFIX}9191/status\"},
    {\"name\": \"hydrophone\", \"url\":\"http://${HYDROPHONE_HOST}:${HYDROPHONE_PORT_PREFIX}9157/status\"},
    {\"name\": \"message-api\", \"url\":\"http://${MESSAGE_API_HOST}:${MESSAGE_API_PORT_PREFIX}9119/status\"},
    {\"name\": \"platform auth\", \"url\":\"http://${PLATFORM_AUTH_HOST}:9222/status\"},
    {\"name\": \"platform user\", \"url\":\"http://${PLATFORM_USER_HOST}:9221/status\"},
    {\"name\": \"platform data\", \"url\":\"http://${PLATFORM_DATA_HOST}:9220/status\"},
    {\"name\": \"platform notification\", \"url\":\"http://${PLATFORM_NOTIFICATION_HOST}:9223/status\"},
    {\"name\": \"platform task\", \"url\":\"http://${PLATFORM_TASK_HOST}:9224/status\"},
    {\"name\": \"seagull\", \"url\":\"http://${SEAGULL_HOST}:${SEAGULL_PORT_PREFIX}9120/status\"},
    {\"name\": \"shoreline\", \"url\":\"http://${SHORELINE_HOST}:${SHORELINE_PORT_PREFIX}9107/status\"},
    {\"name\": \"tide-whisperer\", \"url\":\"http://${TIDE_WHISPERER_HOST}:${TIDE_WHISPERER_PORT_PREFIX}9127/status\"}
    ]"

# there is no status url for confirm-email, portal and mis apis
