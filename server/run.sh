#!/bin/sh
OPENCLAW_GATEWAY_TOKEN="$(python3 -c 'import json,os;print(json.load(open(os.path.expanduser("~/.openclaw/openclaw.json")))["gateway"]["auth"]["token"])')"
export OPENCLAW_GATEWAY_TOKEN
exec /usr/bin/python3 ~/xbloom-api/xbloom_api.py
