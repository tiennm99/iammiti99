---
phase: 7
title: v0.4.0 release prep
status: completed
priority: P3
effort: 30m
dependencies:
  - 2
  - 3
  - 4
---

# Phase 7: v0.4.0 release prep

## Overview

After phases 2, 3, 4 merge to main, sync `CHANGELOG.md`, bump version references, tag `v0.4.0`, push tag.

## Implementation Steps

1. Pull latest `main`, confirm phases 2/3/4 PRs are merged.
2. Move `## [Unreleased]` section to `## [0.4.0] — 2026-05-10` (or actual merge date).
3. Add fresh `## [Unreleased]` section above with v0.5 placeholders (#7 OG auto-gen, #9 multi-section bio explicitly listed as deferred from v0.4).
4. Cross-check README for stale "v0.3" or version mentions; update where needed.
5. Reissue `theme.toml` `min_version` only if a phase added a Hugo feature requiring a newer Hugo version (none expected here).
6. Final build: `hugo --gc --minify --themesDir ../..` from `exampleSite/` — clean.
7. `git tag v0.4.0 -m "v0.4.0: gallery CSS extraction, more icons, opt-in RSS"`
8. `git push origin v0.4.0`
9. Run `/ck:journal` for the v0.4.0 release retro.

## Success Criteria

- [ ] CHANGELOG has dated `## [0.4.0]` section
- [ ] `## [Unreleased]` section exists with v0.5 deferral notes
- [ ] `git tag v0.4.0` exists locally and on remote
- [ ] Build clean across all 3 demo pages

## Risk Assessment

- **Risk:** auto-tag without user approval. **Mitigation:** ask before `git push origin v0.4.0`; tag is the publish event, deserves explicit consent.
- **Risk:** stale "35 icons" claim in README after Phase 3. **Mitigation:** Phase 3 success criterion already covers this.
