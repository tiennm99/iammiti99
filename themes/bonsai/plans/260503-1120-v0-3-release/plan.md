---
title: "v0.3 release — layout variants, OG image generation, i18n"
status: pending
created: 2026-05-03
target: 2026-05-04
---

# v0.3 Release

Same cadence as v0.2: small, additive, opt-in. v0.1 / v0.2 sites upgrade with no config edits.

## Goals
- Give users layout choice (stack vs grid vs inline) without losing the minimalist defaults.
- Auto-generate Open Graph preview images so shared links look polished without per-site asset work.
- Externalize all theme-rendered strings via Hugo i18n so non-English sites work end-to-end.

## Non-goals
- Multi-page support (still single-page bio).
- Runtime JS for layout switching.
- Translating bio copy itself (user content stays user-owned).

## Phases

| # | Title | Status | Notes |
|---|-------|--------|-------|
| 1 | Layout variants (stack/grid/inline) | ✅ done | New `params.layout`. Pure CSS, scoped under `.bio__links--{variant}`. |
| 2 | OG image params (override + twitter card) | ✅ done (scope-reduced) | Auto-generation deferred to v0.4 (binary asset weight conflicted with minimalist principle). |
| 3 | i18n string externalization | ✅ done | `i18n/en.toml` + `vi.toml` shipped. Vietnamese smoke-tested. |
| 4 | Demo + docs polish | ✅ done (screenshots pending) | README updated, `/variants/` gallery live, demo uses grid. **Screenshots not regenerated yet — user needs to capture on real browser.** |
| 5 | v0.3.0 release | ⏸ awaiting user | CHANGELOG ready. Commit + tag + push pending user authorization. |

## Dependencies
- Phase 1–3 are independent (different files). Can be implemented in any order.
- Phase 4 depends on 1–3 (needs final params + screenshots).
- Phase 5 depends on 4 (needs README + CHANGELOG before tag).

## Risks (carried from v0.2 lessons)
- CSS specificity bugs hide in cascade. Layout variants must be screenshot-tested.
- `<script>` / `<style>` template contexts auto-escape — use `safeHTML` / `safeCSS` where needed.
- Static assets that should respond to theme must inherit, not hardcode.

## Files

```
plans/260503-1120-v0-3-release/
├── plan.md                            (this file)
├── phase-01-layout-variants.md
├── phase-02-og-image-generation.md
├── phase-03-i18n-string-externalization.md
├── phase-04-demo-docs-polish.md
└── phase-05-v0-3-release.md
```
