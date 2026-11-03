# Data Model: Strategy Guide

There are two modules. Every figure on all five guide pages reads from one of them (FR-019).

## Generated: `guideStats` in `components/media.generated.ts`

`scripts/sync-assets.mjs` writes this from the game repo. Do not edit it by hand.

```ts
guideStats: {
  dragons: Record<DragonId, {          // "lightning" | "water" | "fire" | "shadow"
    speed: number;                      // cards.json dragons[].initiative
    firstStrike: number;                // dragons[].first_strike.value
    deckEven: number;                   // deck_guide.json content.classic.dragon_<id>.even
    deckLikely: number;                 // ….likely
  }>;
  cards: Record<CardId, {              // "C01" … "C16"
    name: string;                       // text.json card.<key>.official
    essence: "water" | "lightning" | "shadow" | "fire";
    image: string;                      // /media/cards/adept-<slug>-<essence>.webp
    strength: [number, number, number, number];   // Levels 1–4: max(basic, enhanced) + boost
    stepCost: [number, number, number];           // XP for 1→2, 2→3, 3→4
  }>;
}
```

**Validation**: The script fails if any of these is missing: a dragon in `deck_guide.json`, a
card name in `text.json`, a card face PNG, or a card that does not have exactly 4 Levels.

## Hand-written: `components/guide.ts`

```ts
type CardId = keyof typeof guideStats.cards;
type Evidence = "tested" | "observed" | "tested-dont";

export type DragonSlug = "thrallis" | "glaciarch" | "cindermaw" | "vesperath";

/** The only place a slug is made: the dragon's name from content.ts, in lower case. */
export const guideDragons: { id: DragonId; slug: DragonSlug }[];   // unlock order
export function dragonBySlug(slug: string): DragonId | undefined;
export function neighbours(id: DragonId): { prev: DragonId; next: DragonId };  // wraps around

export const edition: { cardSet: string; round: string; updated: string /* ISO date */ };

export const standing: Record<DragonId, Record<Difficulty, number>>;  // win %, strong player (R4)
export const ceilingNote: string;                                      // the one all-knowing mention

export const dragonGuides: Record<DragonId, {
  verdict: string;                     // one-line difficulty verdict (index card + page header)
  description: string;                 // ≤ 160 chars, the dragon page's meta description
  intro: string;                       // 1–2 short paragraphs
  raise: { card: CardId; why: string }[];   // ≥ 3, lead card first
  pass:  { card: CardId; why: string }[];   // ≥ 2
  aside?: { card: CardId; note: string }[]; // "good, not first" (disputed cards)
  tips: string[];                      // ≥ 1, dragon-specific
  lessonLinks?: string[];              // lesson ids worth reading for this dragon (→ /guide#lesson-<id>)
}>;

export const lessons: {
  id: string;                          // anchor slug
  title: string;                       // plain instruction ("Empower the biggest jump")
  body: string;                        // why
  evidence: Evidence;
  effect?: string;                     // "About 12 more wins in 100 games"
}[];

export const empowerNotes: { best: [CardId, 1 | 2 | 3][]; poorest: [CardId, 1 | 2 | 3][] };
```

Dragon names, titles and order come from `content.ts`'s `dragons`. They are not repeated here.

## Validation rules

These are module-load assertions in `guide.ts`. They throw during `next build`, which fails the
gate.

1. Every `CardId` used in `raise`, `pass`, `aside` and `empowerNotes` exists in
   `guideStats.cards`. This is enforced by type, and also checked at runtime against the regenerated
   data.
2. For each dragon, `raise ∩ pass = ∅`, and an `aside` card is in neither list (FR-004).
3. Each dragon has `raise.length ≥ 3`, `pass.length ≥ 2` and `tips.length ≥ 1` (FR-003, SC-004).
4. `standing` has all 4 dragons × 6 difficulties, each a value from 0 to 100.
5. No string in the module matches the banned vocabulary in
   [contracts/guide-pages.md](contracts/guide-pages.md#vocabulary).
6. `guideDragons` has exactly the four dragons of `content.ts`, and each slug is that dragon's name
   in lower case. Every `lessonLinks` id exists in `lessons`.
7. Each `description` is at most 160 characters.

## Relationships

```text
content.dragons (name, title, art) ─┐
guideStats.dragons (numbers) ───────┼─► DragonArticle (one page per DragonId)
guide.dragonGuides (picks, copy) ───┘   /guide/[dragon]   └─ CardChip ◄─ guideStats.cards[CardId]
guide.guideDragons + neighbours() ──────► generateStaticParams, DragonNav, DragonIndex, sitemap
guide.lessons ──────────────────────────► Lessons (/guide)
guideStats.cards + guide.empowerNotes ──► EmpowerTable
guide.standing ─────────────────────────► StandingTable
all of the above ───────────────────────► AtAGlance
```
