---
phase: 8
title: "Lighthouse CI + docs + v0.5 release prep"
status: completed
priority: P1
effort: "1d"
dependencies: [1, 2, 3, 4, 5, 6, 7]
---

# Phase 8: Lighthouse CI + docs + v0.5 release prep

## Overview

Wrap the release: add a Lighthouse CI gate to GitHub Actions that fails PRs below score thresholds, finalize all docs, write the v0.5.0 CHANGELOG entry, bump version metadata, tag and ship.

## Context Links

- All prior phases (1–7) must be merged or carried as parallel PRs before this phase tags v0.5.0.
- Source: `plans/reports/researcher-260515-hugo-lighthouse-best-practices.md` §8 (sample workflow YAML)
- Existing GitHub Actions: `.github/workflows/build.yml` (current `hugo --gc --minify` build gate)

## Requirements

### Functional

**1. Lighthouse CI workflow** — new GitHub Actions job that:
- Builds `exampleSite` with current branch.
- Serves it via a static file server.
- Runs `treosh/lighthouse-ci-action@v12` against the served URL.
- Threshold floor: **≥90 across all 4 categories** (Performance, Accessibility, Best-Practices, SEO) — locked in validation session 1.
- Asserts thresholds (tightened per validation session 1 from "≥80 across the board" to **≥90 across the board**):
  - `categories:performance >= 0.90`
  - `categories:accessibility >= 0.90`
  - `categories:best-practices >= 0.90`
  - `categories:seo >= 0.90`
- Fails the PR if any threshold missed.
- Uploads HTML report as workflow artifact for easy review.

**2. Documentation finalization:**
- `README.md` rewritten "Features" section reflects all v0.5 additions.
- `README.md` "Lighthouse" section added with the score targets.
- `docs/deployment-guide.md` from Phase 1/6 polished.
- `docs/system-architecture.md` (new — light) — single page covering the rendering pipeline post-Phase-5 (image processing, fingerprinting).
- `docs/code-standards.md` (new — light) — coding conventions: kebab-case files, partials structure, CSS BEM-style, i18n keys.
- `CONTRIBUTING.md` updates: how to add a new icon (existing), how to regen the font subset (new from Phase 7), how to run Lighthouse locally.

**3. Version bump + CHANGELOG:**
- `CHANGELOG.md` `[Unreleased]` → `[0.5.0] — 2026-MM-DD` with full Added/Changed/Removed sections.
- `theme.toml` `min_version = "0.140.0"`, `tag` list updated.
- Tag `v0.5.0` once merged.

**4. exampleSite cohesive showcase:**
- One coherent demo on `/` that exercises a representative subset of new features (sections, share button, QR, one featured link, theme-color meta). Not every feature — but enough that the live demo signals "this is a linktree-class theme."

### Non-functional

- Lighthouse CI runtime ≤ 2 min on the workflow (manageable for PR feedback).
- Workflow artifact size ≤ 5 MB (Lighthouse HTML report is ~1–2 MB; well under).
- No leaked credentials in workflow (no `temporaryPublicStorage` if it requires login — verify treosh action docs).

## Architecture

```
.github/workflows/
├── build.yml           (existing — Hugo build gate)
└── lighthouse-ci.yml   (new — gates score thresholds)

.lighthouserc.json      (new — root config consumed by lighthouse-ci-action)
  └─ ci.collect.staticDistDir = "exampleSite/public"
  └─ ci.assert.assertions for 4 category thresholds

docs/
├── deployment-guide.md         (finalized from Phases 1, 6)
├── system-architecture.md      (new)
└── code-standards.md           (new)

README.md
  ├─ Features section: regrouped by Phase 1–7 contributions
  ├─ Lighthouse section: badge + targets + how to run locally
  └─ Configuration: all new params documented

CHANGELOG.md
  └─ [0.5.0] entry: Added / Changed / Removed
```

## Related Code Files

**Modify:**
- `README.md` — features list, params table, Lighthouse section
- `CHANGELOG.md` — v0.5.0 entry
- `theme.toml` — `min_version`, `tag` list
- `CONTRIBUTING.md` — new sections for font subset regen + Lighthouse local run

**Create:**
- `.github/workflows/lighthouse-ci.yml`
- `.lighthouserc.json`
- `docs/system-architecture.md`
- `docs/code-standards.md`

## Implementation Steps

