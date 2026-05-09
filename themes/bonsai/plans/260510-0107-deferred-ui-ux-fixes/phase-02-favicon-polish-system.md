---
phase: 2
title: Favicon polish system
status: completed
priority: P2
effort: 45m
dependencies:
  - 1
---

# Phase 2: Favicon polish system

## Overview

P4 from the 260510 review. Today the head emits a single `<link rel="icon" href="favicon.ico">`. iOS home-screen, Android, and modern browser tabs miss out on SVG and apple-touch icons. Add two opt-in params and emit conditional `<link>` tags.

## Requirements

- **Functional:** when user sets `params.faviconSvg` and/or `params.appleTouchIcon`, the corresponding `<link>` tags are emitted in `<head>`. Default behavior unchanged (single `favicon.ico`).
- **Non-functional:** zero new dependencies; no new asset shipped in the theme; pure Hugo template change. Backwards compatible — sites without the new params see no diff.

## Architecture

- Hugo template logic only.
- Order: SVG first, then `.ico` (browsers prefer the first they understand), then apple-touch.
- Use `relURL` for path resolution (consistent with existing `favicon` line).

## Related Code Files

- Modify: `layouts/partials/head.html`
- Modify: `README.md` (params table — add two rows)

## Implementation Steps

1. **In `layouts/partials/head.html`** at the line currently emitting `<link rel="icon" ...>` (around line 41), replace with conditional block:
   ```html
   {{- with site.Params.faviconSvg }}
   <link rel="icon" type="image/svg+xml" href="{{ . | strings.TrimPrefix "/" | relURL }}" />
   {{- end }}
   <link rel="icon" href="{{ (site.Params.favicon | default `favicon.ico`) | strings.TrimPrefix "/" | relURL }}" />
   {{- with site.Params.appleTouchIcon }}
   <link rel="apple-touch-icon" href="{{ . | strings.TrimPrefix "/" | relURL }}" />
   {{- end }}
   ```
2. **README params table** (`README.md`, "All parameters" section): add two rows after the `favicon` row:
   - `faviconSvg` — string (URL) — default `—` — "Optional SVG favicon (modern browsers prefer this)."
   - `appleTouchIcon` — string (URL) — default `—` — "180×180 PNG for iOS home-screen / Safari pinned tabs."
3. **README "Quick start" or "Favicons" mini-section** (optional, decide during implementation): one-paragraph "If you want a SVG and apple-touch icon set, drop them in `static/` and reference them via these params." Place under existing "Configuration" section near `favicon`.
4. **No exampleSite changes** — the example site is already minimal and these params are opt-in. Adding them would force-ship two more files.
5. **Build**: render exampleSite with and without the params (hand-edit `exampleSite/hugo.toml` to test, then revert) and confirm rendered HTML emits the right tags.

## Success Criteria

- [ ] `<link rel="icon" type="image/svg+xml">` emitted when `faviconSvg` set
- [ ] `<link rel="apple-touch-icon">` emitted when `appleTouchIcon` set
- [ ] Default behavior unchanged when neither param is set
- [ ] Default behavior unchanged when only legacy `favicon` is set
- [ ] README params table updated; alphabetical/logical order maintained
- [ ] `hugo --gc --minify` completes clean

## Risk Assessment

- **Risk:** SVG favicons render poorly in older browsers and the `.ico` fallback is now second in the source — some legacy browsers may still pick `.ico` (they ignore `type=image/svg+xml`), so behavior is fine. **Mitigation:** order is correct; modern browsers prefer SVG, legacy fall through.
- **Risk:** path normalization differs between `favicon`, `faviconSvg`, `appleTouchIcon`. **Mitigation:** all three use the same `strings.TrimPrefix "/" | relURL` pipeline.
- **Risk:** docs drift — params added in code but README forgotten. **Mitigation:** README change is in this phase's checklist.
