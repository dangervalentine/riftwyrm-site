# Feature Specification: Strategy Guide — How to Hunt Each Dragon

**Feature Directory**: `specs/002-strategy-guide` (work stays on `main`, constitution Principle II)

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "turn this artifact https://claude.ai/artifact/DRULjQNuDKAamH8jkxuh1v into a page in the website styled as an editorial article aimed at educating and informing players tips and tricks at playing the game, using the data in the artifiact. we would want tips for each dragon, what cards are the best per dragon and what should be passed. any lessons would be good."

## Context

The source is the developer's private report *Riftwyrm Playtest Round 2* (completed 29 Oct 2026):
long simulated play of every difficulty against every dragon, tested tips with measured effects,
per-dragon card values, deck-strength targets and observed lessons. It is written for the
developer, in testing language (players named "heuristic", "oracle", p-values, task numbers,
run names).

This feature turns that evidence into a player-facing article on the site: a strategy guide that
reads like an editorial feature, says plainly what to do, and keeps only the numbers a player can
use at the table. The report itself stays private; only the conclusions and player-relevant
figures move to the site.

## Clarifications

### Session 2026-11-03

- Q: Should the guide be one long page, or a main guide page plus a separate page for each dragon? → A: A main guide page plus four dragon pages. `/guide` holds the overview, win chances, lessons, Empower reference, at-a-glance comparison and a dragon index; `/guide/thrallis`, `/guide/glaciarch`, `/guide/cindermaw` and `/guide/vesperath` each hold one dragon's full section, with previous/next dragon links and a link back to the guide.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A player stuck on one dragon learns how to beat it (Priority: P1)

A player keeps losing to one dragon (most often Cindermaw, the Fire dragon). They open the guide,
go straight to that dragon's page and learn: how hard it is compared with the others, how strong
a deck they need when the Showdown begins, its Speed to beat, which cards to raise first, and which
cards to let go of (spend on Braces, skip when Empowering).

**Why this priority**: this is the core ask — tips per dragon, best cards per dragon, what to pass.
It alone makes the page worth publishing.

**Independent Test**: open any one dragon's page, and confirm it names its
deck target, its Speed, at least three cards to favour and at least two to pass on, each with a
one-line reason, all matching the source report.

**Acceptance Scenarios**:

1. **Given** a player on the main guide page, **When** they choose a dragon from the dragon index,
   **Then** they land on that dragon's own page, which holds only that dragon's advice.
2. **Given** the Cindermaw page, **When** a player reads it, **Then** they learn it needs the
   biggest deck (a total of about 43 Levels for an even chance, 46 to win four times in five), that
   it strikes first unless their Speed is above 9, that it hits harder than the other dragons, and
   that Cold Blaze and Scorch (both Water) are the cards to raise.
3. **Given** any dragon page, **When** a player reads its "pass on" list, **Then** each card is
   named with its Essence (e.g. "Ember Dash (Fire)") and a reason it is a poor place for Levels
   against that dragon.
4. **Given** a player on one dragon's page, **When** they finish reading, **Then** they can go to
   the previous or next dragon's page, or back to the main guide, in one click.

---

### User Story 2 - A new player learns the general lessons that win games (Priority: P1)

A player who has learned the rules but wins rarely reads the general lessons: the Regions are deck
building for the Showdown; Empower the card that gains the most strength, not the strongest card;
Brace with as few cards as possible and keep Level 1 cards out of the Trash; Detour when the best
Play is weak; don't Meld just for the enhancement; don't chase Speed when Empowering; use the
Rally on the Approach when the seven drawn cards hold your hardest hitters or lack your movers.

**Why this priority**: these lessons apply to every dragon and difficulty and carry the biggest
measured gains (the two kept general tips together lifted a simple player's wins by about 15
points).

**Independent Test**: read the lessons section alone and confirm each lesson states what to do,
why, and how strong the evidence is (tested vs. observed), with no testing jargon.

**Acceptance Scenarios**:

1. **Given** the lessons section, **When** a player reads it, **Then** each lesson leads with a
   plain instruction ("Empower the card that gains the most strength") followed by a short reason.
2. **Given** a lesson that was tested and found harmful (Melding for enhancement, chasing Speed,
   Empowering the strongest card), **When** a player reads it, **Then** it is framed as a
   "don't" or "myth", with the measured cost in plain words (e.g. "cost about one game in ten").
3. **Given** a lesson that was only observed, not tested, **When** a player reads it, **Then** the
   article signals it is a strong hint rather than a proven rule.

---

### User Story 3 - A player plans Empowerments using the best-value steps (Priority: P2)

