# riftwyrm-site

The website for Riftwyrm, served at https://riftwyrm.dangervalentine.com: a
landing page, the beta sign-up (`/beta`), the privacy policy (`/privacy`) and
support (`/support`). Next.js 16, React 19, Tailwind 4, TypeScript; every page
is static, and the beta form posts to a server action.

```sh
npm install
npm run dev     # http://localhost:3200
npm run lint
npm run build
npm run start   # http://127.0.0.1:3200
```

Shared facts (name, contact email, developer, tagline, pitch, store links)
live in `components/site.ts`. The game's palette is in `app/globals.css`
(and `components/palette.ts` for the share image and manifest). The icon
(`app/icon.svg`, `public/icon.svg`) is the game's app icon. Deployment: see
`DEPLOY.md`.

## Store links

`site.stores.appStore` and `site.stores.googlePlay` in `components/site.ts`
are empty until the game is in each store. While empty, that store's buttons
are dimmed and say "Coming soon"; set the listing's URL and rebuild, and both
of its buttons (hero and closing section) become live links, and search
engines are given the install link.

## Refreshing screenshots and art

Every screenshot, card, painting, icon and favicon on the site comes from the game
repository (`../dragon-hunter`) and is committed here, so the site builds
without it. To bring them up to date:

```sh
cd ../dragon-hunter && scripts/dev store   # new store screenshots (keep its window uncovered)
godot --path . --always-on-top -s tools/card_shots.gd -- build/card-shots adept region dragon   # the printed cards
cd ../riftwyrm-site
npm run sync-assets                         # copy and web-size everything
npm run lint && npm run build
```

`npm run sync-assets` takes the newest `build/app-store/<version>/` run;
`-- --version 0.0.0` picks another, and `-- --game <dir>` (or `GAME_DIR`)
points at the game somewhere else. It checks every source file first and
writes nothing if one is missing, and running it again with the same inputs
changes nothing. Which pictures it takes is listed at the top of
`scripts/sync-assets.mjs`; the words beside them are in
`components/content.ts`.

## Beta sign-ups

`/beta` takes a tester's Apple ID email (for TestFlight), Google account email
(for Google Play testing), or both. Each sign-up is appended as one JSON line
to `data/beta-signups.jsonl` on the host (git ignores `data/`), or to the path
in `BETA_SIGNUPS_FILE`. An address already on the list is not added again.

To invite them:

```sh
npm run beta-export        # writes beta-export/testflight.csv and beta-export/google-play.csv
```

- `testflight.csv` (first name, last name, email): App Store Connect → TestFlight
  → a tester group → Add Testers → Import from CSV.
- `google-play.csv` (one email per line): Play Console → Testing → Closed testing
  → Testers → an email list → Upload CSV file.

To remove someone, delete their line from the sign-ups file.
