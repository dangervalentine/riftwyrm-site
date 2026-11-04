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

**iPhone and iPad: automatic.** Each new Apple ID is added straight to a
TestFlight tester group through the App Store Connect API (`lib/testflight.ts`),
and Apple emails the invitation. It needs, in the environment or `.env.local`:

- `ASC_ISSUER_ID`, `ASC_KEY_ID`: from App Store Connect → Users and Access →
  Integrations → App Store Connect API (a team key with the App Manager role).
- `ASC_PRIVATE_KEY_PATH`: the key's `AuthKey_<KEY_ID>.p8`, kept on the host.
- `ASC_BETA_GROUP_ID`: an **external** tester group; list them with
  `npm run testflight -- groups`.

Without them the sign-up is still kept and the visitor is told they will be
added. `npm run testflight -- sync` puts every Apple ID on the list into the
group (safe to repeat): run it once after setting the key, or after a failed
invite (the notification email says so).

**Android: automatic, by email.** Google Play's API cannot edit a track's
tester email list, so the "Closed testing - Public Beta" track takes its testers
from an open Google Group, riftwyrm-beta@googlegroups.com (anyone with the link
can join; only managers see members). Each new Android sign-up is emailed both
links at once: join the group, then opt in on Google Play (`site.androidBeta` in
`components/site.ts`, mail in `lib/notify.ts`). To mail them by hand, for
sign-ups from before this or a failed send:

```sh
npm run android-invite -- someone@gmail.com
```

`npm run beta-export` still writes both lists (`google-play.csv`,
`testflight.csv`) for importing by hand.

To remove someone, delete their line from the sign-ups file.

Each new sign-up is also emailed, through Gmail with an app password, the same
account NextQuest sends from. Set `GMAIL_USER` and `GMAIL_APP_PASSWORD`
(and optionally `BETA_NOTIFY_TO`, which defaults to `GMAIL_USER`) in the
site's environment, or in `.env.local` (git ignores it). Without them,
sign-ups are still kept, just not mailed. A failed send is logged and the
sign-up still succeeds.