A player deciding where to spend XP looks up which Empower steps give the most strength per XP and
which are poor value, card by card.

**Why this priority**: useful reference beyond the per-dragon advice, but secondary to it.

**Independent Test**: find the best-value and poorest-value Empower steps in the guide and check
them against the card data in the source.

**Acceptance Scenarios**:

1. **Given** the Empower reference, **When** a player reads it, **Then** the five best-value steps
   are named (Static Rush (Fire) 1→2: +5 for 1 XP; Lightning Step (Lightning) 1→2 and Lightning
   Step (Shadow) 1→2: +5 for 2 XP; Void Slam (Water) 2→3: +5 for 3 XP; Swift Current (Lightning)
   3→4: +5 for 5 XP) and the poorest are named as well.
2. **Given** a small phone screen, **When** a player views any table in the guide, **Then** it
   remains readable without horizontal page scrolling.

---

### User Story 4 - A visitor finds the guide from the rest of the site and from search (Priority: P2)

A visitor on the home page, support page or a search engine finds the guide and can share a link
to it, or to one dragon's page.

**Why this priority**: the article only helps players who can find it.

**Independent Test**: from the home page, reach the guide in one click; share a link to one dragon's
page and confirm it opens on that dragon with its own preview.

**Acceptance Scenarios**:

1. **Given** any page on the site, **When** a visitor looks at the header or footer, **Then** a link
   to the guide is present.
2. **Given** the guide's address shared in a chat app, **When** the preview renders, **Then** it
   shows the guide's own title, description and image.
3. **Given** a dragon page's address shared in a chat app, **When** the preview renders, **Then** it
   shows that dragon's own title, description and art (e.g. "How to beat Cindermaw").
4. **Given** the sitemap, **When** it is fetched, **Then** it lists the main guide and all four
   dragon pages.

---

### User Story 5 - The guide can be refreshed when the next playtest round lands (Priority: P3)

When a new playtest round or a new card set changes the numbers, the developer can update the
guide's figures in one place without rewriting the article's layout.

**Why this priority**: the report marks most numbers as "this card set: regenerate per expansion";
the guide must not rot silently.

**Independent Test**: change one deck target in the guide's data and confirm every place it appears
in the article updates.

**Acceptance Scenarios**:

1. **Given** a new deck target for one dragon, **When** the developer changes it once, **Then** the
   dragon page, the main guide page's summary table and any comparison show the new value.
2. **Given** the published guide, **When** a player reads it, **Then** it states which edition of the
   cards and which playtest round its numbers come from, and the date.

---

### Edge Cases

- The source ranks some cards differently in its two measures (which decks won vs. solving the
  Showdown exactly). The guide must reconcile them per dragon — favour cards both measures rate
  highly, and not present a card as "best" in one place and "pass" in another.
- Card names repeat across Essences (Cold Blaze, Inferno, Swift Current, Lightning Step, Surge exist
  in two Essences each). Every mention must carry the Essence so the advice is unambiguous.
- Glaciarch (Water): the dragon-aware Empower advice adds almost nothing there (the biggest-jump rule
  is already right). Its page must say so rather than invent card priorities stronger than the
  evidence.
- Rules dead end found by the simulator (Detouring the last Hand card can leave a Trial with no legal
  move): mention as a caution only if it is still possible in the shipped game; otherwise omit.
- Readers with JavaScript off, reduced motion, or a screen reader must get the full article,
  including every table and the dragon index.
- Numbers below a meaningful threshold (e.g. +0.3 vs −0.3 points) must not be presented as
  meaningful differences.

## Requirements *(mandatory)*

### Functional Requirements

**Content**

- **FR-001**: The guide MUST be a set of five editorial pages, each with a headline, a standfirst, a
  byline/date line, and prose with pull-out tips and compact tables:
  - a **main guide page** at `/guide` holding where the game stands (FR-002), a dragon index, the
    general lessons (FR-005), the Empower reference (FR-007) and the at-a-glance comparison (FR-008);
  - one **dragon page** per dragon at `/guide/thrallis`, `/guide/glaciarch`, `/guide/cindermaw` and
    `/guide/vesperath`, each holding that dragon's full advice (FR-003).
- **FR-002**: The guide MUST open with "where the game stands": every difficulty can be beaten, the
  dragons differ in difficulty (Cindermaw hardest, then Vesperath, with Thrallis and Glaciarch
  closest to each other), and the Regions are deck building for the Showdown — good play reached
  the Showdown in every game, so every earlier choice is about the deck brought to it.
