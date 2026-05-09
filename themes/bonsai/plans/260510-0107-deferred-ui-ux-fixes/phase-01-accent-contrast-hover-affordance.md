---
phase: 1
title: Accent contrast + hover affordance
status: completed
priority: P1
effort: 30m
dependencies: []
---

# Phase 1: Accent contrast + hover affordance

## Overview

P1 + P2 from the 260510 review.

- **P1** Bring sakura-light and koi-light accent chip text to WCAG AA on bg by darkening the brand accent variables. User chose **darken brand accents** over chip-only bold styling.
- **P2** Strengthen `.link` hover affordance with subtle bg color-mix tint (currently only border + 1px lift; feels timid).

## Requirements

- **Functional:** chip with accent bg and `--bonsai-bg` text passes WCAG AA on sakura-light and koi-light. Hover state on links is perceptibly different from rest state without breaking restrained visual identity.
- **Non-functional:** CSS file size delta < 200 B raw; no new selectors that would balloon specificity; respects `prefers-reduced-motion`.

## Architecture

- Pure CSS edit; no markup change.
- `color-mix(in oklab, ...)` is supported in Chrome 111+/Safari 16.4+/Firefox 113+ — covers Bonsai's stated browser baseline (the theme already uses `clamp()`, `:focus-visible`, `dvh`).

## Related Code Files

- Modify: `static/css/bonsai.css`
- Modify: `README.md` (palette hex table)

## Implementation Steps

1. **Sakura-light accent**: change `--bonsai-accent: #d4456a` → `#c93f63` at `static/css/bonsai.css:65`. Computed contrast on bg `#fff5f7`: 4.49:1 (was 4.04). On surface `#ffffff`: 4.85:1 (was 4.32).
2. **Koi-light accent**: change `--bonsai-accent: #c8521e` → `#bd4c1c` at `static/css/bonsai.css:125`. Computed on bg `#fef6e4`: 4.63:1 (was 4.17). On surface `#ffffff`: 5.00:1 (was 4.49).
3. **Leave dark variants alone** — sakura-dark `#ec7596` and koi-dark `#ff8b5c` already pass against their dark bg/surface.
4. **Hover affordance** on `.link:hover` (`static/css/bonsai.css:276-279`): add `background: color-mix(in oklab, var(--bonsai-surface) 94%, var(--bonsai-accent));` alongside existing `transform` + `border-color`. Keep transition on `background` (already present at line 273).
5. **README palette table** (`README.md:122-125`): update the two hex codes in the swatch table. Keep the human label ("cherry blossom pink", "orange + cream") — the hex shift is small enough that the label still applies.
6. **Visual identity check**: eyeball both accents in the gallery (`/themes/`) — confirm sakura still reads as cherry-pink (not raspberry) and koi still reads as orange (not brick).
7. **Build**: `hugo --gc --minify` from `exampleSite/` with `--themesDir ../..`. Confirm no warnings; CSS minified output sane.

## Success Criteria

- [ ] sakura-light accent on bg ≥ 4.5:1 (computed)
- [ ] koi-light accent on bg ≥ 4.5:1 (computed)
- [ ] dark accents unchanged
- [ ] `.link:hover` shows perceptible bg shift in all 4 palettes light + dark
- [ ] `prefers-reduced-motion` still suppresses transform but allows the static bg state
- [ ] README hex table updated to new values
- [ ] `hugo --gc --minify` completes clean

## Risk Assessment

- **Risk:** sakura at `#c93f63` reads as raspberry/wine to some eyes — drift from "cherry blossom" semantics. **Mitigation:** the delta is ~6% lightness; rolled back trivially if disliked.
- **Risk:** `color-mix` produces a tinted bg that fights `--bonsai-surface` look on dark mode (where surface is already lifted). **Mitigation:** 6% accent at `oklab` is quite subtle; verify in dark mode during step 6. If too much, drop to 96/4 mix.
- **Risk:** README hex update missed in another doc/theme.toml. **Mitigation:** grep for old values across all files before commit.
