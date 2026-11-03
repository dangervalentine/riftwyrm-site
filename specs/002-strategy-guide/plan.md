# Implementation Plan: Strategy Guide — How to Hunt Each Dragon

**Branch**: `main` (Principle II; feature identity is `specs/002-strategy-guide`) | **Date**: 2026-11-03 (revised after clarification) | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-strategy-guide/spec.md`

## Summary

Add five static editorial pages that turn the private *Playtest Round 2* report into player advice
(clarification 2026-11-03):

- **`/guide`**, the main guide page. It holds where the game stands, the win-chance table, a dragon
  index, the general lessons, the Empower value reference and the at-a-glance comparison.
- **`/guide/thrallis`**, **`/guide/glaciarch`**, **`/guide/cindermaw`** and **`/guide/vesperath`**,
  one per dragon. Each page has:
  - the deck to bring, the Speed to beat and the First Strike;
  - cards to raise and cards to pass on;
  - the dragon's tips;
  - links to the previous and next dragon, to the main guide, and to the lessons there.

The dragon pages come from one dynamic route, `app/guide/[dragon]/`. It is prerendered for the four
slugs with `generateStaticParams`, and `dynamicParams = false` so any other slug is a 404.

The figures come from two sources:

- **Generated from the game** by the existing `scripts/sync-assets.mjs`, into `guideStats` in
  `components/media.generated.ts`: deck targets, each dragon's Speed and First Strike, and every
  Adept Card's strength by Level with its Empower costs. The same run copies all 16 Adept Card faces
  and makes PNG share art for all four dragons.
- **Hand-written** in `components/guide.ts`: win rates, the raise and pass picks with their reasons,
  the dragon tips, the lessons and the edition line. Cards are referenced by game id (`C01`–`C16`).

Every page is a server component with no client JS. The pages are set in the site's palette and
fonts, and headed by the dragon art the site already ships.

## Technical Context

**Language/Version**: TypeScript 5, Node 20+

**Primary Dependencies**:
- Next.js 16.3.5 (App Router). This feature uses `generateStaticParams`, `dynamicParams`,
  `generateMetadata`, and a per-segment `opengraph-image.tsx` whose `params` is a Promise in v16.
- React 19.2, Tailwind CSS 4, `next/image` and `next/og`.
- No new dependencies. `sharp` (an existing devDependency) handles the extra images.

**Storage**: Files only:
- `components/guide.ts`, hand-written;
- `components/media.generated.ts`, regenerated;
- 16 card faces under `public/media/cards/`;
- per-dragon share art under `assets/og/`.

**Testing**:
- The `npm run lint` and `npm run build` gate.
- Module-load assertions in `guide.ts` ([data-model.md](data-model.md#validation-rules)).
- A grep for the banned vocabulary.
- The manual matrix in [quickstart.md](quickstart.md): 360 px, JS off, keyboard, screen reader and
  share previews.

**Target Platform**: Modern evergreen browsers, mobile first, served with the rest of the site.

**Project Type**: Static marketing website (existing).

**Performance Goals**:
- The home page's budget applies to each guide page: LCP < 2.5 s on mobile 4G and CLS ≈ 0.
- Lighthouse mobile ≥ 90 for performance and 100 for a11y and SEO.
- A dragon page's first load stays under about 600 KB: one art header plus about 7 card faces, all
  lazy below the fold.

**Constraints**:
- Every page is static (○ or ● in the build output).
- No client JS of the guide's own.
- Every colour comes from the game palette.
- Only the game's terms are used, and none of the report's testing vocabulary.
- Tables reflow at 360 px.

**Scale/Scope**:
- 5 pages and 5 share images.
- 4 dragon pages from one template.
- About 8 lessons, an Empower reference of 16 cards × 3 steps, 1 glance table and 1 win-chance
  table.
- 10 new card faces and 6 new share-art PNGs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | How |
|-----------|--------|-----|
| I. No AI attribution | ✅ | The byline is `site.developer`. Commits and copy carry no AI trailers or credits. |
| II. Work on main | ✅ | No branch or worktree. Specs live in `specs/002-strategy-guide/` on `main`. |
| III. Static by default | ✅ | `/guide` is static (○). `/guide/[dragon]` is prerendered for exactly four slugs by `generateStaticParams`, with `dynamicParams = false` (●, SSG). The share images are generated at build time. There is no route handler, secret or database. |
| IV. Single source of shared facts | ✅ | Name, developer and URL come from `site.ts`. Dragon names, titles, art and alt text come from `content.ts`. Each figure lives once, in `guide.ts` or `guideStats`, and all five pages read from there. No other game is named. |
| V. Lint and build gate | ✅ | Required before commit. `/privacy` and `/support` are untouched. |
| Stack: new dependency | ✅ none | — |

**Post-design re-check**: Still passing. The dynamic segment is fully static-generated with a
closed set of params, so it adds no server rendering at request time. The pages collect no data, so
the privacy policy is unaffected.

## Project Structure

### Documentation (this feature)

```text
specs/002-strategy-guide/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R11
├── data-model.md        # Phase 1: guide.ts and guideStats shapes, validation rules
├── quickstart.md        # Phase 1: verification matrix and refresh steps
├── contracts/
│   └── guide-pages.md   # Phase 1: URLs, anchors, page anatomy, metadata, vocabulary
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── guide/
│   ├── page.tsx                      # NEW: main guide page + Article JSON-LD
│   ├── opengraph-image.tsx           # NEW: share card, all four dragons
│   ├── twitter-image.tsx             # NEW: re-export, as the home page does
│   └── [dragon]/
│       ├── page.tsx                  # NEW: dragon page; generateStaticParams, dynamicParams=false, generateMetadata
│       ├── opengraph-image.tsx       # NEW: per-dragon share card (params is a Promise)
│       └── twitter-image.tsx         # NEW: re-export
├── sitemap.ts                        # EDIT: add /guide and the four dragon pages
└── globals.css                       # EDIT: .guide-* editorial styles

