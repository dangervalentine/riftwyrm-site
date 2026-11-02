---
description: "Task list for the Riftwyrm marketing site"
---

# Tasks: Riftwyrm Marketing Site

**Input**: Design documents from `specs/001-marketing-site/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/site-surface.md, quickstart.md

**Tests**: The spec does not ask for automated tests. Verification is the constitution's lint and
build gate plus the scripted and manual checks in `quickstart.md`, run at each checkpoint.

**Organization**: Tasks are grouped by user story, so each story can be built and tested on its own.

**Constitution reminders for every task**:
- No AI attribution in commits, comments or copy (I).
- Work on `main` only (II).
- Pages stay static (III).
- Shared facts are imported from `components/site.ts`, and copy names no other game, publisher or
  their terms (IV).
- `npm run lint && npm run build` must pass before any commit (V).

**Game repo**: `../dragon-hunter` (override with `GAME_DIR`). Its palette is in
`ui/theme/tokens.gd`, its art in `art/painted/`, its icons in `art/icons/`, its fonts in
`art/fonts/`, and its store shots in `build/app-store/<version>/iphone-6.9/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US5 from spec.md

---

## Phase 1: Setup

**Purpose**: Dependencies, folders and shared facts.

- [X] T001 Add `sharp` as a devDependency and add the script `"sync-assets": "node scripts/sync-assets.mjs"` in `package.json`; run `npm install` so `package-lock.json` updates.
- [X] T002 [P] Create empty folders with `.gitkeep`: `public/media/screenshots/`, `public/media/dragons/`, `public/media/world/`, `public/media/icons/`, `public/icons/`, `assets/fonts/`, `components/sections/`, `scripts/`.
- [X] T003 [P] Extend `components/site.ts`. Add:
  - `pitch` (2–3 sentences in the game's own words, with no other game, publisher or their terms)
  - `stores: { googlePlay: "", appStore: "" }`, each documented as "`""` until live; otherwise an `https://play.google.com/…` / `https://apps.apple.com/…` URL"
  - `shortName: "Riftwyrm"`

  Keep `tagline` at ≤160 characters.
- [X] T004 [P] Copy `../dragon-hunter/art/fonts/Spectral-Bold.ttf` and `OFL-Spectral.txt` into `assets/fonts/` (used by the Open Graph image).

---

## Phase 2: Foundational (blocks all stories)

**Purpose**: The asset pipeline, the palette and the shared chrome that every section depends on.

- [X] T005 Write `scripts/sync-assets.mjs` (ESM, `sharp`). It reads the game dir from `--game` / `GAME_DIR` / default `../dragon-hunter`, and the store-shot version from `--version`, defaulting to the newest folder in `build/app-store/` sorted by semver, ignoring non-version folders such as `check`, `test` and `test2`. It writes:
  - (a) `iphone-6.9/0{1..5}-*.png` → `public/media/screenshots/{title,trial,dragons,showdown,won}.webp`, resized to 1920 px wide, quality 80
  - (b) `art/painted/dragons/dragon_{lightning,water,fire,shadow}.png` and `-head.png` → `public/media/dragons/{id}.webp` and `{id}-head.webp`, max 1024 px, quality 82
  - (c) the journeys `burning-forest`, `waterfall`, `peaks`, `swamp`, `volcano` and `rope-bridge`, and the enemies `naga`, `club-ogre`, `goblin-hexer`, `antler-horror`, `marsh-treant`, `lion-archer`, `twin-ghoul` and `boar-shaman`, from `art/painted/{journeys,enemies}/` → `public/media/world/{journey,enemy}-{name}.webp`, max 900 px
  - (d) one hero image, `art/painted/lairs/dragon_lightning.png` (fall back to `dragons/dragon_lightning.png`) → `public/media/hero.webp`, max 1600 px, plus a PNG copy at max 700 px → `assets/og-art.png` for the Open Graph image
  - (e) the SVG icons `crown`, `deck`, `book`, `trophy`, `star` and `sigil_region` from `art/icons/` → copied to `public/media/icons/`
  - (f) `components/media.generated.ts`, exporting `MediaImage {src,width,height}`, `screenshots`, `dragons`, `journeys`, `enemies`, `hero` and `source {gameVersion, syncedAt}`, with dimensions read from the written files

  Every input path is checked before anything is written. A missing one prints the path, exits 1, and leaves the outputs untouched. Keep the selection lists as constants at the top of the file. Don't write `syncedAt` if nothing else changed, so the output stays identical from run to run (use the store run's version and the manifest's "made" date instead of the current time).
- [X] T006 Run `npm run sync-assets`, check the outputs listed in T005 exist with sensible sizes (screenshots ≤ ~250 KB each), and confirm `components/media.generated.ts` type-checks.
- [X] T007 [P] Rewrite the palette tokens in `app/globals.css` from `../dragon-hunter/ui/theme/tokens.gd`:
  - **Base**: ground `#0c1013`, stone `#151b20`, stone-raised `#1e262c`, well `#080b0d`, line `#2a333a`, edge `#717f89`, parchment `#e6e1d6`, muted `#a8a090`, faint `#56606a`, brass `#c9a14a`, brass-bright `#e0bd6e`, brass-deep `#7a5c1e`, on-brass `#17120a`, jade `#7fb89a`, danger `#de6f56`
  - **Essences**, base/bright: lightning `#a87d36`/`#d8ac5c`, water `#2c4c80`/`#7aa5dc`, fire `#87302a`/`#d6765f`, shadow `#4f3a80`/`#a28ed0`
  - **Region grounds**: `#0d121a`, `#0b1414`, `#16100c`, `#0d130d`
  - **Region hues**: `#5f84b0`, `#3f8e87`, `#b97445`, `#6c9a5e`
  - **Lair red**: `#9a3a33`

  Expose them all through `@theme inline` as Tailwind colours. Add a `components/palette.ts` exporting the same hex values for non-CSS uses (the Open Graph image, the manifest and the viewport). These two files are the only places a hex colour may appear.
- [X] T008 [P] Add the motion utilities to `app/globals.css`:
  - `.reveal`, using `animation-timeline: view()` inside `@supports (animation-timeline: view())`, with a fade and a 24 px rise
  - `.glow-drift`, a slow 20 s radial-gradient ember drift for the hero
  - `.section-ground-{1..4}`, gradients from the region grounds with a faint region-hue wash
  - a `@media (prefers-reduced-motion: reduce)` block that switches off every animation and transition
- [X] T009 Restyle `components/Header.tsx` and `components/Footer.tsx` for all pages, using the palette from T007:
  - **Header**: icon and name linking home, plus anchor links (Screenshots `/#screenshots`, Dragons `/#dragons`, Support, Privacy). It sits over the hero, transparent with a backdrop blur, and is solid on the other pages. Widen to `max-w-6xl`.
  - **Footer**: © year and developer, Privacy, Support, Contact (mailto from `site.email`), and the line "Riftwyrm is an independent game." with no other names.

  Both read from `site`.
- [X] T010 Update `app/layout.tsx`:
  - import `palette.ground` for `viewport.themeColor`
  - add `openGraph.images` and `twitter: { card: "summary_large_image" }` defaults (Next will fill in the images from T034/T035)
  - add `applicationName`
  - keep the fonts as they are

**Checkpoint**: `npm run sync-assets && npm run lint && npm run build` pass, and the media and palette are in place.

---

## Phase 3: User Story 1 — A visitor understands the game and wants it (P1) 🎯 MVP

**Goal**: A home page with a hero, pitch, features and real screenshots in a gallery.

**Independent Test**: Open `/` at 390 px and 1440 px. A tester can say what the game is, sees all five real screenshots with captions, and the enlarged viewer works (quickstart §6 Gallery row).

- [X] T011 [P] [US1] Create `components/content.ts` with:
  - `screenshots: {id: "title"|"trial"|"dragons"|"showdown"|"won"; caption: string /* ≤60 chars, the site's own words */; alt: string}[]`, in the order title → trial → dragons → showdown → won. Base the captions on `../dragon-hunter/tools/store/shots.gd`, without game-rule terms. For example: "Hunt a dragon across a riven land", "Meet each challenge with the cards you hold", "Four dragons, each its own hunt", "Stand and fight at the dragon's lair", "Bring the dragon down".
  - `features` with 4–6 items `{title /* ≤40 chars */, body /* ≤140 chars */, icon /* path under /media/icons/ */}`, limited to confirmed claims (research R9): a solo card game that fits in one hand; four dragons unlocked one by one; four regions and a final battle; six difficulty levels; six interactive lessons that teach play on the real screens; achievements and a personal leaderboard; no ads, no tracking, no account. Do not claim offline play.
- [X] T012 [P] [US1] Create `components/sections/Hero.tsx`:
  - full-viewport section on `bg-ground` with `.glow-drift`
  - `media.hero` as a `next/image` with `priority`, `sizes`, and a mask fading into the ground
  - `h1` with `site.name` (Spectral, large, gold-to-parchment text gradient), the `site.tagline`, and an `<StoreButtons />` slot (rendered as a placeholder `<div id="store-slot">` until US2 lands)
  - a framed `screenshots.title` device mock (rounded `stone-raised` bezel) on large screens
  - a scroll cue
- [X] T013 [P] [US1] Create `components/sections/Pitch.tsx`: a short centred `site.pitch` with a decorative divider (the `orn_divider` look made in CSS, or the `sigil_region` icon), with `.reveal`.
- [X] T014 [P] [US1] Create `components/sections/Features.tsx`: a responsive grid (1/2/3 columns) of `content.features`, each a `stone` card with a `line` border, the icon tinted brass via CSS mask, and the title and body, with `.reveal`.
- [X] T015 [P] [US1] Create `components/sections/Gallery.tsx` (server component), `id="screenshots"`:
  - a horizontal scroll-snap strip on small screens and a 2+3 grid on wide screens
  - each item is `<figure><a href={src} data-index>` holding a `next/image` with `width`/`height` from `media.generated.ts`, `sizes`, lazy loading and a `stone` placeholder background, plus a `<figcaption>`
  - it renders `<Lightbox items>` around the list
- [X] T016 [US1] Create `components/sections/Lightbox.tsx` (`"use client"`):
  - catches clicks on `a[data-index]` inside its children (so with JS off the link opens the image) and opens a native `<dialog>` showing the full-size image and caption
  - prev/next buttons, ←/→ keys and touch swipe (threshold 40 px)
  - closes on Esc, on a backdrop click, and on `popstate` (push a `#shot-n` history entry when opening)
  - returns focus to the opening link
  - the buttons have `aria-label`s, and the dialog has `aria-label` "Screenshot viewer"
  - no animation under reduced motion
- [X] T017 [US1] Rewrite `app/page.tsx` to compose `<Header />`, `<main>` with `Hero`, `Pitch`, `Features`, `Gallery` (Dragons, World and FinalCta are added by later stories), and `<Footer />`. Use one `h1` and an `h2` per section. Add `export const metadata` with the title "Riftwyrm — Hunt dragons in a solo card game", the description from `site.tagline`, and `alternates.canonical: "/"`.
- [X] T018 [US1] Verify US1: lint and build; at 320/390/768/1440/2560 px, no horizontal page scroll; the gallery viewer works with mouse, keyboard and touch; with JS disabled the shots open as images. Fix any problems.

**Checkpoint**: US1 can be demoed as the MVP.

---

## Phase 4: User Story 2 — A visitor gets the game from a store (P1)

**Goal**: Store buttons in the hero and the closing section, placeholders now, live later from a single setting.

**Independent Test**: Both placeholders show "Coming soon" and are not links. Setting `site.stores.appStore` to a URL and rebuilding shows the App Store button live, at full strength, in both places (quickstart §6 Store link row).

- [X] T019 [P] [US2] Create `components/storeMarks.ts` by copying `APPLE_ICON_PATH` (exported as `APP_STORE_MARK`) and `GOOGLE_PLAY_SEGMENTS` (as `GOOGLE_PLAY_SEGMENTS`) verbatim from `../danger-portfolio/components/icons.ts`, with a comment saying they are the stores' marks in their own colours, the one allowed exception to the palette rule (spec FR-005).
- [X] T020 [US2] Port `../danger-portfolio/components/StoreButton.tsx` to `components/StoreButton.tsx` (`"use client"`), keeping its behaviour:
  - the same plate in both states, so the layout doesn't move when a store goes live
  - the eyebrow and label text, with the store mark from `storeMarks.ts`
  - coming soon: the dimmed tones (`/60` name, `/50` eyebrow, `/10` edge, mark at 30% opacity), the "Coming soon" eyebrow swap on mouse hover or for 1600 ms after a touch/pen tap, an sr-only ", coming soon", and `cursor-not-allowed`
  - live: `<a target="_blank" rel="noreferrer">` with the hover lift
  - `motion-reduce:transition-none`

  Changes from the portfolio version:
  - the focus ring and the "Coming soon" reveal colour use `brass` / `brass-bright` instead of the portfolio's accent tokens
  - `font-mono` becomes the site's sans with the same 11px uppercase tracking (the site loads no mono font)
  - the props are `{ label: "App Store" | "Google Play"; eyebrow: string; href: string }`, where an empty `href` means coming soon

  Then create `components/StoreButtons.tsx` (server component, prop `{ className?: string }`). It renders a two-column row of `<StoreButton>` for the App Store ("Download on the", `site.stores.appStore`) and Google Play ("Get it on", `site.stores.googlePlay`), stacking on screens narrower than 360 px.
- [X] T021 [P] [US2] Create `components/sections/FinalCta.tsx`: a full-bleed section on `section-ground-4` with one dragon head (`media.dragons.shadow.head`) and the line "The dragons are waiting.", plus `<StoreButtons />`, with `.reveal`.
- [X] T022 [US2] Replace the hero's store slot with `<StoreButtons />` in `components/sections/Hero.tsx`, and add `FinalCta` before the footer in `app/page.tsx`.
- [X] T023 [US2] Verify US2: coming-soon buttons in both places at 320–2560 px; "Coming soon" shows on hover and on tap; a keyboard Tab passes over them; a screen reader reads "…, coming soon"; temporarily set `site.stores.appStore = "https://apps.apple.com/app/id0"` and build to check the live link, then revert.

**Checkpoint**: US1 + US2 make a launchable marketing page.

---

## Phase 5: User Story 3 — The art is the showcase (P2)

**Goal**: The four dragons and the world's landscapes and enemies in painted art.

**Independent Test**: The dragons section shows all four in unlock order with art, name, flavour line and their own colour. The world section shows painted landscapes and enemies. Reduced motion switches off the motion (quickstart §6).

- [X] T024 [P] [US3] Add `dragons` to `components/content.ts`: `{id: "lightning"|"water"|"fire"|"shadow"; name; title; order: 1–4 /* unlock order lightning, water, fire, shadow */; line; alt}`. Names, titles and lines are this edition's own text, the `official` values in `../dragon-hunter/data/text.json` (never `original`, which is the published card game's wording):
  - lightning: Thrallis, The Stormcrown, "A thunderclap heard after its lightning-fast strikes is the only mark it leaves behind."
  - water: Glaciarch, Rime and Rock, "Its icy scales are stone hard; only the most powerful spells can harm it."
  - fire: Cindermaw, The Pyrewind, "Where its scorching wind passes, only pyres are left behind."
  - shadow: Vesperath, The Unburied, "It crawls back from every wound, it lives in the shadows as it escapes death."
