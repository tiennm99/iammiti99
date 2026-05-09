---
title: Address deferred UI/UX items from 260510 review
description: >-
  Ship deferred items P1, P2, P4, P5, P6, P7 + Q4 from ui-ux-review-260510-0026.
  P3 (OG image rasterization) deferred to v0.4 per CHANGELOG.
status: completed
priority: P2
created: 2026-05-10T00:00:00.000Z
---

# Address deferred UI/UX items from 260510 review

## Overview

Ship remaining deferred UI/UX items from the 260510-0026 review. User-confirmed scope:

- **P1** Darken sakura/koi accents to WCAG AA on chip demo (`#d4456a`→`#c93f63`, `#c8521e`→`#bd4c1c`).
- **P2** Strengthen `.link` hover affordance with subtle bg color-mix.
- **P4** Favicon polish: add `params.faviconSvg` + `params.appleTouchIcon`.
- **P5** Wrap gallery cards in `<section aria-labelledby>` for landmark hierarchy.
- **P6** i18n fallback robustness in `theme-toggle-button.html`.
- **P7** Remove non-standard `data-theme="auto"` from `baseof.html`.
- **Q4** Hide theme-toggle when JS disabled (`<noscript>` rule).

**Out of scope:** P3 (auto-rasterize OG image) — deferred to v0.4 per CHANGELOG.

## Source

- Review report: `plans/reports/ui-ux-review-260510-0026-bonsai-theme.md`
- 10 fixes already shipped in same review pass — do not redo.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Accent contrast + hover affordance](./phase-01-accent-contrast-hover-affordance.md) | Completed |
| 2 | [Favicon polish system](./phase-02-favicon-polish-system.md) | Completed |
| 3 | [Semantic + i18n + data-theme cleanup](./phase-03-semantic-i18n-data-theme-cleanup.md) | Completed |
| 4 | [Docs sync + build verification](./phase-04-docs-sync-build-verification.md) | Completed |

## Dependencies

- No cross-plan dependencies. Phase 4 depends on Phases 1–3.