- **FR-003**: Each dragon page (Thrallis/Lightning, Glaciarch/Water, Cindermaw/Fire,
  Vesperath/Shadow) MUST give:
  - its name, title and Essence, using the game's own names;
  - how strong a deck to bring: the total Level for an even chance and for winning four in five;
  - its Speed (the dragon strikes first unless the player's Speed is above it);
  - **cards to raise**: at least three, each named with its Essence and a reason;
  - **cards to pass on**: at least two cards where Levels are worth least against this dragon —
    the ones to skip when Empowering and to give up first when Bracing;
  - one or more dragon-specific tips (e.g. why Cindermaw needs a bigger deck: it hits for 24 at the
    middle Grade and 15 at the top Grade where the others hit 20 and 11–13).
- **FR-004**: Per-dragon card advice MUST be drawn from the source's two card rankings (value by
  deck outcome; value by exact Showdown solving) and MUST agree with both where they agree; where
  they disagree, the guide MUST favour the card both rate well and MUST NOT list one card as both
  "raise" and "pass".
- **FR-005**: The main guide page MUST include a general lessons section covering at least: Regions are deck
  building; Empower the biggest strength jump (not the strongest card); weigh the dragon you face
  when Empowering and Bracing; Brace with the fewest cards and keep Level 1 cards out of the Trash;
  Detour when the best Play is weak (at most twice a Trial); don't Meld just for the enhancement;
  don't chase Speed when Empowering, but aim a Boost at Speed in the Reckoning when it lifts you
  past the dragon; use the Rally on the Approach when the seven cards drawn hold your hardest
  hitters or lack your movers.
- **FR-006**: Each lesson MUST say whether it was tested in head-to-head play or observed from how
  strong players play, in reader-friendly words, and MAY state the measured effect in plain terms
  ("won about 12 more games in 100").
- **FR-007**: The guide MUST include an Empower value reference: the best-value and poorest-value
  Empower steps, and how a card's strength is counted (best Spell figure plus Boost).
- **FR-008**: The guide MUST include a compact at-a-glance summary comparing the four dragons
  (difficulty, deck targets, Speed, top cards, cards to pass) for readers who skip the prose.
- **FR-009**: The guide MAY show how win chance changes with difficulty or deck strength per dragon,
  as a chart or table, if it helps a player choose a difficulty or set a target; if shown, it MUST
  use the strong-but-fair player's figures (the one that knows only what a player at the table
  knows), not the all-knowing ceiling.
- **FR-010**: The article MUST NOT contain the source's internal language: no test-player names
  ("heuristic", "oracle", "honest search"), statistical test names or p-values, task or run
  identifiers, seeds, or references to the developer's tooling. Statistical confidence is
  expressed in words.
- **FR-011**: The article MUST use the game's own terms (Empower, Brace, Detour, Meld, Rally,
  Approach, Reckoning, Showdown, Trial, Region, Level, XP, Speed, Boost, Essence, Trash, Grade) and
  MUST NOT name other games or their terms (constitution Principle IV).
- **FR-012**: The guide MUST state its basis: which card set and playtest round its numbers come
  from, and when it was last updated, and that numbers will change with new cards.

**Presentation**

- **FR-013**: Every guide page MUST read as an editorial article in the site's existing visual language
  (game palette, display serif and body sans), with a comfortable reading width, and MAY use the
  game's dragon art and card art already on the site to head each dragon page.
- **FR-014**: The main guide page MUST provide a dragon index near the top linking to each dragon
  page, in unlock order. Each dragon page MUST link to the previous and next dragon pages and back
  to the main guide, and SHOULD point readers to the general lessons there. All five addresses MUST
  stay stable once published.
- **FR-015**: Tables MUST be readable on a 360-px-wide screen without the page scrolling sideways.
- **FR-016**: The full article, including tables and index, MUST be available without JavaScript and
  usable with a keyboard and screen reader; any motion MUST respect reduced-motion settings.

**Site integration**

- **FR-017**: The site header and footer MUST link to the main guide page; the home page SHOULD link to it
  where it talks about dragons or difficulty.