1. **Author `.lighthouserc.json`:**
   ```json
   {
     "ci": {
       "collect": {
         "staticDistDir": "exampleSite/public",
         "numberOfRuns": 3
       },
       "assert": {
         "preset": "lighthouse:recommended",
         "assertions": {
           "categories:performance": ["error", {"minScore": 0.90}],
           "categories:accessibility": ["error", {"minScore": 0.90}],
           "categories:best-practices": ["error", {"minScore": 0.90}],
           "categories:seo": ["error", {"minScore": 0.90}],
           "uses-responsive-images": "off",
           "csp-xss": "off"
         }
       },
       "upload": {
         "target": "filesystem",
         "outputDir": "./lhci-reports"
       }
     }
   }
   ```
   Notes: `uses-responsive-images` may flag SVG initials → tune. `csp-xss` requires hosting headers → fixed by deploy templates, not theme; suppress at CI level.

2. **Author `.github/workflows/lighthouse-ci.yml`:**
   ```yaml
   name: lighthouse-ci

   on:
     pull_request:
       branches: [main]
     push:
       branches: [main]

   jobs:
     lighthouse:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Setup Hugo
           uses: peaceiris/actions-hugo@v3
           with:
             hugo-version: '0.140.0'
             extended: true

         - name: Build exampleSite
           run: |
             cd exampleSite
             hugo --themesDir ../.. --gc --minify --baseURL http://localhost/

         - name: Run Lighthouse CI
           uses: treosh/lighthouse-ci-action@v12
           with:
             configPath: ./.lighthouserc.json
             uploadArtifacts: true
             temporaryPublicStorage: false

         - name: Upload Lighthouse report
           if: always()
           uses: actions/upload-artifact@v4
           with:
             name: lighthouse-report
             path: ./lhci-reports
             retention-days: 7
   ```

3. **`docs/system-architecture.md`** — covering:
   - Hugo theme structure (layouts, partials, assets, i18n, data, static).
   - Asset pipeline (resources.Get → Minify → Fingerprint → integrity hashes).
   - Image pipeline (avatar/link thumbnails → AVIF/WebP/JPEG variants).
   - OG-image generation (Phase 7 status — auto if gate passed; user-supplied if not).
   - JSON-LD strategy (Person always; WebSite opt-in).
   - i18n flow.

4. **`docs/code-standards.md`** — covering:
   - File naming: kebab-case, descriptive over short.
   - Partial composition: each partial reads from `site.Params` directly OR receives a `dict` parameter explicitly; not both.
   - CSS conventions: BEM-ish `.block`, `.block__elem`, `.block--modifier`. CSS variables for everything user-tunable.
   - i18n key convention: snake_case keys; user-facing strings always go through `i18n`.

5. **Rewrite README "Features" section** to mention v0.5 additions:
   - Link sections / multi-section bio
   - Per-link thumbnails, featured, scheduled visibility, rel, note
   - Page-level share + QR + vCard
   - Opt-in GA4 click analytics (single provider; consent caveat in README)
   - Hugo image pipeline (AVIF/WebP responsive avatar)
   - Auto-OG image (Phase 7 status)
   - Manifest + WebSite schema
   - Lighthouse CI gating

6. **CHANGELOG v0.5.0 entry** (format-preserving):
   ```markdown
   ## [0.5.0] — 2026-MM-DD

   Feature-parity + Lighthouse release. Closes #7 (auto-OG, status: gated by binary budget) and #9 (multi-section bio). All additions are strictly opt-in; v0.4 sites upgrade with no config edits.

   ### Added
   - Multi-section bio via `[[params.sections]]` (#9)
   - Per-link `image`, `featured`, `startDate`/`endDate`, `rel`, `note` fields
   - Page-level `params.share`, `params.qr`, `params.vcard`
   - Opt-in click analytics: `[params.analytics]` block for Google Analytics 4 (consent caveat documented)
   - Hugo image pipeline: AVIF/WebP/JPEG responsive avatar and link thumbnails
   - Fingerprinted CSS + SRI integrity hashes
   - Auto-OG image generation (status: PASSED|GATED — fill in based on Phase 7 measurement)
   - Web manifest + WebSite JSON-LD (both opt-in)
   - `params.themeColor`, `params.robots`, `params.preloadAvatar`, `params.schemaWebSite`, `params.manifest`
   - Skip-link for keyboard navigation
   - Lighthouse CI workflow with score thresholds (P / A11y / BP / SEO all ≥90)
   - `docs/deployment-guide.md`, `docs/system-architecture.md`, `docs/code-standards.md`

   ### Changed
   - Canonical URL, og:url, robots meta now emitted by default
   - Avatar img gains width/height/fetchpriority="high"/decoding="async"
   - Inline-layout link tap targets enforced at 48×48 px
   - Min Hugo version: 0.140.0 (was 0.128.0) — required for `images.QR` and AVIF processing

   ### Removed
   - None (all changes additive)
   ```

