---
phase: 5
title: "v0.3.0 release"
status: pending
priority: P2
effort: "0.5h"
dependencies: [4]
---

# Phase 5: v0.3.0 release

## Overview
Cut v0.3.0 — bump CHANGELOG, tag the commit, push, monitor demo deploy, write the journal entry. Same protocol as v0.2.

## Requirements
- Functional:
  - CHANGELOG `[Unreleased]` block moves to `[0.3.0] — <today>`.
  - New `[Unreleased]` placeholder added with v0.4 candidates.
  - Annotated tag `v0.3.0` on the merge commit.
  - GitHub Pages deploy of the new exampleSite succeeds.
  - Journal entry under `docs/journals/2026-05-04-v0-3-release.md` (or actual date) following the v0.2 entry's format.
- Non-functional:
  - No breaking changes; all v0.2 sites upgrade with no config edits.

## Architecture
- N/A — release admin only.

## Related Code Files
- Modify:
  - `CHANGELOG.md`
- Create:
  - `docs/journals/{date}-v0-3-release.md`
- Delete: none.

## Implementation Steps
1. Update `CHANGELOG.md`:
   - Move existing v0.3 placeholder content into a real `## [0.3.0] — <date>` section.
   - List Added (3 features), Changed (head/twitter:card upgrade, exampleSite layout switch), and any Fixed entries.
   - Add fresh `## [Unreleased]` block with placeholder bullet for v0.4 candidates (e.g. RSS opt-in, more icons, multi-section bio?).
2. Verify build: `cd exampleSite && hugo --themesDir ../.. --gc --minify` — no warnings, no missing translations.
3. Commit final changes: `chore(release): v0.3.0 — layout variants, OG images, i18n`.
4. Tag: `git tag -a v0.3.0 -m "Release v0.3.0 — layout variants, OG images, i18n"`.
5. Push: `git push && git push --tags`.
6. Watch GitHub Actions: build + deploy must both go green.
7. Verify live demo: <https://tiennm99.github.io/bonsai/> shows new layout, `/variants/`, `/themes/`, `/icons/` all accessible.
8. Verify OG image: paste live URL into <https://cards-dev.twitter.com/validator> + <https://www.opengraph.xyz>.
9. Write journal entry following v0.2 format (What Happened / Brutal Truth / Technical Details / Root Cause / Lessons / Next Steps).

## Todo List
- [ ] Update `CHANGELOG.md` — move Unreleased to v0.3.0 section.
- [ ] Add fresh Unreleased placeholder.
- [ ] Final exampleSite build — no warnings.
- [ ] Commit + tag + push.
- [ ] Verify CI green (build + deploy).
- [ ] Verify live demo + new pages.
- [ ] Verify OG image via crawler validators.
- [ ] Write journal entry.
- [ ] (Optional) Submit theme catalog PR update if Hugo themes site re-validation needed.

## Success Criteria
- [ ] `v0.3.0` tag exists on `main`.
- [ ] CHANGELOG accurately documents the release.
- [ ] Live demo running v0.3 with grid layout visible.
- [ ] Twitter / Facebook / LinkedIn previews render the generated OG image.
- [ ] No upgrade path issues for v0.2 users (test by reverting exampleSite to v0.2 hugo.toml — site still builds).

## Risk Assessment
- **OG image cache** — Facebook + LinkedIn aggressively cache previews. After release, manually re-scrape via the FB sharing debugger and LinkedIn post inspector to flush.
- **Hugo themes catalog** — v0.2 may still be pending review per the v0.2 journal note. Don't open a v0.3 PR there until v0.2 is merged; otherwise the catalog PR collects two pending updates.
- **Same-day or next-day release** — v0.2 was same-day after v0.1. v0.3 is bigger (3 features). Realistic target: 1–2 days from start. Don't rush a tag if Phase 4 screenshots aren't fully validated.
