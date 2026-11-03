# Quickstart: Strategy Guide

## Prerequisites

- Node 20+, with `npm install` already run.
- The game repo is at `../dragon-hunter` (or set `GAME_DIR`), with `build/card-shots/adept/*.png`
  and `art/painted/{dragons,lairs}/dragon_*.png` present. If the card faces are missing, regenerate
  them with the card tool command in `scripts/sync-assets.mjs`'s header.

## Build and run

```sh
npm run sync-assets        # guideStats, 16 card faces, per-dragon share art
npm run lint && npm run build
npm run start              # http://127.0.0.1:3200/guide
```

The build output must show `/guide` as static (○) and `/guide/[dragon]` as SSG (●) with exactly
four paths: thrallis, glaciarch, cindermaw and vesperath.

## Validation scenarios

These map to the spec's success criteria and the [pages contract](contracts/guide-pages.md).

| # | Check | Expected |
|---|---|---|
| 1 | Open `/guide`, click Cindermaw in the dragon index | `/guide/cindermaw` opens. It shows deck 43 / 46, Speed 9, First Strike 9, Cold Blaze (Water) first under Raise, and Blinding Blade (Water) under Pass on (SC-001). |
| 2 | On `/guide/vesperath`, use the dragon nav | "Next" goes to Thrallis and "previous" to Cindermaw. "Guide" returns to `/guide`. |
| 3 | Compare `/guide/thrallis` with `/guide/glaciarch` | They have the same parts in the same order (SC-004). |
| 4 | `for p in guide guide/thrallis guide/glaciarch guide/cindermaw guide/vesperath; do curl -s :3200/$p \| grep -ioE 'heuristic\|oracle\|honest search\|mcnemar\|bootstrap\|ladder\|solver\|playout\|simulator\|r2-'; done` | No output (SC-003). |
| 5 | Check the figures against the report (research R3, R4) | All match (SC-002). |
| 6 | `curl -s -o /dev/null -w '%{http_code}' :3200/guide/smaug-not-a-dragon` | `404` |
| 7 | DevTools at 360 × 740 on `/guide` and one dragon page | No horizontal page scroll. The tables reflow into blocks (SC-006). |
| 8 | Disable JavaScript and reload all five pages | Each is complete, and the index and dragon nav work (SC-006). |
| 9 | Tab through `/guide` and one dragon page | Every link has a visible focus. The skip link works. |
| 10 | Run VoiceOver over the tables and breadcrumb | Captions, headers and the breadcrumb are announced. |
| 11 | Check the header and footer on `/`, `/support`, `/privacy`, a dragon page and `/404` | The guide link is present (SC-005). |
| 12 | `curl -s :3200/sitemap.xml \| grep -c /guide` | `5` (SC-005). |
| 13 | View the source of `/guide` and `/guide/cindermaw` | Each has its own title, description, canonical and `og:image`. The dragon page also has `BreadcrumbList`. |
| 14 | Open `/guide/cindermaw/opengraph-image` and `/guide/opengraph-image` | Cindermaw over its lair with "How to beat Cindermaw", and the four heads with the guide's title. |
| 15 | Change `deckEven` for fire by hand in the generated file, then rebuild | `/guide/cindermaw`, the index card and the at-a-glance row all show the new value (SC-007). Revert afterwards. |
| 16 | Put one card in both `raise` and `pass` in `guide.ts`, then build | The build fails with a clear message. Revert afterwards. |
| 17 | Lighthouse (mobile) on `/guide` and `/guide/cindermaw` | Performance ≥ 90, and Accessibility and SEO 100. |

## Refreshing after a new playtest round or card set

1. In the game repo, regenerate `data/deck_guide.json` and the card shots.
2. Run `npm run sync-assets`. The deck targets, Speed, First Strike, card strength and art update
   themselves.
3. In `components/guide.ts`, update `standing`, the picks and their reasons (applying the R3 rule to
   the new report), the dragon descriptions, any lesson effects, and `edition`.
4. Run `npm run lint && npm run build`, then repeat scenarios 1–8.
