---
phase: 1
title: "Layout variants (stack/grid/inline)"
status: pending
priority: P2
effort: "2h"
dependencies: []
---

# Phase 1: Layout variants (stack/grid/inline)

## Overview
Introduce `params.layout` to let users pick how `[[params.links]]` are arranged. Pure CSS — no JS, no template forks. Default unchanged (stack).

## Requirements
- Functional:
  - New string param `layout` with values: `stack` (default), `grid`, `inline`.
  - `stack`: current full-width vertical buttons.
  - `grid`: 2-col responsive grid (collapses to 1-col below ~480px).
  - `inline`: icon-only horizontal row (titles become `aria-label`/`title` for a11y); great for users with many short links.
  - Unknown value → falls back to `stack` and emits a Hugo warning via `errorf`.
- Non-functional:
  - Zero JS additions.
  - Visible layout class lives on `<nav class="bio__links">` so the cascade stays scoped.
  - All three variants pass focus-visible + reduced-motion tests.

## Architecture
- Template: `bio-card.html` reads `site.Params.layout`, validates against allowlist, renders `<nav class="bio__links bio__links--{layout}">`.
- CSS: add three rule blocks under `/* layouts */`. Variant rules are scoped: `.bio__links--grid .link { ... }`, never `.link { ... }` directly. (Lesson from v0.2 specificity bug.)
- `inline` variant changes `link-button.html` rendering? **No** — keep one button template. Hide `.link__title` visually-but-not-from-AT in the inline variant via `.bio__links--inline .link__title { position: absolute; left: -10000px; }` (or use existing `clip-path` pattern); add `aria-label` only when title is hidden via CSS — actually simpler: keep title in DOM, hide visually, screen readers still get it. No template changes needed.

## Related Code Files
- Modify:
  - `layouts/partials/bio-card.html` — read + validate `layout`, render variant class.
  - `static/css/bonsai.css` — add 3 variant rule blocks (grid + inline; stack is the default).
  - `exampleSite/hugo.toml` — uncomment example showing `layout = "grid"` (commented-out for default).
- Create: none.
- Delete: none.

## Implementation Steps
1. In `bio-card.html`, add validation:
   ```
   {{- $layout := site.Params.layout | default "stack" -}}
   {{- $valid := slice "stack" "grid" "inline" -}}
   {{- if not (in $valid $layout) }}
     {{- warnf "bonsai: unknown params.layout %q, falling back to 'stack'" $layout -}}
     {{- $layout = "stack" -}}
   {{- end -}}
   ```
2. Render `<nav class="bio__links bio__links--{{ $layout }}">`.
3. CSS — append a `/* === layout variants === */` section after the existing `.bio__links` block. Default `.bio__links` rules stay; variants override only what differs (`grid-template-columns`, `flex-direction`, padding).
4. For `inline`: hide `.link__title` via `clip` pattern — preserves screen-reader access; do **not** add `aria-label` (title is still in DOM).
5. Add a 480px media query inside `--grid` so it collapses to 1-col on phones.
6. Document the new param in README param table (deferred to Phase 4 — but note here so it's not lost).

## Todo List
- [ ] Validate `params.layout` in `bio-card.html` with allowlist + `warnf`.
- [ ] Append CSS for `.bio__links--grid`.
- [ ] Append CSS for `.bio__links--inline` (icon-only with visually-hidden titles).
- [ ] Add 480px breakpoint for `--grid`.
- [ ] Verify all 3 variants render correctly via `hugo server` + screenshot diff.
- [ ] Verify focus-visible outline works in all variants.
- [ ] Verify reduced-motion respected (no new transitions added).

## Success Criteria
- [ ] `params.layout = "stack"` (or unset) renders identically to v0.2.
- [ ] `params.layout = "grid"` renders 2-col → 1-col at 480px.
- [ ] `params.layout = "inline"` renders icon-only horizontal row; screen readers still announce link titles.
- [ ] `params.layout = "garbage"` falls back to stack with a Hugo build warning.
- [ ] No new JS bytes shipped.
- [ ] CSS bundle stays under 5 KB.

## Risk Assessment
- **CSS specificity collisions** (v0.2 lesson) — mitigate by scoping all variant rules under `.bio__links--{variant} .link`.
- **Inline variant accessibility** — visually-hidden title pattern is well-known; verify with VoiceOver / NVDA via screenshot of accessibility tree.
- **Grid breakpoint feels arbitrary at 480px** — chosen because most one-handed phone widths are ~390–430px; falls back to stack-equivalent below that.
