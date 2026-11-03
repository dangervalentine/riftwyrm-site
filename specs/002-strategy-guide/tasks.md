---
description: "Task list for the strategy guide (main guide page + four dragon pages)"
---

# Tasks: Strategy Guide — How to Hunt Each Dragon

**Input**: Design documents from `specs/002-strategy-guide/`

**Prerequisites**: plan.md, spec.md (with Clarifications 2026-11-03), research.md (R1–R11),
data-model.md, contracts/guide-pages.md, quickstart.md

**Tests**: The spec asks for no automated tests. Verification is:
- the constitution's lint and build gate;
- the module-load assertions in `components/guide.ts` (data-model.md "Validation rules"), which fail
  the build;
- the scenarios in `quickstart.md`, run at each checkpoint.

**Organization**: Tasks are grouped by user story, so each story can be built and checked on its own.

**Constitution reminders for every task**:
- No AI attribution in commits, comments or copy (I).
- Work on `main` only (II).
- Pages stay static (III).
- Shared facts are imported from `components/site.ts`, and dragon names, titles and alt text from
  `components/content.ts`. Copy names no other game, publisher or their terms (IV).
- `npm run lint && npm run build` must pass before any commit (V).

**Copy rules for every task that writes words** (FR-010, FR-011, contracts/guide-pages.md
"Vocabulary"):
- Use the game's terms: Empower, Brace, Detour, Meld, Rally, Approach, Reckoning, Showdown, Trial,
  Region, Level, XP, Speed, Boost, Essence, Trash, Grade, First Strike.
- Never write: heuristic, oracle, honest search, McNemar, p-value, bootstrap, seed, ladder, r2-,
  simulator, solver, playout, or task ids.
