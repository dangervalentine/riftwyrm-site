# Quickstart: Validate the Marketing Site

## Prerequisites

- Node and npm, with `npm install` already done
- The game repo at `../dragon-hunter`, with a store screenshot run made
  (`cd ../dragon-hunter && scripts/dev store`); this is needed only to refresh assets

## 1. Refresh assets (US5)

```sh
npm run sync-assets
git status --short public/media components/media.generated.ts app/favicon.ico app/apple-icon.png
```

**Expected:**
- The command exits 0 and lists the files it wrote.
- Re-running it shows no diff.
- Running `npm run sync-assets -- --game /nonexistent` exits 1 and changes nothing.

## 2. Constitution gate (Principle V)

```sh
npm run lint && npm run build
```

**Expected:**
- Both pass.
- The build output lists `/`, `/privacy`, `/support`, `/opengraph-image`, `/manifest.webmanifest`,
  `/sitemap.xml` and `/robots.txt` as static (○).

## 3. Served surface (contract: `contracts/site-surface.md`)

```sh
npm run start &
for p in / /privacy /support /sitemap.xml /robots.txt /manifest.webmanifest /favicon.ico /icon.svg /apple-icon.png /opengraph-image /nope; do
  printf "%s " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:3200$p"; done
curl -s http://127.0.0.1:3200/ | grep -oE '<title>[^<]*|og:image"[^>]*|application/ld\+json|rel="canonical"[^>]*'
```

**Expected:**
- Every path returns 200 except `/nope`, which returns 404.
- The home page has a title, an `og:image`, JSON-LD and a canonical link.

## 4. Audits (SC-002, SC-003)

```sh
npx lighthouse http://127.0.0.1:3200/ --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless"
```

**Expected:**
- Performance is ≥ 90.
- Accessibility, best practices and SEO are each 100.
- CLS is about 0 and LCP is under 2.5 s.
- Repeat for `/privacy` and `/support`.

## 5. Palette check (SC-007)

```sh
grep -rnoE '#[0-9a-fA-F]{3,8}\b' app components --include=*.tsx --include=*.ts | grep -v media.generated
```

**Expected:** no hex colours outside `app/globals.css`, `components/palette.ts` and the store
button's livery (`components/StoreButton.tsx`, `components/storeMarks.ts`).

## 6. Manual checks

| Check | Expected |
|-------|----------|
| Widths 320 / 768 / 1440 / 2560 | Store buttons in the hero and the closing section; no horizontal page scroll |
| Gallery | Tap a shot → enlarged view; ←/→ and swipe change shots; Esc, backdrop click and back gesture close it; focus returns to the shot |
| JS disabled | All sections visible; a shot opens as a plain image |
| Reduced motion (OS setting) | No reveal, drift or parallax motion |
| Keyboard only | Every link is reachable, with a brass focus ring; placeholders are skipped |
| Store link | Set `site.stores.appStore` to a URL and rebuild → the App Store button shows at full strength in both places and links out; Google Play is still a placeholder |
| Share preview | Paste the deployed URL into the opengraph.xyz / LinkedIn / Facebook debuggers → title, description, image |
