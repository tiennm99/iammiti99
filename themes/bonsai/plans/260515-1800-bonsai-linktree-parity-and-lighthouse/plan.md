---
title: "Bonsai v0.5: Linktree-parity (static-only) + Lighthouse ≥90"
description: >-
  Close static-feasible Linktree feature gaps (multi-section, QR, share, vCard,
  thumbnails, opt-in GA4 click analytics) and harden Lighthouse to ≥90 across
  all 4 categories on mobile + desktop. Absorbs deferred issues #7 (auto-OG) and
  #9 (multi-section bio). Threshold tightened from ≥80 brief to ≥90 in validation
  session 1.
status: completed
priority: P2
created: 2026-05-15T18:00:00.000Z
---

# Bonsai v0.5: Linktree-parity (static-only) + Lighthouse ≥90

## Overview

Two intertwined goals, one release:

1. **Feature parity with Linktree** for static-feasible features. ~71% of Linktree's surface is static-doable; ship the high-frequency subset Bonsai is missing: multi-section bio (#9), per-link thumbnails, featured flag, scheduled visibility, page-level share/copy/QR, vCard download, opt-in click analytics. Hard "no" to anything requiring auth/DB/live dashboards.
2. **Lighthouse ≥90 across all 4 categories** (tightened from "≥80" brief during validation session 1) on Performance, Accessibility, Best-Practices, SEO — mobile & desktop. Baseline already strong (2.9 KB gzip CSS, zero web fonts, zero JS default). Missing: `canonical`, `og:url`, `theme-color`, robots, image dims+fetchpriority, modern image formats, hreflang, security-header docs.

**Non-goals:** server-side anything. No node-runtime build steps. No drag-reorder UI. Stay <5 KB gzipped CSS budget (5.5 KB stretch ok if a feature warrants).

## Source reports

- `plans/reports/researcher-260515-bonsai-current-audit.md` — current v0.4.0 inventory
- `plans/reports/researcher-260515-linktree-feature-inventory.md` — 45 features × static-feasibility
- `plans/reports/researcher-260515-hugo-lighthouse-best-practices.md` — prioritized action matrix

## Phases

