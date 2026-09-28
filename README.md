# xBloom guide

A one-page site for beginners with an xBloom coffee maker. It explains how pour-over
brewing works, what each xBloom setting does, and has a recipe builder that produces
the numbers you enter in the xBloom app.

- `index.html` — the guide. No build step, no dependencies.
- `recipe.html` — the Recipe Advisor. Type a coffee, pick roast, cups, strength and
  machine, get a recipe in app order with tasting notes and an adjust-to-taste chart.
  It tries four paths in order: Claude on claude.ai (Artifact copy only), Claude Opus 5.5
  with the key you paste under "Connect Claude", the recipe server set in "Server URL",
  and last the fact-sheet rules in the browser. Each card says which one wrote it.
  Details in [`FACTS.md`](FACTS.md#recipe-backends).
  In Chrome on a Mac or an Android phone the page can send the recipe straight to a Studio
  over Bluetooth (`ble.js`).
  Send to my app pushes the recipe into the xBloom app library through the cloud API
  (`cloud.js`) once you paste your key.
- `server/` — the recipe backend (Python standard library, one file). See `server/README.md`.
- `FACTS.md` — the sourced fact sheet every number comes from.

Hosted on GitHub Pages from `main`. Not affiliated with xBloom.