components/
├── guide.ts                          # NEW: hand-written guide data, slug helpers, assertions
├── media.generated.ts                # REGENERATED: + guideStats, + 16 adept faces
├── Header.tsx                        # EDIT: "Guide" link
├── Footer.tsx                        # EDIT: "Strategy guide" link
├── sections/Road.tsx                 # EDIT: one line linking to /guide where dragons are introduced
└── guide/                            # NEW: server components only
    ├── GuideHeader.tsx               # headline, standfirst, byline + edition (both page kinds)
    ├── DragonIndex.tsx               # main page: four dragon cards → /guide/<slug>
    ├── StandingTable.tsx             # main page: win chance by difficulty (FR-009)
    ├── Lessons.tsx                   # main page: lessons, tagged Tested / Observed
    ├── EmpowerTable.tsx              # main page: strength per Level, best and poorest steps
    ├── AtAGlance.tsx                 # main page: the four dragons compared, linking to each page
    ├── DragonArticle.tsx             # dragon page body: art header, stat strip, raise, pass, tips
    ├── CardChip.tsx                  # card face + "Name (Essence)" + reason
    ├── DragonNav.tsx                 # dragon page: ← previous · Guide · next →, plus breadcrumb
    └── EditionNote.tsx               # basis line (card set, round, date), on all five pages

scripts/
└── sync-assets.mjs                   # EDIT: guideStats(), 16 adept faces, assets/og/<id>-{lair,dragon}.png

public/media/cards/adept-*-<essence>.webp   # 16 faces
assets/og/<id>-lair.png, <id>-dragon.png    # share art for 4 dragons (fire reuses the existing pair's source)
```

**Structure Decision**:
- Pages live in `app/` and use Next's static params for the four dragon pages.
- Guide components get their own folder.
- Game-derived numbers go in the generated module, and hand-written copy in a typed data module,
  as `content.ts` does for the home page.

## Complexity Tracking

No constitution violations. Nothing to justify.