- [X] T025 [P] [US3] Add `world` to `components/content.ts`: `{key, kind: "journey"|"enemy", name, alt}`, with the journeys and enemies chosen in T005(c), and human names (e.g. "Burning Forest", "Naga").
- [X] T026 [P] [US3] Create `components/sections/Dragons.tsx`, `id="dragons"`:
  - an intro line ("Four dragons. Beat one to face the next.")
  - a 1/2/4-column grid of cards, each with the full art over a radial glow in its Essence base colour, the name in its Essence bright colour, the flavour line in italic `muted`, and a small "I–IV" unlock numeral
  - colours come only from the tokens (e.g. `bg-essence-fire`)
  - hover lifts the card and brightens the glow, except under reduced motion
  - `.reveal`, staggered
- [X] T027 [P] [US3] Create `components/sections/World.tsx`: the heading "Sixteen foes on the road, four dragons at its end", a masonry-like strip of journey landscapes (tall 896×1152 crops) mixed with enemy portraits, each captioned with its name, on a `section-ground-2`→`section-ground-3` gradient. Images are lazy, with `sizes` set.
- [X] T028 [US3] Insert `Dragons` and `World` between `Gallery` and `FinalCta` in `app/page.tsx`, alternating the `section-ground-{1..4}` backgrounds down the page so the regions move along as you scroll.
- [X] T029 [US3] Verify US3: all four dragons in order; colours match the tokens; with reduced motion on there is no reveal, drift or hover motion; there is no layout shift (Lighthouse CLS ≈ 0).