- **FR-018**: Each of the five guide pages MUST have its own title, meta description, canonical
  address and share preview (each dragon page's preview shows that dragon), and all five MUST be
  listed in the sitemap.
- **FR-019**: The guide's numbers and card lists MUST live in one data source the article reads
  from, so a refresh changes each figure once (constitution Principle IV spirit).
- **FR-020**: Every guide page MUST be statically rendered and pass the lint and build gate; `/privacy` and
  `/support` MUST keep resolving (constitution Principles III and V).

### Key Entities

- **Dragon**: name, title, Essence, unlock order; deck target for an even chance and for four in
  five; Speed; attack facts that explain its difficulty; cards to raise; cards to pass on;
  dragon-specific tips.
- **Card**: name and Essence (the pair is the identity); strength by Level; Empower steps with
  strength gained and XP cost; per-dragon value.
- **Lesson**: instruction, reason, evidence kind (tested / observed), plain-words effect, scope
  (all dragons, or this card set).
- **Guide edition**: card set, playtest round, date — shown on the page and changed when the data
  is refreshed.

### Source facts (from the report, for the article's data)

| Dragon | Essence | Even chance | Win 4 in 5 | Speed | Raise | Pass on |
|---|---|---|---|---|---|---|
| Thrallis | Lightning | 39 | 42 | 13 | Static Rush (Fire), Lightning Step (Lightning), Cold Blaze (Water), Swift Current (Shadow) | Scorch (Water), Blinding Blade (Water), Surge (Lightning) |
| Glaciarch | Water | 38 | 41 | 10 | Swift Current (Shadow), Swift Current (Lightning), Cold Blaze (Water), Shadow Stride (Shadow) | Blinding Blade (Water), Ember Dash (Fire), Surge (Lightning) |
| Cindermaw | Fire | 43 | 46 | 9 | Cold Blaze (Water), Scorch (Water), Swift Current (Shadow), Cold Blaze (Fire) | Blinding Blade (Water), Void Slam (Water), Surge (Fire/Lightning) |
| Vesperath | Shadow | 40 | 43 | 12 | Inferno (Shadow), Inferno (Lightning), Shadow Stride (Shadow) | Ember Dash (Fire) (clearly below average), Blinding Blade (Water) |

Notes for drafting: "Pass on" cards are low in both rankings. Ember Dash (Fire) is lowest for
Thrallis in Showdown solving but mid (+4.4) by deck outcome, so it is not on Thrallis's pass list.
Scorch (Water) and Cold Blaze (Fire) lead for Cindermaw by deck outcome but are not in the Showdown
solving's top three — fine to raise, since neither ranks them low. Lightning Step (Shadow) ranks top for Thrallis in the Showdown solving but only
+2.3 by deck outcome — treat as "good, not first". Shadow Stride (Shadow) is top-two for Cindermaw
in Showdown solving but mid by deck outcome — mention, don't lead with it. Inferno (Shadow) for
Glaciarch is high in Showdown solving, mid by deck outcome. Win rates for a strong player that
knows only what a player can see, on Dire: Glaciarch 73%, Thrallis 68%, Vesperath 59%, Cindermaw
25%; on Normal: 95%, 88%, 89%, 72%. A deck of roughly every card at Level 3 is the general target.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reader can find any one dragon's deck target, Speed, cards to raise and cards to
  pass within 30 seconds of opening the main guide page (one click to the dragon's page).
- **SC-002**: 100% of figures and card recommendations in the guide trace to the source report;
  none contradicts it.
- **SC-003**: Zero occurrences of the source's internal testing vocabulary (FR-010) in the published
  page.
- **SC-004**: All four dragon pages present the same set of elements (deck target, Speed, raise,
  pass, tips) — a reader comparing two dragons finds the same things in the same places.
- **SC-005**: The main guide page is reachable in one click from every page of the site, every
  dragon page in two, and all five guide pages are listed in the sitemap.
- **SC-006**: Every guide page is fully readable on a 360-px-wide screen with no sideways scrolling and with
  JavaScript disabled.
- **SC-007**: Changing one figure in the guide's data updates every place it appears, with no other
  edit needed.

## Assumptions

- "What should be passed" means cards to pass over: the ones where a Level is worth least against
  that dragon — skip them when Empowering and give them up first when Bracing. It does not mean a
  card-passing mechanic.
- The audience is players who already know the rules (the in-game lessons and Glossary teach them);
  the guide links to nothing outside the site to explain terms, but defines a term briefly the first
  time it matters.
- The guide uses the round 2 numbers only; round 1 comparisons, the advice-tool timings, the phone
  checks and the testing method stay out of the article.
- The strong-but-fair player's results stand in for "playing well"; the all-knowing player is
  mentioned at most once, to say even perfect knowledge of the deck wins Dire Cindermaw only about
  four times in five.
- The main guide page is titled along the lines of "How to hunt each dragon" and each dragon page
  along the lines of "How to beat Cindermaw"; final wording is an editorial choice in planning.
- No new art is made for this feature; it reuses dragon and card art already on the site.
- The developer is credited as author per the shared site facts; no AI attribution appears
  (constitution Principle I).
