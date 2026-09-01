# xbloom-api

Recipe backend for the xBloom guide page. Python 3.12 standard library only, one file.

Keep `recipe.html` beside `xbloom_api.py` or one directory above it. The server reads the page once at startup. Start it with `run.sh`, which reads the gateway token and then launches the server. Check it with `curl localhost:8018/health`, which answers `ok`.

The server calls one upstream: the openclaw gateway.

Environment:

- `OPENCLAW_GATEWAY_TOKEN`. Required. `run.sh` reads it from `~/.openclaw/openclaw.json` at `gateway.auth.token`. The server never logs the value. Without it the server prints one line to stderr and exits 1.
- `OPENCLAW_URL` (default `http://127.0.0.1:18789/v1/chat/completions`). Point it at a stub to test offline.
- `PORT` (default `8018`). The server binds `0.0.0.0`.

Routes: `POST /recipe` returns one clamped recipe as JSON. `GET /` and `GET /recipe.html` serve the recipe page. `GET /index.html` serves the guide page. A query string is ignored, so `/?mock=1` still serves the page. `GET /health` returns `ok`. Each IP gets 30 recipes per hour.
