# Research: Riftwyrm Marketing Site

All findings come from the site repo and the sibling game repo (`../dragon-hunter`) as of
2026-11-02.

## R1. Screenshot source

- **Decision**: Use the game's App Store screenshot output, `build/app-store/<version>/iphone-6.9/*.png`
  (bare, 2868×1320 landscape), the five shots `01-title`, `02-trial`, `03-dragons`, `04-showdown`,
  `05-won`. Captions are written on the site, based on the ones in `tools/store/shots.gd`
  ("Hunt a dragon across a riven land", "Four dragons, each its own hunt", "Bring the dragon
  down", …), reworded where they use game-rule terms.
- **Rationale**: These are real, seeded, really-won games drawn at an exact device size by the
  game's own tool (`scripts/dev store` / `tools/store_shots.gd`). The bare shots let the site set its
  own captions in HTML, which can be read aloud and indexed. Phone landscape matches how the game is
  played.
- **Alternatives**: The captioned `panels/` (rejected: the text is baked into the image, can't be
  read aloud or restyled, and is duplicated by the site's own captions). iPad 13 shots (4:3; kept as
  an alternative for a tablet frame, not used in v1). `tools/shot.gd` matrix shots (made for testing
  layouts, not curated).
- **Freshness**: `0.0.0` was made 2026-11-01. The sync step takes the newest version folder and
  stops with an error if the folder is missing; the developer re-runs `scripts/dev store` first if
  the game has changed.

## R2. Art selection

- **Decision**:
  - Hero: one dragon's painted lair or full art (`art/painted/lairs/` or `art/painted/dragons/dragon_<x>.png`),
    1024² masters.
  - Dragons section: `art/painted/dragons/dragon_{lightning,water,fire,shadow}.png` plus `-head.png`.
  - World section: 4–6 of `art/painted/journeys/*.png` (896×1152) and 6–8 of `art/painted/enemies/*.png`.
  - Feature icons: SVGs from `art/icons/`.
  - Dragons: this edition's own names, titles and flavour lines, the `official` values of
    `dragon.dragon_<id>.name`, `.title` and `flavor.dragon_<id>` in `data/text.json` (Thrallis, The
    Stormcrown; Glaciarch, Rime and Rock; Cindermaw, The Pyrewind; Vesperath, The Unburied). Never
    the `original` values, which carry the published card game's wording.
- **Rationale**: All of these are the project's own generated and painted art. The `official`
  text is the game's own wording, exactly as the game shows it, which keeps to Principle IV.
  (Corrected during implementation: an earlier draft had `original` and `official` the wrong way
  round.)
- **Alternatives**: The creature silhouettes in `art/creatures/` (kept as possible decorative
  accents only; they are flat one-colour shapes meant to be tinted).

## R3. Image processing and serving

- **Decision**: A Node script, `scripts/sync-assets.mjs`, using `sharp` (added as an explicit
  devDependency; it is already installed with Next). It reads from `../dragon-hunter` (path can be
  overridden with `GAME_DIR`) and writes WebP masters to `public/media/…`:
  - screenshots capped at 1920 px wide, q≈80
  - art capped at 1024 px
  - icons as PNG at 192/512, Apple touch at 180, a multi-size `favicon.ico`

  The script also writes `components/media.generated.ts` with each file's path, width and height.
  The site displays images with `next/image`, using those sizes, so every image has a responsive
  `srcset` and reserves its space before it loads.
- **Rationale**: Committed masters keep the build independent of the game repo (FR-011, US5
  scenario 2). Pre-cropping big PNGs (2.8k wide, ~1.3 MB each) keeps the repo small. `next/image`
  is already part of the stack and serves AVIF/WebP at the right width under `next start`. Image
  optimisation is not dynamic page rendering, so Principle III still holds.
- **Alternatives**:
  - `cwebp` CLI (rejected: macOS-only Homebrew dependency, and it can't make ICO files or composites)
  - Python/PIL (rejected: not installed)
  - Godot exporting web sizes (rejected: needs a window and is slow)
  - fully static `<img srcset>` with pre-made widths (rejected: more files for no benefit while the
    server runs `next start`)

## R4. Store buttons before launch

- **Decision**: `site.stores.googlePlay` and `site.stores.appStore` are URL strings, empty until
  launch.
  Both states use a port of the developer's portfolio store button
  (`../danger-portfolio/components/StoreButton.tsx`, marks from `components/icons.ts`), chosen by
  the developer (spec Clarifications, 2026-11-02). It is drawn in code: the store mark, a small
  mono top line ("Get it on" / "Download on the"), and the store name, on a near-black plate
  (`#010d17`) with a fifth-strength white rule.
  - **Empty**: the same plate dimmed (no link, `cursor-not-allowed`). The top line swaps to "Coming
    soon" on mouse hover, or for 1.6 s after a tap, and there is a screen-reader-only ", coming
    soon".
  - **Set**: an `<a target="_blank" rel="noreferrer">`. Hover lifts the plate, and the focus ring
    uses the site's brass instead of the portfolio's accent.
- **Rationale**: It matches the developer's other site, stays sharp at any pixel density, uses no
  image files, and already handles the pre-launch state accessibly. It is the one client component
  besides the lightbox, and the page still renders statically. Its livery hex values are the one
  allowed exception to the palette rule (spec FR-005).
- **Alternatives**: The official badge images (rejected by the developer). The portfolio's old
  120×40 PNGs (rejected: blurry on high-density screens). A palette-coloured placeholder (rejected:
  doesn't match the portfolio). Hiding the
  buttons (rejected: US2 requires visible placeholders).

## R5. Favicons, manifest, share image

- **Decision**: Use Next's file conventions:
  - `app/icon.svg` (already present)
  - `app/favicon.ico` (16/32/48, made by the sync script)
  - `app/apple-icon.png` (180)
  - `app/manifest.ts` (name, short name, `theme_color` #0c1013, `background_color` #0c1013,
    `display: standalone`, icons 192/512)
  - `app/opengraph-image.tsx` (1200×630 `ImageResponse`, built statically at build time): the hero
    dragon art on the ground colour, the name set in Spectral Bold (`art/fonts/Spectral-Bold.ttf`,
    OFL, copied to `assets/fonts/`), and the tagline
  - `twitter-image` reuses the Open Graph image
- **Rationale**: Built in, statically generated, and no extra dependencies.
- **Alternatives**: A hand-made PNG share image (rejected: it drifts when the art or tagline
  changes).

## R6. SEO metadata and structured data

- **Decision**: Every page gets its own `metadata`: title, description, and
  `alternates.canonical`. The root layout adds Open Graph and Twitter `summary_large_image`. The
  home page embeds JSON-LD `@type: ["VideoGame", "MobileApplication"]` with:
  - `name`, `description`, `image`, `url`
  - `genre: ["Card game", "Strategy"]`, `playMode: "SinglePlayer"`
  - `gamePlatform: ["Android", "iOS"]`, `operatingSystem: "Android, iOS"`
  - `applicationCategory: "GameApplication"`
  - `author: Person`
  - `installUrl` only once a store URL is set; no `offers`, since no price has been decided

  The existing sitemap and robots files are kept.
- **Rationale**: Search engines read these schema.org types for apps and games. Leaving out
  `installUrl` and `offers` until launch avoids claims that aren't true yet.

## R7. Visual direction

- **Decision**: "Inkstone and Brass", taken from the game's `ui/theme/tokens.gd`:
  - **Base colours**: ground `#0c1013`, stone `#151b20`, raised stone `#1e262c`, well `#080b0d`,
    line `#2a333a`, edge `#717f89`, parchment `#e6e1d6` / muted `#a8a090` / faint `#56606a`,
    brass `#c9a14a` / bright `#e0bd6e` / deep `#7a5c1e`, on-brass `#17120a`, jade `#7fb89a`,
    danger `#de6f56`.
  - **Dragon (Essence) colours**, base/bright: lightning `#a87d36`/`#d8ac5c`,
    water `#2c4c80`/`#7aa5dc`, fire `#87302a`/`#d6765f`, shadow `#4f3a80`/`#a28ed0`.
  - **Region grounds**: `#0d121a` `#0b1414` `#16100c` `#0d130d`, plus the lair ground per dragon.
  - **Layout**: wide, full-bleed sections that move from region to region down the page; each
    dragon card glows in its own colour. Brass is used only for the call to action, links and
    focus, as in the game.
  - **Type**: Spectral (display) and Source Sans 3 (text), already loaded through `next/font`. The
    game uses the same two fonts (OFL).
- **Motion**:
  - CSS-only scroll reveals using `animation-timeline: view()` inside `@supports`, so browsers
    without it simply show the content
  - a slow ember/glow drift behind the hero
  - all of it switched off under `prefers-reduced-motion`
- **Rationale**: Matches the game exactly (FR-005, SC-007), adds no animation library, and works
  without JavaScript.

## R8. Screenshot gallery

- **Decision**: Without JavaScript, a server-rendered grid / horizontal scroll-snap strip, where
  each item is an `<a href>` to the full image. A small client component adds a native `<dialog>`
  lightbox:
  - previous/next with buttons, arrow keys and swipe
  - Esc and a backdrop click close it
  - focus returns to the thumbnail that opened it
  - a history entry is pushed so a back gesture closes it
- **Rationale**: Covers US1 scenario 3, the "JavaScript disabled" edge case, and keyboard access
  (FR-019) with no dependencies.

## R9. Feature claims

- **Decision**: Claims are limited to what the game's README and the site's own privacy and support
  pages already state:
  - solo play
  - four dragons unlocked one by one
  - four regions and a final battle
  - six difficulty levels
  - six interactive lessons
  - 27 achievements and a leaderboard
  - no ads, no tracking, no account

  "Plays offline" is not claimed until it is confirmed on a device.
- **Rationale**: The spec assumes every claim is verified. The privacy page already promises no
  ads and no account.

## R10. Verification approach

- **Decision**: The constitution's gate (`npm run lint`, `npm run build`), plus:
  - a Lighthouse run against `npm run start` (`npx lighthouse`, not saved as a dependency)
  - a check of the built HTML for meta tags and JSON-LD (`curl` + `grep`)
  - a palette check: a grep over `app/` and `components/` for hex colours that are not in
    `globals.css`
  - manual checks at 320 / 768 / 1440 / 2560 widths, with JS off, and with reduced motion
- **Rationale**: A small static site gains little from a unit-test framework. The scripted checks
  in `quickstart.md` cover the measurable criteria.