7. **Version + tag:**
   - Bump `theme.toml` `min_version = "0.140.0"`.
   - After merge to `main`, tag `v0.5.0`: `git tag -a v0.5.0 -m "v0.5.0 release"`.
   - GitHub release notes mirror CHANGELOG entry.

8. **Final cohesive exampleSite:** demo at `/` exercises:
   - 2 sections (e.g. "Code" + "Music")
   - 1 featured link
   - Share button enabled
   - QR block enabled
   - WebSite schema enabled
   - manifest enabled
   - `themeColor = "#8b3a2b"` set
   - analytics commented out

9. **Top-5 leverage summary** (insert into plan.md after Phase 8 lands):

   | Rank | Improvement | Lighthouse delta | Linktree parity delta | Effort | Phase |
   |------|-------------|------------------|----------------------|--------|-------|
   | 1 | Avatar attrs (width/height/fetchpriority/decoding) | +15 LCP | — | S | 1 |
   | 2 | Multi-section bio (#9) | — | High | M | 2 |
   | 3 | Hugo image pipeline (AVIF/WebP) | +10 Perf | — | M | 5 |
   | 4 | Canonical + og:url + theme-color + robots meta | +10 SEO | — | S | 1 |
   | 5 | QR + share + copy-link page-level controls | — | High | S–M | 3 |

## Todo List

- [ ] Author `.lighthouserc.json` with category thresholds
- [ ] Author `.github/workflows/lighthouse-ci.yml`
- [ ] Verify workflow passes against current branch (≥ Phase 1 merged)
- [ ] Write `docs/system-architecture.md`
- [ ] Write `docs/code-standards.md`
- [ ] Finalize `docs/deployment-guide.md` (started in Phase 1)
- [ ] Rewrite README "Features" with v0.5 additions
- [ ] Write CHANGELOG v0.5.0 entry
- [ ] Update CONTRIBUTING.md with font-subset + Lighthouse-local sections
- [ ] Bump `theme.toml` `min_version = "0.140.0"`, update tags
- [ ] Update exampleSite to cohesive showcase
- [ ] Tag `v0.5.0` post-merge
- [ ] Write GitHub Release notes

## Success Criteria

- [ ] `lighthouse-ci.yml` workflow passes on `main` with all 4 thresholds at ≥90 (P / A11y / BP / SEO)
- [ ] PR CI fails fast on Lighthouse regression
- [ ] Workflow artifact contains an HTML Lighthouse report viewable in browser
- [ ] CHANGELOG v0.5.0 entry covers every new param and behavioral change
- [ ] README documents every new param with at least one example
- [ ] `theme.toml` version bumped
- [ ] `v0.5.0` git tag created
- [ ] GitHub Release published with notes
- [ ] exampleSite demo at production URL passes the same Lighthouse thresholds
- [ ] No v0.4 → v0.5 site config-edit migration required (verified by checkout-and-build of a snapshot v0.4 user config)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Lighthouse CI runtime exceeds the 6-min Action timeout | Cap at `numberOfRuns: 3`. Single URL keeps fast. |
| CI fails on transient flaky Lighthouse score (esp. INP variance) at the ≥90 floor | `numberOfRuns: 3` median + deterministic throttle. Cold-run dips bridge gap. Acceptable trade-off for the harder gate the user picked in validation session 1. |
| `temporaryPublicStorage: true` would leak demo URL to a public Lighthouse CDN — privacy concern | Use `false` and rely on workflow artifact instead. |
| Thresholds too strict (90/90/90/90); CI fails on a transient cold-run dip | Mitigations: `numberOfRuns: 3` median; throttle settings deterministic; if real failures, tighten the *theme* not the threshold. Phase 5 (image pipeline) + Phase 1 quick-wins together should clear ≥90 on a single-page bio. If a category persistently lands ~88, raise theme quality (not the gate). |
| Hugo 0.140 not available in CI cache | `peaceiris/actions-hugo@v3` downloads on demand; reliable. |
| Docs drift after release | Hook docs-update into release checklist; document in CONTRIBUTING.md. |
| Tag created prematurely (before phases merged) | Tag is the final-final step in the phase Todo list; CI gates protect main. |

## Security Considerations

- Workflow uses pinned action versions (`@v4`, `@v3`, `@v12`) — not floating `@latest`.
- No secrets required by Lighthouse workflow.
- Artifact retention 7 days; reports are scrubbed of any inadvertent PII (Lighthouse reports are static analysis, no user data).
- `temporaryPublicStorage: false` — keeps reports private to repo collaborators.
