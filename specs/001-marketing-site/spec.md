# Feature Specification: Riftwyrm Marketing Site

**Feature Branch**: `main` (no feature branch, per constitution Principle II)

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "utilize the screenshot tools in the actual dragon hunter repo, locate in the same directory as this project, and make this site beautiful and engaging - showing off art asssest in it and make a small marketing website which utilizes the color pallette of the actual game - favicons, seo, screenshots, placeholders for the play and app store links, ect..."

## Context

Today the site is a single centered card: the app icon, the game name, the tagline, a "Coming soon"
note and links to the privacy policy and support pages. The game itself (the sibling `dragon-hunter`
project) already has:

- a design palette ("Inkstone and Brass": slate near-black ground, stone panels, parchment text,
  one antique-brass accent, plus jade, danger red and region colours), already partly mirrored in the
  site's stylesheet;
- tools that produce real, seeded gameplay screenshots at exact store sizes (title, a Trial, the
  choice of dragons, the dragon Showdown, a won game), both bare and as captioned panels, plus the
  1024 px app icon and every platform icon variant;
- original painted art: four dragons (Lightning, Water, Fire, Shadow) with head portraits, enemy
  backdrops, journey landscapes, lairs and roads, plus creature silhouettes.

This feature turns the site into a small, polished marketing site that sells the game using those
real assets, while keeping the privacy and support pages the store listings depend on.

## Clarifications

### Session 2026-11-02

- Q: Which version of the portfolio project's store badges should the site use? → A: Port the
  portfolio's code-built store button (`../danger-portfolio/components/StoreButton.tsx` with the
  Apple and Google Play marks from `components/icons.ts`): the badges' own dark livery, dimmed with
  a "Coming soon" reveal until a link is set, a live link once it is. Not the official badge
  images.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A visitor understands the game and wants it (Priority: P1)

A player arrives from a store listing, a shared link or a search result. Within the first screen
they see the game's name, its painted art and a one-line pitch, and by scrolling they see what
play actually looks like (real screenshots), what the game offers (four dragons, regions, solo
card play, difficulty levels, lessons, achievements) and where to get it.

**Why this priority**: This is the site's whole purpose; without it the rest is decoration.

**Independent Test**: Open the home page on a phone and on a desktop; without prior knowledge, a
tester can say what kind of game it is, see at least three real gameplay screenshots and find the
store buttons.

**Acceptance Scenarios**:

1. **Given** a first-time visitor on a desktop, **When** the home page loads, **Then** the first
   screen shows the game name, a painted hero image from the game, the tagline and the store buttons.
2. **Given** the visitor scrolls, **When** they reach the screenshots section, **Then** they see the
   game's real landscape screenshots (title, a Trial, the choice of dragons, the Showdown, a win),
   each with a short caption.
3. **Given** the visitor taps a screenshot, **When** it opens, **Then** they see it enlarged and
   can move to the next/previous screenshot and close it with a tap, the Escape key or a back gesture.
4. **Given** a visitor on a narrow phone screen, **When** they view any section, **Then** nothing
   overflows horizontally and all text is legible without zooming.

---

### User Story 2 - A visitor gets the game from a store (Priority: P1)

The visitor decides to install the game and looks for Google Play or the App Store.

**Why this priority**: Conversion is the measurable goal of a marketing site.

**Independent Test**: Locate both store buttons in the hero and again near the bottom of the page;
verify each is either a working link or a clearly marked "coming soon" placeholder.

**Acceptance Scenarios**:

1. **Given** the store links are not yet known, **When** the visitor sees the store buttons,
   **Then** each button names its store, is shown dimmed, says "Coming soon" on hover (mouse) or
   briefly on tap (touch), announces "coming soon" to screen readers, and is not a dead or
   misleading link.
2. **Given** the developer later sets a store URL in the one shared-facts place, **When** the site
   is rebuilt, **Then** that store's button becomes a live link everywhere it appears, with no other
   edits.
3. **Given** a visitor using a keyboard or screen reader, **When** they reach a store button,
   **Then** it is focusable (if live) and announced with its store name and status.

---

### User Story 3 - The art is the showcase (Priority: P2)

The visitor is drawn in by the game's painted art: the four dragons, the regions and enemies they
will face.

**Why this priority**: The art is the game's strongest hook and was explicitly requested, but the
site still works (story 1) with screenshots alone.

**Independent Test**: View the home page and confirm a dragons section shows all four dragons with
their painted art and names, and a world/bestiary section shows painted landscapes and enemies.

**Acceptance Scenarios**:

1. **Given** the dragons section, **When** it is shown, **Then** all four dragons appear with their
   painted art, name and a one-line description, in unlock order (Lightning, Water, Fire, Shadow).
