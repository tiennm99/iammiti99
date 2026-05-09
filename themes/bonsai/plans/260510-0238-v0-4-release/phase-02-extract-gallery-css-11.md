---
phase: 2
title: Extract gallery CSS (#11)
status: completed
priority: P2
effort: 30m
dependencies: []
---

# Phase 2: Extract gallery CSS (#11)

## Overview

Move `.themes-gallery__*` + `.variants-gallery__*` selectors out of `static/css/bonsai.css` into a new `static/css/gallery.css` referenced only by the demo pages. End-user sites stop paying for ~300 gzipped bytes of CSS they never use.

## Related Code Files

- Modify: `static/css/bonsai.css` — remove gallery rules
- Create: `static/css/gallery.css` — new file with the extracted rules
- Modify: `layouts/themes/single.html` — load gallery.css for this page only
- Modify: `layouts/variants/single.html` — load gallery.css for this page only
- Modify: `layouts/_default/baseof.html` (if needed) — add `head_extra` block hook

## Implementation Steps

1. Identify and excise gallery selectors from `static/css/bonsai.css`. Selectors: `.themes-gallery`, `.themes-gallery__card`, `.themes-gallery__name`, `.themes-gallery__hex`, `.themes-gallery__chip`, `.themes-gallery__chip--accent`, `.variants-gallery`, `.variants-gallery__card`, `.variants-gallery__name`, `.variants-gallery__desc`, `.variants-gallery__code`. Plus any responsive `@media` rules that target only those selectors.
2. Create `static/css/gallery.css` with the excised rules.
3. Add a `{{- block "head_extra" . -}}{{- end }}` hook in `layouts/_default/baseof.html` `<head>` (after the main stylesheet link).
4. In `layouts/themes/single.html` and `layouts/variants/single.html`, define the block: `{{ define "head_extra" }}<link rel="stylesheet" href="{{ \`css/gallery.css\` | relURL }}">{{ end }}`.
5. Verify `/icons/` page does NOT pull in `gallery.css` (it has no `head_extra` block).
6. Build + curl: confirm `/themes/` and `/variants/` pull both stylesheets; `/` and `/icons/` pull only `bonsai.css`.
7. Measure: `bonsai.css` raw + gzipped should drop ~1,200 raw / ~300 gzipped.
8. Update CHANGELOG (Unreleased) and README's CSS budget claim if it shifts back under 3 KB.

## Success Criteria

- [ ] `static/css/bonsai.css` no longer contains gallery selectors
- [ ] `static/css/gallery.css` exists and renders gallery markup correctly
- [ ] `/themes/` and `/variants/` load both stylesheets
- [ ] `/` and `/icons/` load only `bonsai.css`
- [ ] `bonsai.css` gzipped < 3 KB
- [ ] `hugo --gc --minify` clean
- [ ] PR opened against main

## Risk Assessment

- **Risk:** `head_extra` block name conflicts with future Hugo theme usage. **Mitigation:** name is theme-local, undocumented externally; safe.
- **Risk:** missed responsive rules during excision. **Mitigation:** grep `gallery` in CSS before commit; only matches in gallery.css.
