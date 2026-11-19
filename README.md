# Leonida Platinum — GTA VI Trophy Guide & Tracker

An offline web app that guides and tracks all 55 PlayStation 5 trophies of
**Grand Theft Auto VI**, built for make.fun's `gta6-trophy-guide-01` bounty
("Build the best GTA 6 trophy guide", $250).

## What it is

- **Tracker** — every trophy with its official name, description and grade; a
  checklist saved in the browser (localStorage) with export and import;
  filters by grade, kind (story, stranger missions, collectibles, activities,
  robberies, money, platinum & 100%, other moments, missable only), text
  search, and earned/remaining; a spoiler setting that hides the 28 hidden
  story trophies until they are earned.
- **Roadmap to the platinum** — six phases in an order that wastes the least
  effort, from the story through stranger strands, activities, collectibles,
  robberies and money, to 100% completion.
- **Missables** — the one trophy flagged as possibly missable (Positive
  Mental Attitude), why, and what to do about it; plus the no-mission-replay
  and cheat warnings.
- **Sources** — every guide is written in our own words and names its
  sources. Trophy names, descriptions and grades are the official ones as
  shown on PlayStation Network (verified 2026-11-19 against Exophase /
  PSNProfiles via PlanetGTA6 and against Push Square's full list). Counts and
  menu paths come from Push Square's trophy guide; the platinum time estimate
  and the missable and cheat notes from PowerPyx (as reported by GTA Zone)
  and Output Lag. Where no published guide had confirmed a trigger yet, the
  card says so instead of inventing one.
- **Offline** — plain static files, no network requests at all. No Rockstar
  logo or official artwork anywhere; the look is our own.

## Run it

```sh
node serve.ts          # serves app/ on http://localhost:8080
```

Or open `app/index.html` directly from the files (served over HTTP is the
tested path). Hand it in with `MAKEFUN_OUTPUT_DIR=out node main.ts`.

## Layout

- `app/index.html`, `app/app.js`, `app/style.css` — the app
- `app/data/trophies.json` — the official 55 trophies plus our own guides,
  kinds, hidden flags and the single missable flag
- `screenshots/` — 4 real renders of the app (tracker, missable guide,
  roadmap, missables), 1280×800
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes
  `dossier.json` with the vendored make.fun library
- `vendor/makefun-frontend.ts` — the kit's library, byte for byte
- `shots.json` — what each screenshot shows

## License

MIT — see `LICENSE`.
