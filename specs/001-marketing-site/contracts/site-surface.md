# Contract: Public Site Surface

These are what other systems depend on (the store listings, search engines, link unfurlers and
browsers), so they must stay stable.

## Routes (all statically rendered)

| Path | Purpose | Must |
|------|---------|------|
| `/` | Marketing home | Sections in the order given by FR-001; its own title and description; JSON-LD |
| `/privacy` | Privacy policy (store-required) | Keep its URL and content; restyled only |
| `/support` | Support (store-required) | Keep its URL and content; restyled only |
| `/sitemap.xml` | Sitemap | Lists `/`, `/privacy`, `/support` |
| `/robots.txt` | Robots | Allow all; point to the sitemap |
| `/manifest.webmanifest` | Web app manifest | name, short_name, icons 192/512, theme/background `#0c1013` |
| `/favicon.ico` | Legacy favicon | 16/32/48 |
| `/icon.svg` | Favicon | The game's app icon |
| `/apple-icon.png` | Apple touch icon | 180×180, opaque |
| `/opengraph-image` (+ `/twitter-image`) | Share image | 1200×630 PNG |
| any other path | 404 | The restyled not-found page, with a link home |

## Head metadata on every page

- `<title>` is unique per page: home "Riftwyrm: hunt dragons in a solo card game"; the others
  "Privacy Policy · Riftwyrm" and "Support · Riftwyrm"
- `<meta name="description">` is unique per page
- `<link rel="canonical">` is the absolute URL of the page
- Open Graph: `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type=website`,
  `og:site_name`
- Twitter: `twitter:card=summary_large_image`, plus the title, description and image
- `<meta name="theme-color" content="#0c1013">`

## Structured data (home only)

One `<script type="application/ld+json">` with `@type: ["VideoGame","MobileApplication"]`. Its
fields are listed in research R6. It has an `installUrl` only once a store URL is set, and never an `offers` price (none has been decided).

## Store button markup

Both states are ported from the portfolio's `StoreButton`. They use no images, and the store mark
is an inline `aria-hidden` SVG.

- **Coming soon**: `<span class="… cursor-not-allowed">` holding the mark, the eyebrow, the label
  and a screen-reader-only ", coming soon". It has no `href` and is not focusable. Its accessible
  text is, for example, "Download on the App Store, coming soon".
- **Live**: `<a href="{url}" target="_blank" rel="noreferrer">` holding the same contents without
  the sr-only suffix, with the brass focus ring.
- Both states take exactly the same size.

## Asset sync command

```text
npm run sync-assets [-- --game ../dragon-hunter] [-- --version 0.0.0]
```

- **Inputs**: `<game>/build/app-store/<newest|version>/iphone-6.9/0[1-5]-*.png`,
  `<game>/build/app-store/<v>/AppStore-icon-1024.png`, `<game>/art/painted/**`,
  `<game>/art/icons/**`, `<game>/art/launcher/*.svg`.
- **Outputs**: `public/media/**`, `app/favicon.ico`, `app/apple-icon.png`,
  `public/icons/icon-{192,512}.png`, `components/media.generated.ts`.
- **Exit codes**: `0` = success; `1` = the game folder or a required source file is missing (the
  message names the file), and nothing is written.
- Running it twice in a row with the same inputs produces identical output.
