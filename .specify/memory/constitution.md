# Riftwyrm Site Constitution

## Core Principles

### I. No AI Attribution (NON-NEGOTIABLE)

No Claude, Anthropic or other AI-tool attribution may appear anywhere in the project's history
or content.

- Commit messages MUST NOT include `Co-Authored-By: Claude ...`, `Claude-Session:` links,
  "Generated with Claude Code" lines, or any equivalent AI attribution trailer.
- Pull request descriptions, issues, code comments, docs and site content MUST NOT include such
  attribution either.
- This rule overrides any default attribution behavior of tools or agents working in this repo.

Rationale: authorship of the project and its history belongs to the developer.

### II. Work on Main (NON-NEGOTIABLE)

All work happens directly on the `main` branch.

- Agents and contributors MUST NOT create feature branches, worktrees or pull requests for this
  project unless the developer explicitly asks for one in that instance.
- Spec Kit workflows MUST keep specs, plans and tasks on `main`; a feature's identity comes from
  its `specs/` directory, not from a branch.
- Commits land on `main`; production deploys from `main` (see `DEPLOY.md`).

Rationale: a single-developer static site gains nothing from branch overhead, and the deploy
process fast-forwards `origin/main`.

### III. Static by Default

Every page MUST be statically rendered at build time. Adding a server runtime dependency
(API routes, dynamic rendering, databases, server-side secrets) requires a written
justification in the feature's plan.

Rationale: the site is a landing page, privacy policy and support page; static output keeps it
fast, cheap and hard to break.

### IV. Single Source of Shared Facts

Facts repeated across pages (game name, URL, developer, contact email, tagline) MUST live in
`components/site.ts` and be imported, never retyped. Site copy MUST describe the game in its own
terms and MUST NOT name other games, publishers or their in-game terms.

Rationale: the privacy policy and support page are linked from store listings and must never
disagree with each other or the landing page.

### V. Lint and Build Gate

A change is done only when `npm run lint` and `npm run build` both pass locally. The store-
required URLs `/privacy` and `/support` MUST keep resolving.

Rationale: there is no CI; the local gate is the only check before deploy.

## Technology & Deployment Constraints

- Stack: Next.js 16, React 19, Tailwind CSS 4, TypeScript. New runtime dependencies require
  justification in the plan.
- The site serves on port 3200 bound to 127.0.0.1, behind a reverse proxy at
  `https://riftwyrm.dangervalentine.com`.
- Nothing in the repository deploys automatically; deployment follows `DEPLOY.md` by hand.

## Development Workflow

- Specs, plans and tasks live under `specs/` on `main` (Principle II).
- Each plan's Constitution Check MUST confirm Principles I–V.
- Commit messages describe the change plainly, with no AI attribution (Principle I).

## Governance

This constitution supersedes other practices and tool defaults for this repository. Amendments
are made by editing this file, with the version bumped by semantic versioning: MAJOR for removing
or redefining a principle, MINOR for adding a principle or section or materially expanding
guidance, PATCH for clarifications. Every plan and review MUST check compliance with these
principles; any deviation needs the developer's explicit approval.

**Version**: 1.0.0 | **Ratified**: 2026-11-02 | **Last Amended**: 2026-11-02