2. **Given** the world section, **When** it is shown, **Then** it presents a selection of painted
   journey landscapes and enemies drawn from the game's own art.
3. **Given** a visitor who has asked their system to reduce motion, **When** any section animates,
   **Then** the animation is removed or replaced by a static state.

---

### User Story 4 - The site looks right wherever it is shared or bookmarked (Priority: P2)

Someone shares the link in a chat or social post, bookmarks it, adds it to a home screen, or finds
it through a search engine.

**Why this priority**: Shared-link previews and search results are how most visitors will first
see the site.

**Independent Test**: Paste the home URL into a link-preview validator and inspect the browser tab,
bookmark and home-screen icon on desktop, Android and iOS.

**Acceptance Scenarios**:

1. **Given** the home URL is shared, **When** a link preview is generated, **Then** it shows the
   game's title, a description and a dedicated preview image built from the game's art.
2. **Given** any page, **When** a search engine reads it, **Then** it finds a unique title, a
   description, a canonical address and structured data describing the game as a mobile game.
3. **Given** a browser tab, bookmark or home-screen shortcut, **When** the icon is shown, **Then**
   it is the game's app icon at an appropriate size for that context.
4. **Given** the privacy and support pages, **When** they are shared or indexed, **Then** they carry
   their own titles and descriptions and remain at `/privacy` and `/support`.

---

### User Story 5 - Assets stay in step with the game (Priority: P3)

When the game's screenshots or art change, the developer refreshes the site's copies without
hand-editing images.

**Why this priority**: Keeps the site honest over time, but the first launch can use a one-time
copy.

**Independent Test**: Follow the documented refresh steps after regenerating the game's store
screenshots; the site shows the new images after a rebuild.

**Acceptance Scenarios**:

1. **Given** newly generated store screenshots and art in the game project, **When** the developer
   runs the documented refresh step, **Then** the site's screenshot, art and icon files are
   replaced and web-optimised, and nothing else changes.
2. **Given** the game project is not present beside the site, **When** the site is built, **Then**
   the build still succeeds from the copies committed to the site.

---

### Edge Cases

- A store link is set for one store but not the other: the live one links out, the other stays a
  "Coming soon" placeholder.
- An image fails to load or loads slowly: layout does not jump, and a palette-coloured placeholder
  plus alt text stand in.
- Very wide desktop and very narrow phone (320 px) widths: content stays centred and readable;
  landscape screenshots never become unreadably small on phones (they may scroll horizontally in a
  carousel instead).
- JavaScript disabled: all content, images and links remain visible; only enhancements such as the
  enlarged screenshot viewer degrade (images open on their own instead).
- Visitor prefers reduced motion: no parallax, auto-advancing or looping animation.
- An unknown address: the existing not-found page is shown in the new style with a way home.

## Requirements *(mandatory)*

### Functional Requirements

**Content and layout**

- **FR-001**: The home page MUST contain, in order: a hero (name, tagline, painted art, store
  buttons), a short pitch of what the game is, a features section, a screenshots gallery, a dragons
  showcase, a world/enemies art section, a closing call to action with the store buttons again, and
  the footer.
- **FR-002**: The features section MUST present 4–6 concise selling points drawn from what the game
  actually contains (e.g. solo palm-sized card battles, four dragons to unlock, four regions and a
  final battle, six difficulty levels, interactive lessons, achievements, plays offline with no
  account and no ads if that is true), each with a game icon or art.
- **FR-003**: Site copy MUST describe the game in its own terms and MUST NOT name other games,
  publishers or their in-game terms (constitution Principle IV).
- **FR-004**: The site MUST keep `/privacy` and `/support` at their current addresses with their
  current content, restyled to match the new design, and link to them from the header or footer of
  every page.

**Visual design**

- **FR-005**: Every colour on the site MUST come from the game's own palette (ground, stone, raised
  stone, line, edge, parchment and its muted tones, brass and its bright/deep tones, jade, danger
  red, and the region/dragon accent colours), defined once and reused. The one exception is the
  store buttons, which keep the store badges' own livery and marks (FR-012).
- **FR-006**: Typography MUST use the site's existing display serif and body sans pairing (or the
  game's own fonts if licensing allows web use), with text contrast meeting WCAG 2.1 AA.
- **FR-007**: Animations (reveals on scroll, subtle hero motion, hover states) MUST be restrained,
  MUST NOT block reading, and MUST be disabled under the reduced-motion preference.

**Assets**

- **FR-008**: Gameplay screenshots MUST be real images produced by the game project's screenshot
  tooling (the seeded store screenshots), not mock-ups.
