# Leonida Platinum — GTA VI Trophy Guide & Tracker

An offline web app that guides and tracks all 55 PlayStation 5 trophies of
Grand Theft Auto VI: every trophy with its official name, description and grade,
a guide written in our own words with its sources named, a roadmap to the
platinum in six phases, missable flags, and a checklist that saves in the
browser. It runs from its own files and makes no network requests.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Files

- `app/index.html` — the page: header with progress, tabs, filters, checklist.
- `app/app.js` — the tracker: localStorage checklist, export/import, search,
  grade and kind filters, a spoiler setting that hides story trophies until
  they are earned, and the roadmap, missables and sources tabs.
- `app/style.css` — the look: dark, pink and cyan, our own design.
- `app/data/trophies.json` — the 55 trophies: official names, descriptions and
  grades (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden), each with a
  guide in our own words and its sources named.
- `screenshots/` — 4 screenshots of the app running (1280×800), taken by
  the maker; see `shots.json` for which view each one shows.
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the vendored make.fun
  library (`vendor/makefun-frontend.ts`, copied unchanged from the kit).
- `serve.ts` — a tiny static server for trying the app locally.

## How the list was verified

Names, descriptions and grades are as PlayStation publishes them, taken from
Exophase and PSNProfiles and cross-checked against PlanetGTA6, Push Square
and TrueAchievements on 19 November 2026. Two sources disagree on one grade:
Maximum Withdrawal is Silver on Exophase and PSNProfiles and Bronze on Push
Square — this guide follows Exophase and PSNProfiles and says so on the
trophy. Seven trophies had no confirmed trigger in any published guide by
19 November 2026 (Personal Best, Actions Speak Louder, Challenging Tank,
In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There,
Ten Pin); their cards say so plainly instead of guessing. One trophy is
flagged as possibly missable (Positive Mental Attitude, per PowerPyx; Push
Square lists none known) and the disagreement is stated on the card.

## Build the dossier

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Then check it with the kit's `makefun check` before entering.
