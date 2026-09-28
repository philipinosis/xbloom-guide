#!/bin/sh
# Upstream order: ANTHROPIC_API_KEY, then CLAUDE_BIN, then openclaw. Keys live in ~/.claude-env, never here.
[ -f "$HOME/.claude-env" ] && . "$HOME/.claude-env"
[ -x "$HOME/.local/bin/claude" ] && export CLAUDE_BIN="$HOME/.local/bin/claude"
[ -n "$ANTHROPIC_API_KEY" ] && export ANTHROPIC_API_KEY
[ -n "$CLAUDE_CODE_OAUTH_TOKEN" ] && export CLAUDE_CODE_OAUTH_TOKEN
if [ -f "$HOME/.openclaw/openclaw.json" ]; then
  OPENCLAW_GATEWAY_TOKEN="$(python3 -c 'import json,os;print(json.load(open(os.path.expanduser("~/.openclaw/openclaw.json")))["gateway"]["auth"]["token"])' 2>/dev/null)"
  [ -n "$OPENCLAW_GATEWAY_TOKEN" ] && export OPENCLAW_GATEWAY_TOKEN
fi
exec /usr/bin/python3 ~/xbloom-api/xbloom_api.py
