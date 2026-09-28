# xbloom-api

Recipe backend for the xBloom guide page. Python 3.12 standard library only, one file.

Keep `recipe.html` beside `xbloom_api.py` or one directory above it. The server reads the page once at startup. Start it with `run.sh`, which loads credentials and then launches the server. Check it with `curl localhost:8018/health`, which answers `ok`.

The server picks one upstream at startup and keeps it until restart:

1. Anthropic Messages API, model `claude-opus-5-5`, when `ANTHROPIC_API_KEY` is set.
2. Claude Code CLI (`claude -p --model opus`), when `CLAUDE_BIN` points at an executable. The CLI reads `CLAUDE_CODE_OAUTH_TOKEN` from the environment.
3. The openclaw gateway otherwise.

The startup log line names the choice, for example `xbloom_api on 0.0.0.0:8018 upstream=anthropic`. The prompt and the clamp are the same for all three.

`run.sh` sources `~/.claude-env` if it exists. Put `ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN` there, never in `run.sh`. `run.sh` sets `CLAUDE_BIN` when `~/.local/bin/claude` is executable. It reads the openclaw token only when `~/.openclaw/openclaw.json` exists.

Environment:

- `ANTHROPIC_API_KEY`. Selects the Anthropic upstream. The server never logs the value.
- `ANTHROPIC_URL` (default `https://api.anthropic.com/v1/messages`). Point it at a stub to test offline.
- `CLAUDE_BIN`. Path to the Claude Code CLI. The server sends the prompt on stdin and logs only the exit code and byte counts.
- `OPENCLAW_GATEWAY_TOKEN`. Needed only when neither of the above is set. `run.sh` reads it from `~/.openclaw/openclaw.json` at `gateway.auth.token`. The server never logs the value. If openclaw is the upstream and the token is missing, the server prints one line to stderr and exits 1.
- `OPENCLAW_URL` (default `http://127.0.0.1:18789/v1/chat/completions`). Point it at a stub to test offline.
- `PORT` (default `8018`). The server binds `0.0.0.0`.

Routes: `POST /recipe` returns one clamped recipe as JSON. `GET /` and `GET /recipe.html` serve the recipe page. `GET /index.html` serves the guide page. A query string is ignored, so `/?mock=1` still serves the page. `GET /health` returns `ok`. `GET /upstream` returns `{"upstream": "anthropic"}` (or `claude-cli`, `openclaw`) without a model call. Each IP gets 30 recipes per hour.