- Say "a strong player" for the measured player, and state effects in words ("about 12 more wins
  in 100 games").
- Always name a card with its Essence: "Cold Blaze (Water)".

**Game repo**: `../dragon-hunter` (override with `GAME_DIR`). It holds:
- `data/cards.json`, `data/text.json` and `data/deck_guide.json`;
- the card faces, in `build/card-shots/adept/NN_Cxx.png`;
- the art, in `art/painted/{dragons,lairs}/dragon_<id>.png`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: the user story the task serves (US1–US5)

---

## Phase 1: Setup

**Purpose**: Get the game-derived numbers and images into the repo.

- [X] T001 In `scripts/sync-assets.mjs`, add a `guideStats(game)` function next to `regionStats`.
  - **Inputs**: `data/cards.json`, `data/text.json` and `data/deck_guide.json`.
  - **Output**: `{ dragons: Record<"lightning"|"water"|"fire"|"shadow", { speed, firstStrike, deckEven, deckLikely }>, cards: Record<"C01".."C16", { name, essence, image, strength: [n,n,n,n], stepCost: [n,n,n] }> }`.
  - **Dragon fields**:
    - `speed` is `dragons[].initiative`;
    - `firstStrike` is `dragons[].first_strike.value`;
    - `deckEven` and `deckLikely` are `deck_guide.json` `content.classic["dragon_<id>"].even` and `.likely`.
  - **Card fields**:
    - `name` is `text.json` `keys[card.name_key].official`;
    - `essence` is `adept_cards[].affinity`;
    - each strength is `max(level.basic.value, level.enhanced.value) + level.boost`;
    - `stepCost[i]` is `levels[i].level_up_cost` for i = 0..2;
    - `image` is `/media/cards/adept-<kebab name>-<essence>.webp`.
  - **Failures**: call `fail(...)` if a dragon is missing from `deck_guide.json`, a name is missing,
    or a card does not have exactly 4 levels.
  - **Check**: Static Rush (C16) must come out as strength `[5,10,13,17]` with stepCost `[1,3,4]`.
- [X] T002 In `mediaModule(...)` in `scripts/sync-assets.mjs`, take a fourth argument and emit
  `export const guideStats = … as const;` after `regionStats`, with a one-line doc comment. Pass
  `guideStats(args.game)` from the call site (currently line ~547).
- [X] T003 In `plan(...)` in `scripts/sync-assets.mjs`, add a job for every Adept Card face.
  - Glob `build/card-shots/adept/*.png` and read the id from the file name (`NN_Cxx.png` → `Cxx`;
    ignore the `NN_` prefix).
  - Write each to `public/media/cards/adept-<kebab name>-<essence>.webp` with `{ card: 480 }`, under
    the media key `cards.adept_<id>` (e.g. `cards.adept_C04`).
  - Keep the existing six `ADEPT_CARDS` jobs unchanged; the home page uses them.
  - Fail if there are not exactly 16.
- [X] T004 In `plan(...)` in `scripts/sync-assets.mjs`, add per-dragon share art for all four
  dragons (`DRAGONS`):
  - `art/painted/lairs/dragon_<id>.png` → `assets/og/<id>-lair.png` (resize width 400, png
    compressionLevel 9);
  - `art/painted/dragons/dragon_<id>.png` → `assets/og/<id>-dragon.png` (resize width 560, png
    palette quality 90).

  Use the same transforms as the existing `og.lair` and `og.dragon` jobs, and leave those jobs as
  they are.
- [X] T005 Run `npm run sync-assets`. Confirm that:
  - `components/media.generated.ts` now exports `guideStats` with 4 dragons and 16 cards, and Fire
    shows `deckEven` 43, `deckLikely` 46, `speed` 9 and `firstStrike` 9;
  - `public/media/cards/` has 16 new `adept-*-<essence>.webp` files;
  - `assets/og/` has 8 PNGs.

  Then run `npm run lint && npm run build`.

**Checkpoint**: The generated data and images exist, and the site still builds unchanged.

---

## Phase 2: Foundational (blocks every story)

**Purpose**: The data module, the shared components and the styles that all five pages use.

- [X] T006 Create `components/guide.ts` with the data-model.md shapes:
  - `CardId` (= `keyof typeof guideStats.cards`), `Evidence`, `DragonSlug`, `Difficulty`
    (`"casual"|"easy"|"normal"|"hard"|"brutal"|"dire"`, with display labels).
  - `guideDragons`, derived from `content.ts` `dragons` in unlock order, with
    `slug = name.toLowerCase()`. This is the only place a slug is made.
  - `dragonBySlug(slug)` and `neighbours(id)` (prev/next, wrapping: Vesperath → Thrallis).
  - `cardLabel(id)`, which returns `"Name (Essence)"` with the Essence capitalised.
  - `edition = { cardSet: "Classic", round: "Playtest round 2", updated: "2026-10-29" }`.

  Leave `standing`, `dragonGuides`, `lessons` and `empowerNotes` exported but empty-typed for now;
  later tasks fill them.
- [X] T007 Add the validation rules from data-model.md to the bottom of `components/guide.ts` as
  module-load assertions. Each throws an `Error` with a message naming the dragon, card or lesson.
  1. Every CardId in `raise`, `pass`, `aside` and `empowerNotes` exists in `guideStats.cards`.
  2. Per dragon, `raise ∩ pass = ∅`, and `aside` cards are in neither list.
  3. Per dragon, `raise.length ≥ 3`, `pass.length ≥ 2` and `tips.length ≥ 1`.
  4. `standing` has 4 dragons × 6 difficulties, each 0–100.
  5. No string anywhere in the module's exported data matches
     `/heuristic|oracle|honest search|mcnemar|p-value|bootstrap|\bseed|ladder|r2-|simulator|solver|playout|\bT0\d\d\b/i`.
  6. `guideDragons` has exactly the 4 dragons of `content.ts`, and every `lessonLinks` id exists in
     `lessons`.
  7. Each `description` is ≤ 160 characters.

  Skip rules 2, 3 and 7 for a dragon whose `dragonGuides` entry is not yet filled, so the build
  passes between stories.
- [X] T008 [P] Add the editorial styles to `app/globals.css`, using palette variables only (no new
  colours):
  - `.guide-col`: about 72ch measure, centred, `px-6`.
  - `.guide-standfirst`: larger muted serif.
  - `.guide-byline`: small caps, faint.
  - `.guide-dropcap`: first-letter, display serif in brass, floats 3 lines.
  - `.guide-tip`: "Rule of thumb" pull-out, with a brass left rule on a raised stone ground.
  - `.guide-stats`: a 4-up strip that wraps to 2-up below 480 px.
  - `.guide-table`, which reflows below 640 px: `thead` visually hidden, each `tr` a block, each
    `td::before { content: attr(data-label) }`.
  - Focus-visible rings matching the site's.
  - Any transition guarded by `prefers-reduced-motion`.
- [X] T009 [P] Create `components/guide/GuideHeader.tsx`, a server component.
  - **Props**: `{ kicker?: string; title: string; standfirst: string; art?: { src; width; height; alt } }`.
  - **Renders**: an `<h1>` in the display serif, the standfirst, and a byline "By
    {site.developer} · Updated {formatted edition.updated}".
  - **Art**: when given, a full-bleed `next/image` header with `priority`.
- [X] T010 [P] Create `components/guide/EditionNote.tsx`. It renders one short paragraph: "Numbers
  from {edition.round} on the {edition.cardSet} cards, updated {date}. They will change as new cards
  arrive."
- [X] T011 [P] Create `components/guide/CardChip.tsx`.
  - **Props**: `{ card: CardId; reason: string; tone: "raise" | "pass" | "aside" }`.
  - **Renders**: a 56 px-wide card face from `guideStats.cards[card].image` (`next/image`, lazy,
    `alt=""`), the `cardLabel(card)` in bold, an Essence icon from `/media/icons/<essence>.svg`
    (`alt=""`), and the reason.
  - **Tone**: sets a small left rule colour: jade for raise, faint for pass, brass for aside.
  - **Output**: an `<li>`, so lists stay semantic.

**Checkpoint**: The build passes. `guide.ts` loads, and its assertions run on the empty data.

---

## Phase 3: User Story 1 — A player stuck on one dragon learns how to beat it (Priority: P1) 🎯 MVP

**Goal**: Four dragon pages at `/guide/<slug>`, each with:
- the deck targets, Speed and First Strike;
- cards to raise and to pass on;
- tips;
- previous/next navigation.

Plus a minimal `/guide` with the dragon index that leads to them.

**Independent Test**: quickstart scenarios 1, 2, 3 and 6. Open `/guide`, click Cindermaw, and see:
- deck 43 / 46, Speed 9, First Strike 9;
- Cold Blaze (Water) first under Raise, and Blinding Blade (Water) under Pass on.

Previous/next wrap around, and `/guide/anything-else` is a 404.

- [X] T012 [US1] Fill `standing` in `components/guide.ts` with these win percentages for a strong
  player:

  | | casual | easy | normal | hard | brutal | dire |
  |---|---|---|---|---|---|---|
  | lightning | 99 | 97 | 88 | 94 | 81 | 68 |
  | water | 99 | 98 | 95 | 92 | 79 | 73 |
  | fire | 95 | 88 | 72 | 60 | 40 | 25 |
  | shadow | 99 | 97 | 89 | 88 | 70 | 59 |

  Also set `ceilingNote` = "Even a player who knew the order of every card would win Dire against
  Cindermaw only about four times in five."
- [X] T013 [US1] Fill `dragonGuides.fire` (Cindermaw) in `components/guide.ts`.
  - **verdict**: "The hardest hunt: bring the biggest deck."
  - **description**: one sentence, ≤ 160 chars, giving deck 43 (46 to be safe), Speed 9, and Cold
    Blaze and Scorch.
  - **intro**: 2 short paragraphs on why Cindermaw is harder:
    - it hits for 24 at the middle Grade where the others hit 20;
    - it hits for 15 at the top Grade where the others hit 11–13;
    - its top Grade needs 32 attack;
    - its First Strike is 9.

    So Bracing it costs more Levels.
  - **raise**:
    - C04 "Its Levels count most in the Showdown against Cindermaw";
    - C03 "Among the most valuable Levels you can carry here";
    - C09;
    - C14.

    Write a one-line why for each.
  - **pass**: C02, C01, C13 and C07, each with a why ("A Level here is worth little against Cindermaw:
    Brace with it first").
  - **aside**: C11, "Good, not first: valuable in the Showdown itself, middling over a whole hunt."
  - **tips**:
    - your Speed must be above 9 or Cindermaw strikes first;
    - aim for every card at Level 3 or better;
    - Dire is won by a strong player only about a quarter of the time.
  - **lessonLinks**: `["empower-biggest-jump","weigh-the-dragon","brace-fewest"]`.
- [X] T014 [P] [US1] Fill `dragonGuides.lightning` (Thrallis) in `components/guide.ts`.
  - **verdict**: "The first hunt, and a fair one."
  - **description**: ≤ 160 chars, giving deck 39 (42), Speed 13, and Static Rush and Lightning Step.
  - **intro**: Thrallis is the fastest dragon (Speed 13), so expect it to strike first unless you
    Boost Speed in the Reckoning.
  - **raise**: C16, C06, C04 and C09, with a why each. Static Rush (Fire) is the single most
    valuable Level against Thrallis.
  - **pass**: C03, C02 and C07.
  - **aside**:
    - C15, "Weak in the Showdown itself but useful across the hunt: not a card to pass, not one to
      lead with";
    - C12, "Strong in the Showdown, middling over a whole hunt."
  - **tips**: ≥ 1, including "Speed 13 is the highest of the four: a Boost to Speed rarely lifts you
    past it, so plan to take the first strike."
  - **lessonLinks**: `["empower-biggest-jump","weigh-the-dragon"]`.
- [X] T015 [P] [US1] Fill `dragonGuides.water` (Glaciarch) in `components/guide.ts`.
  - **verdict**: "The most forgiving dragon at the top difficulties."
  - **description**: ≤ 160 chars, giving deck 38 (41), Speed 10, and the Swift Current pair.
  - **intro**: Glaciarch needs the smallest deck. Here the plain rule (Empower the biggest jump) is
    already right; weighing the dragon adds almost nothing. Say this plainly (spec edge case).
  - **raise**: C09, C08, C04 and C11.
  - **pass**: C02, C15 and C07.
  - **aside**: C10, "Strong in the Showdown, middling over a whole hunt."
  - **tips**:
    - Speed 10: a Boost to Speed often lifts you past it in the Reckoning;
    - follow the biggest-jump rule.
  - **lessonLinks**: `["empower-biggest-jump","speed-in-the-reckoning"]`.
- [X] T016 [P] [US1] Fill `dragonGuides.shadow` (Vesperath) in `components/guide.ts`.
  - **verdict**: "The last dragon, and the second hardest."
  - **description**: ≤ 160 chars, giving deck 40 (43), Speed 12, and the two Inferno cards and
    Shadow Stride.
  - **intro**: 1–2 paragraphs.
  - **raise**: C10, C05 and C11. Inferno (Shadow) is the most valuable Level against Vesperath.
  - **pass**:
    - C15, "A Level on Ember Dash is worth clearly less than one on an average card here";
    - C02.
  - **aside**: none.
  - **tips**:
    - Speed 12;
    - the Brace advice matters most here (weighing the dragon when Bracing helped most against
      Vesperath).
  - **lessonLinks**: `["weigh-the-dragon","brace-fewest"]`.
- [X] T017 [US1] Create `components/guide/DragonArticle.tsx`, a server component taking `{ id: DragonId }`.
  It renders, in contract order:
  1. An art header via `GuideHeader`: kicker "Strategy guide · Dragon {order} of 4", title "How to
     beat {name}", standfirst `{title}. {verdict}`, art from `media.generated.ts` `dragons["<id>-lair"]`
     or the dragon image, alt from `content.ts`.
  2. `<section id="deck">` with a `.guide-stats` strip: Deck for an even chance `deckEven`, Deck to
     win 4 in 5 `deckLikely`, Speed `speed` and First Strike `firstStrike`, all from
     `guideStats.dragons[id]`. Then "A strong player wins {standing[id].normal}% on Normal and
     {standing[id].dire}% on Dire", linking to `/guide#standing`.
  3. The intro, with `.guide-dropcap` on its first paragraph.
  4. `<section id="raise">`: h2 "Cards to raise", then a `<ul>` of `CardChip tone="raise"`.
  5. `<section id="pass">`: h2 "Cards to pass on", a one-line explainer ("Skip these when you
     Empower; give their Levels up first when you Brace."), then chips.
  6. If there are `aside` cards, an h3 "Good, not first" with chips.
  7. `<section id="tips">`: h2 "Tips", the tips as `.guide-tip` blocks, then a "Lessons for every
     dragon" list linking each `lessonLinks` id to `/guide#lesson-<id>`, using the lesson title
     (or the id until US2 fills lessons).
- [X] T018 [P] [US1] Create `components/guide/DragonNav.tsx`, taking `{ id: DragonId }`.
  - A `<nav aria-label="Dragon guides">` with "← {prev name}", "All dragons" (→ `/guide`) and
    "{next name} →", from `neighbours(id)` and `guideDragons` slugs.
  - Also export a `Breadcrumb` component: `<nav aria-label="Breadcrumb">` with an `<ol>` of "Guide" →
    `/guide`, then the dragon's name with `aria-current="page"`.
- [X] T019 [US1] Create `app/guide/[dragon]/page.tsx`:
  - `export const dynamicParams = false`.
  - `generateStaticParams()` returns `guideDragons.map(d => ({ dragon: d.slug }))`.
  - `generateMetadata({ params })` awaits `params` (a Promise in Next 16) and returns:
    - title "How to beat {name}";
    - description `dragonGuides[id].description`;
    - `alternates.canonical` `/guide/{slug}`.
  - The default export awaits `params`, resolves the id with `dragonBySlug` (calling `notFound()` if
    missing), and renders `<Header/>`, then `<main>` with `Breadcrumb`, `DragonArticle`, `DragonNav`
    and `EditionNote`, then `<Footer/>`.
- [X] T020 [P] [US1] Create `components/guide/DragonIndex.tsx`.
  - `<section id="dragons">` with h2 "Choose your dragon".
  - A grid (1 column below 640 px, 2 above, 4 at ≥ 1024 px) of four linked cards, in unlock order.
    Each shows:
    - the dragon head image (`media.generated.ts` `dragons["<id>-head"]`), with alt from
      `content.ts`;
    - the name, title and Essence;
    - the `verdict`;
    - "Deck {deckEven} · Speed {speed}".

    Each card links to `/guide/{slug}`. The whole card is the link, with a visible focus.
- [X] T021 [US1] Create `app/guide/page.tsx` (static).
  - **metadata**: title "How to hunt each dragon", a description ≤ 160 chars, and
    `alternates.canonical: "/guide"`.
  - **Renders**: `<Header/>`, then `<main>` with `GuideHeader` (kicker "Strategy guide", title "How
    to hunt each dragon", and a standfirst saying this is what long play of every dragon at every
    difficulty teaches about building a deck to win), then `DragonIndex` and `EditionNote`, then
    `<Footer/>`.
  - Leave clearly marked slots (comments) for the `#standing`, `#lessons`, `#empower` and
    `#at-a-glance` sections that later stories add.
- [X] T022 [US1] Run `npm run lint && npm run build` and verify `app/guide/page.tsx` and
  `app/guide/[dragon]/page.tsx`. Confirm that `/guide` is ○ and
  `/guide/[dragon]` is ● with exactly 4 paths. Then run quickstart scenarios 1, 2, 3, 6, 7 and 8 on
  the dragon pages. Commit:
  - "Strategy guide: a page for each dragon, with the cards to raise and to pass on".

**Checkpoint**: The MVP. All four dragon pages are complete and reachable from `/guide`.

---

## Phase 4: User Story 2 — A new player learns the general lessons that win games (Priority: P1)

**Goal**: `/guide` gains "where the game stands", the win-chance table and the eight lessons.

**Independent Test**: on `/guide`, `#standing` and `#lessons` read on their own. Each lesson:
- leads with an instruction;
- gives the reason;
- shows a Tested or Observed tag;
- states its effect in words.

The "don'ts" read as don'ts. Quickstart scenario 4 returns nothing.

- [X] T023 [US2] Fill `lessons` in `components/guide.ts` with these eight, in this order (`id`,
  title, then body, evidence and effect):
  1. `regions-are-deck-building`, "The Regions are deck building". A strong player reached the
     Showdown in every game: nothing is lost before it, so every choice on the road is about the
     deck you bring. Evidence: observed.
  2. `empower-biggest-jump`, "Empower the card that gains the most strength". Before spending XP,
     compare each Hand card's best Spell figure plus Boost now and at its next Level, and buy the
     biggest jump, even at 3 to 5 XP rather than 1. Strong play spent about 4 XP per Level, mostly
     on cards already at Level 2 or 3. Raising your strongest card instead is a trap: it lost about
     10 games in 100. Evidence: tested. Effect: "About 12 more wins in 100 games."
  3. `weigh-the-dragon`, "Weigh the dragon you face". When Empowering, count what a Level adds now
     and twice what it adds to the Showdown against this dragon. When Bracing, give up the Levels
     this dragon needs least. It was better on every dragon, and makes almost no difference against
     Glaciarch. Link each dragon's raise and pass lists. Evidence: tested. Effect: "About 4 more
     wins in 100."
  4. `brace-fewest`, "Brace with the fewest cards". Every card used to Brace loses a Level, so use
     as few as you can, and don't Trash a Level 1 card when Weakening another would do. Evidence:
     tested.
  5. `detour-when-weak`, "Detour when your best Play is weak". If your best Play loses or barely
     wins, and its damage would cost a Level for little XP, Detour your weakest Hand card instead,
     at most twice a Trial. Strong play used about three Detours a game. Evidence: tested. Effect:
     "About 3 more wins in 100."
  6. `meld-on-merit`, "Don't Meld just for the enhancement". Judge a Melded Play like any other, by
     what it wins and costs, and remember the tucked card is spent. Evidence: tested-dont. Effect:
     "Favouring Melds cost about 11 wins in 100."
  7. `speed-in-the-reckoning`, "Don't chase Speed when Empowering; use it in the Reckoning". In the
     Reckoning the dragon strikes first unless your Speed is above its own (Cindermaw 9, Glaciarch
     10, Vesperath 12, Thrallis 13); aim a Boost at Speed when that lifts you past it. Speed comes
     with a strong deck, and chasing it when Empowering cost about 4 wins in 100. Evidence:
     tested-dont. Effect: "Strong decks were struck first in about a quarter of fights, weaker
     ones in over a third." Read the dragon Speeds from `guideStats`, not hard-coded.
  8. `rally-on-the-approach`, "Rally on the Approach when the draw is wrong". Every Approach card is
     discarded whatever you play, so cards drawn there are lost to the Reckoning. If the seven hold
     your hardest hitters or lack your movers, Rally once, giving up your weakest card. Evidence:
     observed.

  If a body needs a live number, store it as a function of `guideStats`, or write the copy in the
  component.
- [X] T024 [P] [US2] Create `components/guide/Lessons.tsx`, a `<section id="lessons">`.
  - h2 "Lessons for every dragon", then an `<ol>`.
  - Each lesson is an `<li id="lesson-{id}">` containing:
    - an h3 with the title;
    - the body;
    - an evidence tag: "Tested" (jade), "Observed" (brass) or "Tested: don't" (danger), each with
      visible text, not colour alone;
    - the effect as a `.guide-tip` when present.
  - Above the list, one sentence explains the tags: tested = played head-to-head on the same deals,
    with and without; observed = how strong players play, a strong hint.
- [X] T025 [P] [US2] Create `components/guide/StandingTable.tsx`, a `<section id="standing">`.
  - h2 "Where the game stands", then 2 short paragraphs. They say:
    - every difficulty can be won;
    - Cindermaw is by far the hardest, then Vesperath;
    - Thrallis and Glaciarch are closest to each other;
    - the Regions are deck building;
    - roughly every card at Level 3 is the general target.
  - Then a `.guide-table` with caption "How often a strong player wins, by difficulty". It has rows
    per dragon (name linking to `/guide/{slug}`) and columns per difficulty, each cell with a
    `data-label`.
  - Each cell shows the % plus an inline bar: a `<span>` width % on a well-coloured track, in the
    dragon's Essence colour, `aria-hidden`.
  - Below: a one-line note that single cells can move by a few points between runs, then
    `ceilingNote`.
  - Before drawing the bars, invoke the `dataviz` skill and follow its mark and colour guidance.
- [X] T026 [US2] Mount `StandingTable` (after `GuideHeader`, before `DragonIndex`) and `Lessons`
  (after `DragonIndex`) in `app/guide/page.tsx`. In `DragonArticle.tsx`, make the lessonLinks list
  show lesson titles.
- [X] T027 [US2] Run lint and build, then quickstart scenarios 4, 7, 8 and 9 on `/guide`
  (`app/guide/page.tsx`). Commit:
  - "Strategy guide: where the game stands, and the lessons for every dragon".

**Checkpoint**: `/guide` teaches the general game, and dragon pages link into its lessons.

---

## Phase 5: User Story 3 — A player plans Empowerments using the best-value steps (Priority: P2)

**Goal**: The Empower value reference and the at-a-glance comparison on `/guide`.

**Independent Test**: the `#empower` best and poorest steps match the card data, and the table is
readable at 360 px with no sideways scroll.

- [X] T028 [US3] Fill `empowerNotes` in `components/guide.ts`. The step index is 1 for 1→2, 2 for
  2→3 and 3 for 3→4.
  - **best**: `[["C16",1],["C06",1],["C12",1],["C01",2],["C08",3]]`.
  - **poorest**: `[["C03",2],["C15",2],["C15",3],["C06",3]]`.
  - Add an assertion that each best step's gain/cost ratio, computed from `guideStats`, is ≥ every
    poorest step's.
- [X] T029 [P] [US3] Create `components/guide/EmpowerTable.tsx`, a `<section id="empower">`.
  - h2 "Where your XP goes furthest", plus one paragraph: strength is a card's best Spell figure
    plus its Boost, and the best Empowerment is the biggest gain for its XP.
  - A `.guide-table` with caption "Strength at each Level, and what each step costs". It has one row
    per card (`cardLabel`, grouped by Essence in the order Water, Lightning, Shadow, Fire) and cells
    "5 → 10 → 13 → 17", with "+5 / 1 XP" under each arrow.
  - Mark best steps (bold + "Best value" visually hidden text) and poorest steps (faint + "Poor
    value" hidden text).
  - Below: two short lists naming the five best and four poorest steps in words.
- [X] T030 [P] [US3] Create `components/guide/AtAGlance.tsx`, a `<section id="at-a-glance">`.
  - h2 "The four dragons at a glance".
  - A `.guide-table` with rows per dragon (linking to `/guide/{slug}`) and columns: Dire win %,
    Deck (even / 4 in 5), Speed, Raise first (first two `raise` labels), Pass on (first two `pass`
    labels).
  - All values come from `guide.ts` and `guideStats`.
- [X] T031 [US3] Mount `EmpowerTable` and `AtAGlance` after `Lessons` in `app/guide/page.tsx`. Then
  run lint and build, and quickstart scenario 7 at 360 px. Commit:
  - "Strategy guide: the Empower value reference and the dragons at a glance".

**Checkpoint**: All content is in place.

---

## Phase 6: User Story 4 — A visitor finds the guide from the rest of the site and from search (Priority: P2)

**Goal**: Site links, the sitemap, share images and structured data for all five pages.

**Independent Test**: quickstart scenarios 11, 12, 13 and 14.

- [X] T032 [P] [US4] In `components/Header.tsx`, add `<Link href="/guide" className="link-quiet">Guide</Link>`
  before Support, always visible (no `hidden sm:inline`). Check that the header still fits at
  360 px.
- [X] T033 [P] [US4] In `components/Footer.tsx`, add `<Link href="/guide" className="footer-link">Strategy guide</Link>`
  before Support, with the same separator markup as its neighbours.
- [X] T034 [P] [US4] In `components/sections/Road.tsx`, in the `#dragons` item, add after the "Every
  hunt starts with Thrallis…" paragraph: "Stuck on one? Read the <Link href="/guide">guide to each
  dragon</Link>." It is styled as the paragraph's existing links.
- [X] T035 [P] [US4] In `app/sitemap.ts`, add `"/guide"` and the four `/guide/{slug}` paths from
  `guideDragons`.
- [X] T036 [P] [US4] Create `app/guide/[dragon]/opengraph-image.tsx`.
  - Export `alt`, `size` (1200×630) and `contentType`, plus `generateStaticParams`, reusing the
    page's.
  - The default export takes `{ params }: { params: Promise<{ dragon: string }> }`.
  - Read `assets/og/<id>-lair.png`, `assets/og/<id>-dragon.png` and
    `assets/fonts/Spectral-Bold.ttf`.
  - Draw in the composition of `app/opengraph-image.tsx`, with the radial gradient in that dragon's
    Essence colour from `palette`, and the text "How to beat {name}" and "{title} · {site.name}
    strategy guide".

  Then create `app/guide/[dragon]/twitter-image.tsx`, re-exporting as `app/twitter-image.tsx` does.
- [X] T037 [P] [US4] Create `app/guide/opengraph-image.tsx`, with the four dragon images from
  `assets/og/<id>-dragon.png` in a row on the ground and the title "How to hunt each dragon". Then
  create `app/guide/twitter-image.tsx` as a re-export.
- [X] T038 [US4] Add a small `components/guide/ArticleJsonLd.tsx`, rendering
  `<script type="application/ld+json">` as `components/JsonLd.tsx` does.
  - An `Article` with `headline`, `description`, `author` `{ "@type": "Person", name: site.developer,
    url: site.developerUrl }`, `publisher` (`site.name`), `dateModified: edition.updated` and `url`.
  - On dragon pages, also a `BreadcrumbList` (Guide → `{site.url}/guide`, Name →
    `{site.url}/guide/{slug}`).

  Mount it in both `app/guide/page.tsx` and `app/guide/[dragon]/page.tsx`.
- [X] T039 [US4] Run lint and build, then quickstart scenarios 11–14 against `app/sitemap.ts` and
  the `app/guide/**/opengraph-image.tsx` output. Commit:
  - "Strategy guide: linked from every page, in the sitemap, with its own share images".

**Checkpoint**: The guide is discoverable and shareable.

---

## Phase 7: User Story 5 — The guide can be refreshed when the next playtest round lands (Priority: P3)

**Goal**: Show that one change in the data reaches every page, and document the refresh.

**Independent Test**: quickstart scenarios 15 and 16.

- [X] T040 [US5] Search `components/guide/` and `app/guide/` for hard-coded figures. Every number
  from the report or the game must come from `guide.ts` or `guideStats`, not a literal; fix any
  found. Run:

  ```sh
  grep -nE '\b(9|10|12|13|38|39|40|41|42|43|46)\b' components/guide app/guide -r
  ```

  Review each hit.
- [X] T041 [US5] Run quickstart scenario 15: change Fire `deckEven` by hand in
  `components/media.generated.ts`, rebuild, check
  `/guide/cindermaw`, the `/guide` index card and the at-a-glance row, then revert. Run scenario 16:
  put C04 in Fire's `pass`, confirm the build fails with a clear message, then revert.
- [X] T042 [P] [US5] Add a header comment to `components/guide.ts` giving the refresh steps from
  quickstart.md "Refreshing after a new playtest round or card set". Include the R3 rule for picks:
  - Raise: high in one ranking, not low in the other.
  - Pass: low in both.
  - Disputed: aside.

**Checkpoint**: The guide is maintainable.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T043 Run the full matrix in `specs/002-strategy-guide/quickstart.md` (scenarios 1–17) on
  `npm run start`. That covers:
  - 360 px, JS off, keyboard, VoiceOver;
  - the banned-word grep over all five pages;
  - Lighthouse mobile on `/guide` and `/guide/cindermaw` (performance ≥ 90, a11y and SEO 100).

  Fix whatever fails.
- [X] T044 Read every figure in `components/guide.ts` and on the five pages against research.md R3,
  R4 and R5 and the source
  report (SC-002). Check that each card is named with its Essence, and that no card appears under
  both Raise and Pass on for one dragon anywhere, including at-a-glance.
- [X] T045 Copy-edit pass on all guide strings in `components/guide.ts` and the components:
  - plain words, short sentences, the game's terms only, no other games named;
  - each description ≤ 160 chars;
  - British spelling, matching the site ("favour", "armour").
- [X] T046 Run final `npm run lint && npm run build`, and confirm `app/privacy/page.tsx` and
  `app/support/page.tsx` still resolve at `/privacy` and `/support`. Commit any polish:
  - "Strategy guide: polish".

---

## Dependencies & Execution Order

- **Phase 1 (T001–T005)** → **Phase 2 (T006–T011)** → the user stories.
- **US1 (Phase 3)** has no dependency on other stories. It is the MVP.
- **US2 (Phase 4)** needs T021 (the `/guide` page) from US1. T026 also touches `DragonArticle.tsx`
  from T017.
- **US3 (Phase 5)** needs T021. It is independent of US2 apart from the mount order in
  `app/guide/page.tsx`.
- **US4 (Phase 6)** needs T019 and T021. T032–T035 can be done any time after Phase 2.
- **US5 (Phase 7)** needs US1–US3 in place, so there is something to verify.
- **Polish (Phase 8)** comes after everything else.

Within US1, T012–T016 (data) come before T017 (the article reads the data). T017, T018 and T020 come
before T019 and T021.

## Parallel Opportunities

- Phase 2: T008, T009, T010 and T011 are separate files.
- US1: T014, T015 and T016 are separate dragon entries. Write them in one sitting, or as separate
  edits to `guide.ts` that do not conflict. T018 and T020 are separate components.
- US2: T024 and T025.
- US3: T029 and T030.
- US4: T032–T037 are all separate files.

```text
# US4 in parallel:
T032 Header.tsx   T033 Footer.tsx   T034 Road.tsx   T035 sitemap.ts
T036 [dragon]/opengraph-image.tsx   T037 guide/opengraph-image.tsx
```

## Implementation Strategy

1. **MVP**: Phases 1–3. These ship four complete dragon pages behind a simple `/guide` index, and
   answer the core ask: tips per dragon, best cards, what to pass.
2. **Add US2**: the lessons and where the game stands. `/guide` becomes the article.
3. **Add US3**: the reference tables.
4. **Add US4**: links in from the site, share images and structured data. It can come before US3 if
   the guide is published early.
5. **Add US5**, then Polish.

Commit at each story checkpoint, to `main`, with no AI attribution.
