---
phase: 4
title: "Demo + docs polish"
status: pending
priority: P2
effort: "1.5h"
dependencies: [1, 2, 3]
---

# Phase 4: Demo + docs polish

## Overview
Update README, exampleSite, and screenshots to showcase v0.3 additions. Same screenshot-rigor as v0.2 — visual diff is the only thing that catches CSS specificity bugs.

## Requirements
- Functional:
  - README parameter table includes all new params (`layout`, `ogImage`, `ogImageUrl`).
  - README has a short section on each new feature (Layout variants, OG images, i18n).
  - exampleSite demonstrates one of the new layouts (probably `grid`) so the live demo visibly shows the new feature.
  - Screenshots regenerated showing v0.3 state.
  - Optional: dedicated `/layouts/` demo page showing all 3 variants side by side, mirroring the existing `/themes/` and `/icons/` galleries.
- Non-functional:
  - README stays under ~250 lines after additions (currently 204) — be terse.
  - exampleSite remains a one-page bio; gallery pages are content-driven additions.

## Architecture
- Reuse the `/themes/` and `/icons/` gallery pattern: an `exampleSite/content/layouts/_index.md` page rendered by a new `layouts/layouts/single.html` template (Hugo's "layout" page-kind name conflicts will need careful handling — likely call the section `arrangements` or `variants` to avoid colliding with the literal `layouts/` template directory).
  - **Naming decision:** call the section `variants/` (URL `/variants/`), template `layouts/variants/single.html`.
- README diff: add a "## Layout variants" section after "## Color themes"; add an "## i18n" subsection inside Configuration or as its own short section; expand the params table.

## Related Code Files
- Create:
  - `exampleSite/content/variants/_index.md` — content page for layout gallery.
  - `layouts/variants/single.html` — renders the gallery (3 mini bio-cards, one per layout variant).
- Modify:
  - `README.md` — params table additions, new feature sections, link to `/variants/` gallery.
  - `exampleSite/hugo.toml` — set `layout = "grid"` to make the new feature visible on the live demo.
  - `images/screenshot.png` + `images/tn.png` — regenerate per Hugo themes-site submission requirements.
- Delete: none.

## Implementation Steps
1. Update `README.md`:
   - Add `layout`, `ogImage`, `ogImageUrl` rows to the params table.
   - Add `## Layout variants` section listing stack/grid/inline with one-line descriptions and a link to `/variants/`.
   - Add `## i18n` short section: "Theme strings live in `i18n/{lang}.toml`. Set Hugo's `languageCode` and add a matching bundle to translate. Ships with `en` and `vi`."
   - Add OG image note in the existing Configuration section (one short paragraph).
2. Update `exampleSite/hugo.toml`:
   - Set `layout = "grid"`.
   - Add commented `ogImageUrl = "..."` example.
3. Build the variants gallery:
   - `exampleSite/content/variants/_index.md` with frontmatter + short intro.
   - `layouts/variants/single.html` renders 3 mini cards (similar to themes gallery pattern). Each card shows a sample bio rendered with one variant.
4. Regenerate screenshots — `exampleSite` running locally, capture at 1280×800 per Hugo themes-site spec; capture both light + dark.
5. Validate: build full site, click through `/`, `/themes/`, `/icons/`, `/variants/` — every page renders, no console errors, no missing translations.

## Todo List
- [ ] Add `layout`, `ogImage`, `ogImageUrl` to README params table.
- [ ] Add README "Layout variants" + "i18n" sections.
- [ ] Update `exampleSite/hugo.toml` to use `layout = "grid"`.
- [ ] Create `exampleSite/content/variants/_index.md`.
- [ ] Create `layouts/variants/single.html` rendering all 3 variants side by side.
- [ ] Regenerate `images/screenshot.png` + `images/tn.png` (light + dark verified).
- [ ] Verify all pages: `/`, `/themes/`, `/icons/`, `/variants/`.
- [ ] Spot-check OG image preview via Twitter card validator.

## Success Criteria
- [ ] README documents every new v0.3 param with default + description.
- [ ] Live demo (after deploy) visibly uses the grid layout.
- [ ] `/variants/` page accessible from a link in the bio card or footer.
- [ ] Screenshots match the v0.3 demo state.
- [ ] No 404s, no missing translations, no console errors.

## Risk Assessment
- **Section name collision** — `layouts/` is Hugo's template directory; using `layouts` as a content section is confusing. Picking `variants/` keeps the section URL clean and avoids any chance of Hugo resolving the section via template autoloading.
- **Screenshot drift** — v0.2 already changed CSS palette scoping; another regen now means the v0.2 screenshots become outdated within ~24h. Acceptable since v0.3 is the new baseline; archive v0.2 screenshots in git history only.
- **README sprawl** — adding 3 features can easily push README past 300 lines. Discipline: each new section ≤ 15 lines; defer deep dives to inline doc comments or a separate `docs/features.md` if needed.
