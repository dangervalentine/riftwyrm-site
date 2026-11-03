# Contract: the guide pages

This is the public surface other pages, search engines and shared links rely on. Each address and
anchor is stable once published. Renaming one is a breaking change.

## URLs

| Address | Page |
|---|---|
| `/guide` | Main guide page |
| `/guide/thrallis` | Thrallis, the Stormcrown (Lightning) |
| `/guide/glaciarch` | Glaciarch, Rime and Rock (Water) |
| `/guide/cindermaw` | Cindermaw, the Pyrewind (Fire) |
| `/guide/vesperath` | Vesperath, the Unburied (Shadow) |
| `/guide/<anything else>` | 404 (the site's not-found page) |

### Anchors on `/guide`

`#standing`, `#dragons` (index), `#lessons`, `#lesson-<id>` (one per lesson), `#empower`,
`#at-a-glance`

### Anchors on a dragon page

`#deck`, `#raise`, `#pass`, `#tips`

## Main guide page: section order

1. Header: headline, standfirst, byline (`site.developer`), edition line.
2. `#standing`: where the game stands, plus the win-chance table.
3. `#dragons`: four dragon cards in unlock order. Each shows the name, title, Essence, a one-line
   verdict and its two key numbers, and links to its page.
4. `#lessons`
5. `#empower`
6. `#at-a-glance`: each dragon's row links to its page.
7. Edition note.

## Dragon page: anatomy

All four pages are the same, in this order (SC-004):

1. Breadcrumb: Guide › <Name>.
2. Art header: the dragon over its lair, with the name, title and Essence, and a one-line verdict.
3. `#deck` stat strip: deck for an even chance · deck to win four in five · Speed · First Strike.
   Then the win chance at Normal and at Dire, with a link to `/guide#standing`.
4. Intro: 1–2 paragraphs.
5. `#raise`: card chips, lead card first.
6. `#pass`: card chips.
7. "Good, not first" (only if that dragon has disputed cards).
8. `#tips`: dragon-specific tips, then a "Lessons for every dragon" link to `/guide#lessons`.
9. Dragon nav: ← previous dragon · Guide · next dragon →, wrapping in unlock order.
10. Edition note.

## Metadata

| | Main guide page | Dragon page |
|---|---|---|
| Title (with layout template) | "How to hunt each dragon · Riftwyrm" | "How to beat <Name> · Riftwyrm" |
| Description (≤ 160 chars) | What the guide teaches | That dragon's deck target, Speed and top cards, in one sentence |
| Canonical | `/guide` | `/guide/<slug>` |
| OG / Twitter image | Four dragon heads + title | The dragon over its lair + "How to beat <Name>" |
| JSON-LD | `Article` | `Article` + `BreadcrumbList` |

The sitemap lists all five.

## Links in

- Site header: "Guide" → `/guide`, on every page.
- Site footer: "Strategy guide" → `/guide`.
- Home page road section: one sentence with a link to `/guide`.

## Vocabulary

**Game terms**, used as the game uses them: Empower, Brace, Detour, Meld, Rally, Approach,
Reckoning, Showdown, Trial, Region, Level, XP, Speed, Boost, Essence, Trash, Grade, First Strike.

**Banned** (FR-010) in every guide page's HTML, case-insensitive: `heuristic`, `oracle`,
`honest search`, `McNemar`, `p-value`, `bootstrap`, `seed`, `ladder`, `r2-`, `simulator`, `solver`,
`playout`. Task ids (`T0nn`) are banned too.

Other games, publishers and their terms are never named (constitution IV).

## Behaviour

- Every page works fully with JavaScript off. The guide ships no client components.
- There is no horizontal page scroll at 360 px.
- Images below the fold are lazy-loaded. Card chip images are decorative (`alt=""`), and dragon art
  takes its alt text from `content.ts`.
- There is no motion beyond the site's existing hover states, and those respect
  `prefers-reduced-motion`.
