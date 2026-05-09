---
phase: 4
title: Docs sync + build verification
status: completed
priority: P3
effort: 30m
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Docs sync + build verification

## Overview

After phases 1–3 ship, sync `CHANGELOG.md`, `docs/` (if relevant), and verify the full theme renders cleanly across all 4 palettes × light/dark × 3 layouts via `hugo --gc --minify` and curl-of-rendered-HTML inspection (no headless browser available on host).

## Requirements

- **Functional:** CHANGELOG records the shipped items in v0.4 (or `Unreleased` section if v0.4 not yet cut). `docs/` reflects new params if they exist there. README hex table aligned with new accents (already in Phase 1, but re-verify).
- **Non-functional:** no spurious files committed; minified CSS still well under 3 KB gzipped budget; rendered HTML across all gallery pages matches expected markup.

## Architecture

- Pure docs + verification work. No code edits.

## Related Code Files

- Modify: `CHANGELOG.md`
- Modify: `docs/` (only if existing files reference any of the changed surfaces — check first)
- Read: rendered HTML at `/`, `/themes/`, `/variants/`, `/icons/` via `curl`

## Implementation Steps

1. **Inventory docs**: `ls docs/` and grep for any mention of `data-theme`, `favicon`, `theme-toggle`, accent hex codes. Update only files with stale references.
2. **CHANGELOG entry**: under `Unreleased` (or new `## v0.4` section if cutting), add bullets:
   - **A11y**: sakura/koi accent contrast bumped to AA (`#d4456a→#c93f63`, `#c8521e→#bd4c1c`)
   - **A11y**: gallery pages wrapped in `<section aria-labelledby>`; heading hierarchy fixed
   - **Polish**: `.link:hover` adds subtle accent tint
   - **Polish**: opt-in `params.faviconSvg` and `params.appleTouchIcon`
   - **Polish**: theme toggle hidden when JS disabled (`<noscript>`)
   - **Polish**: i18n fallback hardened in theme-toggle button
   - **Internal**: dropped non-standard `data-theme="auto"` from `<html>` (CSS already worked without it)
3. **Build clean**: `cd exampleSite && hugo --gc --minify --themesDir ../..`. Inspect `public/css/bonsai.css` size (should be < 13 KB raw); confirm no warnings.
4. **Render-and-curl pass**: start `hugo server -s exampleSite --themesDir ../.. --port 1313 --bind 0.0.0.0` (background), curl `/`, `/themes/`, `/variants/`, `/icons/`. Verify:
   - `/themes/` HTML contains `<section ... aria-labelledby="themes-heading">` and the new accent hex codes in inline style or class
   - `/variants/` HTML contains `<section ... aria-labelledby="variants-heading">`
   - `/` HTML — `<html>` tag does NOT contain `data-theme="auto"`
   - When `themeToggle = true` (toggle exampleSite hugo.toml temporarily): `<head>` contains `<noscript><style>.theme-toggle{display:none!important}</style></noscript>` and the inline FOUC script + deferred toggle script
5. **Contrast re-check** (Python script or by hand): sakura-light accent on bg `#fff5f7` ≥ 4.5; koi-light accent on bg `#fef6e4` ≥ 4.5.
6. **Stop hugo server**, kill background process.
7. **Stage changes** with `git add -p` (so each hunk is reviewed). Show user the diff and **ask before commit/push** — do not auto-commit.

## Success Criteria

- [ ] `CHANGELOG.md` updated with all 7 bullets
- [ ] `hugo --gc --minify` completes clean (no warnings)
- [ ] CSS gzipped size still under 3 KB
- [ ] Rendered HTML at `/themes/`, `/variants/` carries `<section aria-labelledby>`
- [ ] `<html>` tag does not include `data-theme="auto"`
- [ ] Theme-toggle `<noscript>` style present in head when feature enabled
- [ ] All 4 palettes × light/dark accent contrast ≥ 4.5:1 on bg (sakura + koi rechecked)
- [ ] User-approved commit/PR (do not auto-push)

## Risk Assessment

- **Risk:** docs drift after merge — phases 1–3 changed files but `docs/` not updated. **Mitigation:** explicit step 1 above grep-checks docs/ for stale references.
- **Risk:** CSS budget creep from Phase 1 hover bg + new selectors. **Mitigation:** measure raw size after build; if > +200 B rollback the hover background-mix and just leave transform/border-color.
- **Risk:** auto-commit too eager. **Mitigation:** explicit "ask before commit" in step 7. Ship pipeline only on user approval.