---

## Phase 6: User Story 4 — Right wherever it's shared or bookmarked (P2)

**Goal**: Favicons, manifest, share image, per-page metadata and JSON-LD.

**Independent Test**: Quickstart §3: every route returns 200 (the 404 path returns 404), the head has a title, description, canonical, OG and Twitter tags, and the home page has JSON-LD.

- [X] T030 [US4] Extend `scripts/sync-assets.mjs` to make icons from `build/app-store/<v>/AppStore-icon-1024.png`:
  - `app/apple-icon.png` (180, opaque)
  - `public/icons/icon-192.png` and `public/icons/icon-512.png`
  - `app/favicon.ico` (16/32/48 PNG-in-ICO, with the ICO header written by hand: 6-byte header plus a 16-byte entry per image)
  - keep the existing `app/icon.svg` and `public/icon.svg` as they are

  Add these to the pre-write input check, then re-run `npm run sync-assets`.
- [X] T031 [P] [US4] Create `app/manifest.ts`: `name: site.name`, `short_name: site.shortName`, `description: site.tagline`, `start_url: "/"`, `display: "standalone"`, `orientation: "landscape"`, `theme_color` and `background_color` set to `palette.ground`, and icons 192/512 (`purpose: "any"`).
- [X] T032 [P] [US4] Create `components/JsonLd.tsx`, rendering a `<script type="application/ld+json">` with `@context: "https://schema.org"` and `@type: ["VideoGame","MobileApplication"]`, plus:
  - `name`, `description` (tagline), `url`, `image` (the absolute OG image URL)
  - `genre: ["Card game","Strategy"]`, `playMode: "SinglePlayer"`
  - `gamePlatform: ["Android","iOS"]`, `operatingSystem: "Android, iOS"`
  - `applicationCategory: "GameApplication"`
  - `author: {@type: "Person", name: site.developer}`
  - only when a store URL is set: `installUrl` (the first live one) and `offers: {@type: "Offer", price: "0", priceCurrency: "USD"}`
