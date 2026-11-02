# Data Model: Riftwyrm Marketing Site

Everything here is static, typed data compiled into the site. There is no runtime store.

## Shared facts — `components/site.ts` (Principle IV)

| Field | Type | Rule |
|-------|------|------|
| `name` | string | the game's own name: Thrallis, Glaciarch, Cindermaw, Vesperath |
| `title` | string | The Stormcrown, Rime and Rock, The Pyrewind, The Unburied |
| `url` | string | absolute origin, no trailing slash |
| `developer` | string | |
| `email` | string | |
| `tagline` | string | one sentence, ≤160 chars (doubles as the meta description) |
| `pitch` | string | 2–3 sentences for the pitch section |
| `stores.googlePlay` | string | `""` until live; otherwise an `https://play.google.com/…` URL |
| `stores.appStore` | string | `""` until live; otherwise an `https://apps.apple.com/…` URL |

Validation:
- Store URLs are either empty or start with the store's own domain.
- Nothing else in the codebase repeats these values.

## Generated media — `components/media.generated.ts` (written by `scripts/sync-assets.mjs`)

```text
MediaImage { src: string  // under /media/…
             width: number; height: number }
```

Exported groups:

- `screenshots: Record<ScreenshotId, MediaImage>`
- `dragons: Record<DragonId, { art: MediaImage; head: MediaImage }>`
- `journeys: Record<string, MediaImage>`
- `enemies: Record<string, MediaImage>`
- `hero: MediaImage`
- `source: { gameVersion: string; syncedAt: string }`

Rules:
- The file is generated and never edited by hand.
- Every `src` must exist in `public/`, and `width` and `height` are its real pixel size.

## Content (hand-written, `components/content.ts`)

### Screenshot

| Field | Type | Rule |
|-------|------|------|
| `id` | `"title" \| "trial" \| "dragons" \| "showdown" \| "won"` | key into `screenshots` |
| `caption` | string | ≤60 chars, the site's own words |
| `alt` | string | describes what is on screen |

Order: title → trial → dragons → showdown → won.

### Dragon

| Field | Type | Rule |
|-------|------|------|
| `id` | `"lightning" \| "water" \| "fire" \| "shadow"` | |
| `name` | string | the game's own name: Thrallis, Glaciarch, Cindermaw, Vesperath |
| `title` | string | The Stormcrown, Rime and Rock, The Pyrewind, The Unburied |
| `order` | 1–4 | the unlock order: lightning, water, fire, shadow |
| `line` | string | the game's own flavour line (`flavor.dragon_<id>.official`) |
| `color` | `{ base: hex; bright: hex }` | from the Essence palette in `globals.css` |
| `alt` | string | |

### Feature

| Field | Type | Rule |
|-------|------|------|
| `title` | string | ≤40 chars |
| `body` | string | ≤140 chars |
| `icon` | path | a game icon (SVG) under `public/media/icons/` |

There are 4–6 features, and every claim must be confirmed (research R9).

### World art

`{ key, kind: "journey" | "enemy", name, alt }`, with 4–6 journeys and 6–8 enemies.

## Store button state

```text
StoreButton(store) = stores[store] === ""  →  Coming soon (dimmed plate, no link, "Coming soon" on hover/tap, sr-only ", coming soon")
                     otherwise              →  Live (same plate at full strength, <a href=url target=_blank>)

Store button fields: label ("App Store" | "Google Play"), eyebrow ("Download on the" | "Get it on"), href.
```

There are only these two states, and switching between them takes a rebuild.