- **FR-009**: Art shown on the site (dragons, dragon heads, landscapes, enemies, icons) MUST come
  from the game project's own painted and generated art.
- **FR-010**: All images MUST be served in web-optimised formats at sizes suited to the visitor's
  screen, with explicit dimensions so the page does not shift while loading, and descriptive alt
  text.
- **FR-011**: The site MUST include a documented, repeatable way to refresh its screenshots, art and
  icons from the game project.

**Store links**

- **FR-012**: The site MUST show a Google Play and an App Store button in the hero and in the closing
  call to action, matching the developer's portfolio site's store buttons: drawn in code (not
  images) with each store's mark, a small top line ("Get it on" / "Download on the") and the store
  name, on the badges' own near-black livery. A button with no link is the same button dimmed,
  occupies the same space as a live one, swaps its top line for "Coming soon" on hover or a brief
  tap, and carries a screen-reader "coming soon"; a button with a link is a live link opening the
  store.
- **FR-013**: Each store URL MUST be a single setting in the shared-facts file; when empty, the
  button renders as a non-link "Coming soon" placeholder; when set, it becomes a live link that opens
  the store.

**Icons, SEO and sharing**

- **FR-014**: The site MUST provide the game's app icon as the browser favicon (scalable and
  legacy formats), the Apple touch icon, and the icons and name needed for "add to home screen" on
  Android.
- **FR-015**: Every page MUST have a unique title and meta description, a canonical URL, and Open
  Graph and Twitter card metadata including a 1200×630 share image made from the game's art and
  logo.
- **FR-016**: The home page MUST include structured data describing the game (name, description,
  genre, platforms, developer, image, and store links once known).
- **FR-017**: The site MUST keep a sitemap listing every page and a robots file permitting indexing,
  and MUST set a theme colour from the palette for mobile browser chrome.

**Quality**

- **FR-018**: All pages MUST remain statically rendered (constitution Principle III) and pass the
  lint and build gate (Principle V).
- **FR-019**: All interactive elements MUST be reachable and operable by keyboard with a visible
  brass focus ring, and landmarks/headings MUST form a logical outline.

### Key Entities

- **Screenshot**: one real gameplay image; scene (title, Trial, dragons, Showdown, win), caption,
  alt text, source size, display order.
- **Art piece**: a painted image from the game; category (dragon, dragon head, landscape, enemy,
  icon), name, alt text.
- **Dragon**: name, unlock order, painted art, head portrait, one-line description, accent colour.
- **Store listing**: store name (Google Play / App Store), top line ("Get it on" / "Download on
  the"), URL (empty until known); live when the URL is set, coming soon otherwise.
- **Shared facts**: game name, tagline, description, site URL, developer, contact email, store
  URLs — the single source every page reads.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a 5-second test, at least 4 of 5 people shown the first screen can say it is a
  dragon-themed card game for phones.
- **SC-002**: The home page shows its first meaningful content in under 2.5 seconds on a mid-range
  phone over a typical 4G connection, with no visible layout shift as images load.
- **SC-003**: Automated audits score at least 90 for performance, and 100 for accessibility, best
  practices and SEO, on mobile, for the home, privacy and support pages.
- **SC-004**: Store buttons are visible on the first screen and again at the end of the page on
  every screen width from 320 px to 2560 px.
- **SC-005**: A shared link to the home page produces a preview with title, description and image
  in the major link-preview validators.
- **SC-006**: Changing a store link from empty to a real URL requires editing exactly one value.
- **SC-007**: 100% of colours used on the site, other than the store buttons' livery, can be
  traced to the game's palette.
- **SC-008**: Refreshing every site image from the game project takes one documented step and under
  5 minutes, excluding the game's own screenshot run.

## Assumptions

- The sibling game project at `../dragon-hunter` is the source of truth for screenshots, art,
  icons and palette; its existing store-screenshot output (bare landscape shots at store sizes) is
  suitable, regenerated if out of date. Copies are committed to the site so it builds without the
  game project present.
- The painted art and generated art in the game project are original to this project and may be
  shown publicly; reference material that is not the project's own is not used.
- Store links are unknown for now. The store buttons are the portfolio site's code-built buttons,
  not the official badge images, in both states.
- The site stays a single-page marketing home plus the existing privacy, support and not-found
  pages; no blog, press kit, newsletter sign-up, analytics or cookie banner (none collect data, so
  the privacy policy stays accurate).
- The public address remains `https://riftwyrm.dangervalentine.com`.
- No trailer video is available; if one is added later it is a separate feature.
- Feature claims (e.g. offline play, no ads, no account) are verified against the game before
  publishing; any that are not true are dropped.