| Phase | Name | Effort | Priority | Status |
|-------|------|--------|----------|--------|
| 1 | [Lighthouse quick wins + meta hardening](./phase-01-lighthouse-quick-wins.md) | S (1d) | P1 | Completed |
| 2 | [Link sections / multi-section bio (#9)](./phase-02-link-sections.md) | M (2d) | P1 | Completed |
| 3 | [Per-link enhancements: thumbnails, featured, scheduled, share, copy, QR, vCard](./phase-03-link-enhancements.md) | M (3d) | P1 | Completed |
| 4 | [Opt-in click analytics (Google Analytics 4)](./phase-04-opt-in-analytics.md) | S (1d) | P2 | Completed |
| 5 | [Performance: Hugo image pipeline, AVIF/WebP, fingerprinted CSS](./phase-05-performance-image-pipeline.md) | M (2d) | P1 | Completed |
| 6 | [SEO + a11y hardening + deploy templates](./phase-06-seo-a11y-deploy-templates.md) | M (2d) | P2 | Completed |
| 7 | [Auto-OG image (#7) — measured ≤30KB prototype](./phase-07-auto-og-image.md) | M (2d) | P3 | Completed |
| 8 | [Lighthouse CI + docs + v0.5 release prep](./phase-08-lighthouse-ci-release.md) | S (1d) | P1 | Completed |

## Dependencies

- Phase 5 depends on Phase 3 (link thumbnails ride the image pipeline).
- Phase 7 depends on Phase 5 (uses Hugo image pipeline).
- Phase 8 depends on all others (CI + release wrap-up).
- Phases 1, 2, 4, 6 are independent — can ship as separate PRs in parallel.

## Backward compatibility

All new params are **opt-in**. Existing v0.4 site configs continue to render identically:

- `[[params.links]]` flat list still works (Phase 2 detects `[[params.sections]]` and falls back).
- No new mandatory fields. No renamed params. No breaking CSS selectors.

## Deferred / out-of-scope

| Item | Why deferred |
|------|--------------|
| Drag-to-reorder UI | Requires JS framework; Bonsai is zero-JS default. Users edit `hugo.toml` directly. |
| Live analytics dashboard | Server-only. Phase 4 ships *GA4 snippet* only; dashboard is in Google Analytics. |
| Team collaboration | Auth+DB required. Out of static scope forever. |
| Instagram/TikTok live social feed | Runtime API. Could revisit as build-time fetch via GitHub Actions cron — out of scope for v0.5. |
| Service worker / offline mode | Low ROI for single-page bio. Revisit if requested. |

## Plan dependencies (cross-plan)

- Absorbs deferred items from completed `plans/260510-0238-v0-4-release`: **#9 multi-section bio** (Phase 2), **#7 auto-OG image** (Phase 7). Both flagged "deferred to v0.5" in `CHANGELOG.md [Unreleased]`.
- No active plan conflicts; both prior plans (`260510-0107`, `260510-0238`) status = completed.

## Success criteria (release-level)

- [ ] Lighthouse mobile + desktop scores ≥ 90 on Performance / A11y / Best-Practices / SEO on `exampleSite` demo (per validation session 1; tightened from initial ≥80 brief)
- [ ] Top-10 priority static-feasible Linktree features supported (see `## Top-5 leverage` in Phase 8)
- [ ] Production CSS ≤ 5.5 KB gzipped (stretch goal: ≤ 5 KB)
- [ ] Zero new mandatory params; v0.4 sites upgrade with no config edits
- [ ] All exampleSite demos still build green in CI (`hugo --gc --minify`)
- [ ] CHANGELOG entry for v0.5.0 with all additions, changes, removals

## Top-5 highest-leverage improvements

(See Phase 8 for full ranking matrix. Quick preview:)

1. **Avatar `width`/`height` + `fetchpriority="high"` + `decoding="async"`** — Phase 1. +15 LCP, S effort.
2. **Multi-section bio** — Phase 2. Unblocks #9 (Linktree's #1 differentiator), M effort.
3. **Hugo image pipeline (AVIF/WebP responsive avatar)** — Phase 5. +10 perf, M effort.
4. **Canonical URL + og:url + theme-color + robots meta** — Phase 1. +10 SEO, S effort.
5. **QR + share + copy-link page-level controls** — Phase 3. High Linktree-parity value, S–M effort.

## Validation Log

### Session 1 — 2026-05-15
**Trigger:** `/ck:plan validate` after initial plan write
**Questions asked:** 4

#### Questions & Answers

1. **[Scope]** Phase 7 auto-OG image ships only if total vendored binary ≤ 30 KB. If the measured prototype exceeds budget, what should happen?
   - Options: Ship infra-only, user-supplied assets (Recommended) | Defer Phase 7 entirely to v0.6 | Increase budget to 50 KB
   - **Answer:** Ship infra-only, user-supplied assets
   - **Rationale:** Theme adds `params.ogAuto` + Hugo template logic even if base assets don't fit budget. Users provide their own base PNG + font path. Phase 7 still ships in v0.5; default behavior is "auto-OG disabled until user supplies assets". CHANGELOG documents the gap.

2. **[Scope]** Phase 4 analytics scope: which providers does v0.5 ship?
   - Options: All 4 (Plausible+Umami+GA4+custom) | Plausible+Umami+custom (Recommended) | Plausible only | GA4 only
   - **Answer:** Google Analytics only
   - **Rationale:** User explicitly chose GA4-only — *opposite* of skill recommendation. Honored without auto-reversing per CLAUDE.md rule. Plausible / Umami / custom scopes cut from v0.5. Phase 4 rewritten to GA4-only. Consent caveat (GDPR / PECR / CPRA) prominent in README + deploy guide. Phase 4 effort reduced from 1d to 0.5d.

3. **[Risk]** Phase 8 Lighthouse CI thresholds. User goal stated "above 80 by Google" — what fails the PR?
   - Options: P≥80, A11y≥90, BP≥80, SEO≥90 (Recommended) | All ≥80 | All ≥90 (push harder)
   - **Answer:** All ≥90 (push harder)
   - **Rationale:** User opted to tighten beyond original brief. Threshold floor across all 4 categories now **≥90**. Plan title, success criteria, Phase 5 success criterion, Phase 8 workflow YAML + `.lighthouserc.json` all reconciled. Risk: cold-run CI dips may flake — `numberOfRuns: 3` median + deterministic throttle mitigate.

4. **[Architecture]** Phase 2: when both `params.links` AND `params.sections` are set, what's the conflict policy?
   - Options: Sections win + build warning (Recommended) | Hard error: refuse build | Merge as unnamed section
   - **Answer:** Sections win + build warning
   - **Rationale:** Matches skill recommendation. Phase 2 already specifies `warnf` nudge. No further changes needed.

#### Confirmed Decisions
- Phase 4 scope reduced to **GA4 only** — Plausible, Umami, custom provider switch removed from v0.5
- Lighthouse CI threshold floor **≥90 across all 4 categories** (Performance, A11y, Best-Practices, SEO)
- Phase 7 ships infra-only when 30 KB binary budget unmet (no defer, no budget bump)
- Phase 2 conflict policy: sections win + Hugo warnf

#### Action Items
- [x] Rewrite Phase 4 to GA4-only scope
- [x] Update Phase 8 thresholds + workflow YAML + `.lighthouserc.json`
- [x] Update plan.md title, success criteria, deferred-table analytics row
- [x] Sweep stale Plausible/Umami/custom references in Phase 8 CHANGELOG draft
- [x] Sweep stale "≥80" references in Phase 1, Phase 5, plan.md

#### Impact on Phases
- **Phase 4:** Major rewrite — single-provider (GA4) instead of switch over 4 providers. Effort 1d → 0.5d.
- **Phase 8:** Thresholds tightened. Workflow YAML + lighthouserc.json updated. Risk note rewritten to acknowledge harder gate.
- **Phase 1:** Expected-gain wording reconciled to ≥90 floor.
- **Phase 5:** Success criterion reconciled to ≥90.
- **Phase 7:** No changes required — already specified the user's chosen disposition.
- **Phase 2:** No changes required — already specified the user's chosen policy.

### Verification Results (Step 2.5)
- **Tier:** Full (8 phases)
- **Claims spot-checked:** 6
- **Verified:** 6 | **Failed:** 0 | **Unverified:** 0

| Claim | Result | Evidence |
|-------|--------|----------|
| `theme.toml` `min_version = "0.128.0"` (will bump to 0.140 per Phase 3/8) | VERIFIED | `theme.toml:9` |
| `assets/icons/` exists with `brand/` + `ui/` subdirs | VERIFIED | `find assets -name "*.svg"` returns 45 files under brand+ui |
| `static/` contains only `css/` + `js/` (sole Phase 5 migration scope) | VERIFIED | `ls static/` = `css js` |
| `icon.html` uses `resources.Get "icons/..."` (confirms `assets/` is the resource root) | VERIFIED | `layouts/partials/icon.html:5` |
| Existing CSS at `static/css/bonsai.css`, 10.47 KB raw (audit baseline) | VERIFIED | `wc -c static/css/bonsai.css` |
| Existing JS at `static/js/theme-toggle.js`, 1.12 KB (audit baseline) | VERIFIED | audit report §3 |

### Whole-Plan Consistency Sweep
- **Files re-read:** plan.md + phase-01..08 (9 files)
- **Decision deltas checked:** 2 (analytics scope, LH thresholds)
- **Reconciled stale references:** 7
  - plan.md title "≥80" → "≥90"
  - plan.md description "Lighthouse to ≥80" → "Lighthouse to ≥90"
  - plan.md H1 "≥80" → "≥90"
  - plan.md success criterion "≥ 80" → "≥ 90"
  - plan.md goal paragraph "≥80" → "≥90" with session-1 note
  - plan.md deferred table "Plausible/Umami/GA" → "GA4 snippet only; dashboard is in Google Analytics"
  - plan.md phase index "Plausible/Umami/GA" → "Google Analytics 4"
  - phase-01 expected-gain "≥80" → "≥90 floor"
  - phase-05 success criterion "≥ 80 required" → "≥ 90 locked"
  - phase-08 four threshold references in YAML + workflow + rubric + risk
  - phase-08 CHANGELOG draft "Plausible / Umami / GA4 / custom" → "GA4 only"
  - phase-08 README features rewrite "Plausible / Umami / GA" → "GA4 click analytics"
- **Unresolved contradictions:** 0
- **Ready for `/ck:cook`:** ✓
