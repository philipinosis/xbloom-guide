# xBloom guide

A one-page site for beginners with an xBloom coffee maker. It explains how pour-over
brewing works, what each xBloom setting does, and has a recipe builder that produces
the numbers you enter in the xBloom app.

- `index.html` — the guide. No build step, no dependencies.
- `recipe.html` — the Recipe Advisor. Type a coffee, pick roast, cups, strength and
  machine, get a recipe in app order with tasting notes and an adjust-to-taste chart.
  It asks a model when one is reachable (claude.ai, or the server below) and otherwise
  builds the recipe from the fact-sheet rules in the browser.
- `server/` — the recipe backend (Python standard library, one file). See `server/README.md`.
- `FACTS.md` — the sourced fact sheet every number comes from.

Hosted on GitHub Pages from `main`. Not affiliated with xBloom.