- [X] T033 [US4] Render `<JsonLd />` in `app/page.tsx`.
- [X] T034 [P] [US4] Create `app/opengraph-image.tsx` (`ImageResponse`, `size {1200, 630}`, `contentType "image/png"`, `alt` "Riftwyrm — a solo dragon-hunting card game"). It loads `assets/fonts/Spectral-Bold.ttf` with `readFile(join(process.cwd(), "assets/fonts/Spectral-Bold.ttf"))`, and `assets/og-art.png` (written by T005; the image renderer can't read WebP) as a base64 data URL. Layout: the `palette.ground` background with a radial `essence.lightning` glow, the art on the right, "Riftwyrm" at 112 px in Spectral, `palette.parchment`, and the tagline in `palette.muted`. It must be generated statically at build time.
- [X] T035 [P] [US4] Create `app/twitter-image.tsx`, re-exporting `default`, `size`, `contentType` and `alt` from `./opengraph-image`.
- [X] T036 [P] [US4] Add per-page `metadata` to `app/privacy/page.tsx` ("Privacy Policy", unique description, `alternates.canonical: "/privacy"`) and `app/support/page.tsx` ("Support", `alternates.canonical: "/support"`), keeping the existing body content word for word. Wrap the content in the restyled `Header` and `Footer`.
- [X] T037 [P] [US4] Restyle `app/not-found.tsx` with the new chrome, a dragon silhouette or head art, and a brass "Back to Riftwyrm" link.
- [X] T038 [US4] Verify US4 with quickstart §2–3. Check the build lists `/opengraph-image`, `/manifest.webmanifest`, `/apple-icon.png` and `/favicon.ico` as static, and open `/opengraph-image` to look at it.

---

## Phase 7: User Story 5 — Assets stay in step with the game (P3)

**Goal**: The refresh is one documented, safe and repeatable step.

**Independent Test**: Quickstart §1. A second run gives no git diff, and `--game /nonexistent` exits 1 and writes nothing.

- [X] T039 [US5] Harden `scripts/sync-assets.mjs`:
  - `--help` text
  - check every input path before writing (including the icon inputs from T030)
  - write each output to a temp file, then rename it into place
  - deterministic output: sorted keys in `media.generated.ts`, and no wall-clock timestamp
  - print a summary listing each file written and its KB, and the total
- [X] T040 [US5] Run quickstart §1 (run twice, then `git status`; then `--game /nonexistent`) and fix any differences between runs.
- [X] T041 [P] [US5] Document the refresh in `README.md`, under a new section "Refreshing screenshots and art": `cd ../dragon-hunter && scripts/dev store` (keep its window uncovered), then `npm run sync-assets` here, then `npm run lint && npm run build`, then commit. Also cover the `GAME_DIR` / `--game` / `--version` options, and note that a store button goes live once its URL is set in `components/site.ts`.

---

## Phase 8: Polish & cross-cutting

- [X] T042 [P] Run the palette check (quickstart §5) and remove any hex colour found outside `app/globals.css`, `components/palette.ts` and the store button's livery (`components/StoreButton.tsx`, `components/storeMarks.ts`).
- [X] T043 [P] Run a copy audit over `app/`, `components/content.ts` and `components/site.ts`: no other game, publisher or their in-game terms (Principle IV), and every feature claim matches research R9.
- [X] T044 Run Lighthouse (quickstart §4) on `/`, `/privacy` and `/support` (mobile). Fix anything below performance 90 or below 100 on accessibility, best practices or SEO, such as `sizes`, image priority, contrast or heading order.
- [X] T045 Run the manual matrix (quickstart §6): widths, keyboard-only, JS off, reduced motion.
- [X] T046 Update `sitemap.ts` only if routes changed (they shouldn't), and confirm `/privacy` and `/support` still resolve.
- [X] T047 Final gate: `npm run lint && npm run build`. Then commit to `main` with a plain message and no AI attribution (Principles I, II, V).

---

## Dependencies & Execution Order

```text
Setup (T001–T004) → Foundational (T005–T010) → US1 (T011–T018) ─┬→ US2 (T019–T023)
                                                                 ├→ US3 (T024–T029)
                                                                 └→ US4 (T030–T038)
                                              US4 T030 → US5 (T039–T041) → Polish (T042–T047)
```

- US1 owns `app/page.tsx` and `components/content.ts`. US2, US3 and US4 each add to them, so the
  edits to those two files run one after another, while each story's new component files can be
  done in parallel.
- US2, US3 and US4 depend only on Foundational plus the page skeleton from US1 (T017).
- US5 hardens the script written in T005 and extended in T030.

## Parallel Examples

- **Setup**: T002, T003 and T004 together.
- **Foundational**: T007 and T008 (both in `globals.css`, but separate blocks; do them in order if
  editing by hand), running alongside T005. T009 and T010 come after T007.
- **US1**: T011, T012, T013, T014 and T015 together, then T016, then T017.
- **US2**: T019 and T021 together, then T020, then T022.
- **US3**: T024, T025, T026 and T027 together, then T028.
- **US4**: T031, T032, T034, T035, T036 and T037 together after T030, then T033.

## Implementation Strategy

1. **MVP**: Setup, then Foundational, then US1. That gives a real, art-backed home page with
   screenshots; demo it.
2. Add US2 (store placeholders). At that point it is launch-ready for the store listings.
3. Add US3 (dragons and world art) and US4 (sharing and SEO) in either order, or in parallel.
4. Add US5 (a hardened refresh) and then the polish checks. Commit to `main` after each
   checkpoint's lint and build pass.

## Implementation Notes (2026-11-02)

How the build departed from the tasks above, and why:

- **T002**: no `.gitkeep` files. Every folder is filled by the sync, and `public/badges/` was dropped by the clarification.
- **T005**: the sync also writes each dragon's lair (`public/media/dragons/<id>-lair.webp`) and each enemy's backdrop (`world/backdrop-<name>.webp`), because the dragons and enemies are cut-outs. The hero and the dragon panels set each dragon in its lair, and each foe stands on its own backdrop. There is no separate `hero.webp`: the hero uses Thrallis and its lair. The selection is 6 journeys, 6 enemies and 6 icons.
- **T005/T030/T039** were built as one script: icons, ICO (RGBA PNGs, which the ICO decoder requires), check-before-write, temp-and-rename, writes only when the bytes change, and output identical from run to run.
- **T008/T013/T014**: `.reveal` is used only on the dragons row. The hero's load sequence is the page's one orchestrated motion, and the other sections hold still (frontend-design review).
- **T009**: the footer leaves out the "independent game" line, to avoid a claim about how the game relates to others.
- **T011/T024**: names, titles and flavour lines use the game's own `official` text (Thrallis, Glaciarch, Cindermaw, Vesperath). The earlier plan said `original`, which is the published card game's wording; research.md and data-model.md are corrected. The world names come from `ui/model/art.gd`.
- **T020**: under 360 px the store buttons drop their small top line, so both fit side by side and stay on the first screen at 320×640. At 320×568 (the first-generation iPhone SE) they still fall just below the fold.
- **T032**: no `offers` price in the JSON-LD; no price has been decided.
- **T036**: privacy and support already had their own metadata; they only take the new header and footer.

Verification:
- lint and build pass, and every route is static
- all routes return 200 (404 for unknown paths)
- Lighthouse mobile scores 100/100/100/100 on `/`, `/privacy` and `/support` (LCP 0.8–0.9 s, CLS 0)
- no horizontal overflow from 320 to 2560 px
- the hero title fits at every tested size
- the lightbox works with click, arrow keys, Escape, back and the backdrop, and focus returns to the opening link
- without JS, each shot is a plain image link
- reduced motion stops all animation
- the tab order skips the coming-soon buttons
- a store URL, set and then reverted, swaps in live links in both places and adds `installUrl`
- the palette and copy audits are clean

### Revision: the deck first (2026-11-02, from developer feedback)

- **Hero**: now Cindermaw in its fire lair, the top card of a deck. The deck's edges show beneath it, and two fire Adept Cards fan out from under it on load.
- **New `components/sections/Deck.tsx`**, "The deck is the world", right after the hero:
  - the four Region Cards as the road (I–IV), then Cindermaw's Dragon Card
  - a fanned hand of four Adept Cards, one per Essence, described as powers and resources
  - the pitch: every shuffle deals a new story
  - "Pitch.tsx" is removed
- **Card images**: rendered by the game's `tools/card_shots.gd`. Run it with `--always-on-top`, since macOS doesn't redraw a covered window and the tool then saves the same stale frame every time. `sync-assets` trims each card, rounds its corners to transparent, and writes it to `public/media/cards/` (option `--cards`).
- **Features** move to their own section, "Made to come back to", before the closing section:
  - dragons, difficulty and lessons
  - leaderboards (Google Play Games and Game Center)
  - 27 achievements
  - progress on all your devices, within one platform as the support page says
  - no ads, no tracking, no account
- **Copy accuracy**: losing a fight is braced by levelling cards down (`rulebook.toll.absorb`), not by losing them.
- **Share image**: now uses the fire dragon and lair, with the line "Every region, foe and dragon is a card."
- **Verified**:
  - lint and build pass
  - no horizontal overflow from 320 to 2560 px; a screen-reader-only caption in the scrolling road had stretched the document, fixed by making each road card `relative`
  - store buttons on the first screen down to 320×640
  - Lighthouse 100/100/100/100 on the home page
