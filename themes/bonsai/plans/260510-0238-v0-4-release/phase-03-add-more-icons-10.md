---
phase: 3
title: "Add more icons (#10)"
status: pending
priority: P3
effort: "30m"
dependencies: []
---

# Phase 3: Add more icons (#10)

## Overview

Vendor ~10 additional brand + utility SVGs to the existing 35-icon set. Mechanical: add entries to `data/icons.yaml`, run `scripts/sync-icons.sh`, update README tables, verify `/icons/` gallery.

## Shortlist (≤ 10, picked for breadth)

Brand (Simple Icons CC0):
- `bandcamp` — musicians
- `soundcloud` — musicians
- `spotify` — artist profiles
- `figma` — designers
- `dribbble` — designers
- `stackoverflow` — devs
- `matrix` — fediverse messaging

Utility (Lucide ISC):
- `book-open` — bookshelves, reading lists
- `download` — resume / vCard
- `heart` — sponsor / support

Total +10 → 45 icons. Soft ceiling at ~50 for v0-line per issue.

## Related Code Files

- Modify: `data/icons.yaml`
- Run: `scripts/sync-icons.sh`
- Generated: `assets/icons/brand/*.svg`, `assets/icons/ui/*.svg`
- Modify: `README.md` icon tables (both `<details>` blocks)

## Implementation Steps

1. Inspect current `data/icons.yaml` structure to match the entry schema.
2. Append the 10 shortlisted entries (correct slug, license attribution).
3. Run `scripts/sync-icons.sh` — verify SVGs land in `assets/icons/brand/` and `assets/icons/ui/`.
4. Inspect downloaded SVGs: confirm size budget (each typically < 1 KB).
5. Update README icon tables under both `<details>` blocks (brand + utility), keep alphabetical or current order convention.
6. Update README intro line if it claims a fixed count (e.g. "35 icons" → "45 icons").
7. Build + curl `/icons/` to confirm new icons render in gallery.
8. Update CHANGELOG (Unreleased).

## Success Criteria

- [ ] 10 new SVGs vendored under `assets/icons/`
- [ ] `data/icons.yaml` updated with 10 new entries
- [ ] README icon tables updated; count line updated
- [ ] `/icons/` gallery renders all new icons
- [ ] `hugo --gc --minify` clean
- [ ] PR opened against main

## Risk Assessment

- **Risk:** Simple Icons / Lucide rename or remove a slug. **Mitigation:** `sync-icons.sh` fails loudly if slug missing; pick alternates from the original issue list.
- **Risk:** SVG size larger than expected (some Simple Icons brand marks are heavy). **Mitigation:** check raw sizes after sync; reject if any single icon > 3 KB.
