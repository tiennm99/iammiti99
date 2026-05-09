---
title: 'v0.4 release: ship gallery-CSS extraction + more icons + opt-in RSS'
description: >-
  Ship issues #11, #10, #8 each as its own PR; tag v0.4.0. Issues #7 (OG
  auto-gen) and #9 (multi-section bio) deferred to v0.5 per their own deferral
  notes.
status: pending
priority: P2
created: 2026-05-10T00:00:00.000Z
---

# v0.4 release: ship the three well-scoped v0-line enhancements

## Overview

Per scope-check: ship the three well-scoped issues now, defer the two design-heavy ones.

- **Phase 2** Extract gallery CSS (#11) — pure refactor, smallest scope
- **Phase 3** Add more icons (#10) — mechanical, data-driven
- **Phase 4** Optional RSS feed (#8) — additive opt-in
- **Phase 7** v0.4.0 release prep

Each phase ships as its own feature branch + PR (matches repo pattern).

## Deferred to v0.5

- **#7 Auto-generate OG image** — issue text: *"If no path meets [≤30 KB binary], defer to v0.5"*. Of 5 candidate approaches, only `pyftsubset Inter` + base PNG might fit; needs measured prototype before committing.
- **#9 Multi-section bio** — issue text: *"Likely a 2026-Q3 candidate, not v0.4"*. Schema design dispute; needs `/ck:brainstorm` before a plan.

## Phases (active)

| Phase | Name | Status |
|-------|------|--------|
| 2 | [Extract gallery CSS (#11)](./phase-02-extract-gallery-css-11.md) | Completed |
| 3 | [Add more icons (#10)](./phase-03-add-more-icons-10.md) | Pending |
| 4 | [Optional RSS feed (#8)](./phase-04-optional-rss-feed-8.md) | Pending |
| 7 | [v0.4.0 release prep](./phase-07-v0-4-0-release-prep.md) | Pending |

(Phase numbers preserved from original 7-phase scaffold for stable references.)

## Dependencies

- Phase 7 depends on Phases 2, 3, 4. Each of 2/3/4 is independent and ships as a separate PR.
