---
phase: 3
title: Semantic + i18n + data-theme cleanup
status: completed
priority: P3
effort: 30m
dependencies: []
---

# Phase 3: Semantic + i18n + data-theme cleanup

## Overview

P5 + P6 + P7 + Q4 from the 260510 review. Three small structural cleanups + one progressive-enhancement guard for the theme toggle.

- **P5** Wrap gallery cards in `<section aria-labelledby>` so cards are landmark-children of the page heading, not loose siblings of an `<article>`.
- **P6** Make i18n fallback in `theme-toggle-button.html` survive a stale/missing translation file.
- **P7** Drop non-standard `data-theme="auto"` from `baseof.html`. The CSS only checks for `data-theme="light"` / `="dark"`; `auto` was meaningless.
- **Q4** Add `<noscript>` rule to hide `.theme-toggle` when JS is disabled (button is JS-only; with no JS it would render but do nothing).

## Requirements

- **Functional:** screen-reader landmark walk on `/themes/` and `/variants/` reads "main → article (intro) → section (palette/variant)" instead of orphaned cards. i18n key resolves to a real string in any language. Page works the same with or without `data-theme` attribute on `<html>` (CSS already defaults right). Theme toggle button hidden when JS off.
- **Non-functional:** no behavioral regression for existing keyboard / screen-reader users; no visible layout change to gallery pages; no extra params introduced.

## Architecture

- All template-level edits.
- For P6, use Hugo's two-arg `i18n` form: `i18n "key" .` with explicit language fallback string when missing — or use `T` helper. Hugo's `i18n` function emits the key name when the key is missing in the current language, and `default` filter doesn't catch it (key string is non-empty). Fix is to use `T` shorthand with a fallback chain or to ensure the i18n bundle has the key in every shipped language.
  - Cleanest: keep `i18n "..."` but also load both `en` and `vi` in this file (already done). The actual fragility is for a *user* who creates a third language without translating these keys. Defensive pattern: `{{ with i18n "..." }}{{ . }}{{ else }}fallback{{ end }}`.
- For Q4, the cleanest CSS-only guard is `<noscript><style>.theme-toggle{display:none}</style></noscript>` injected only when `themeToggle = true`.

## Related Code Files

- Modify: `layouts/_default/baseof.html` (P7)
- Modify: `layouts/themes/single.html` (P5)
- Modify: `layouts/variants/single.html` (P5)
- Modify: `layouts/partials/theme-toggle-button.html` (P6)
- Modify: `layouts/partials/head.html` (Q4 — noscript hide rule)

## Implementation Steps

1. **P7 — baseof.html**: change `<html lang="..." data-theme="auto" data-bonsai-theme="...">` → `<html lang="..." data-bonsai-theme="...">`. The inline FOUC script (head.html:46) sets `data-theme` from localStorage when applicable, so the attribute is added on first paint when the user has explicitly chosen. With no choice, no attribute → CSS `:not([data-theme="light"])` selectors still match, so `prefers-color-scheme` rules apply. Verify the CSS audit at `bonsai.css:69`, `:89`, `:109`, `:129`.
2. **P5 — themes/single.html**: wrap intro `<article>` content in a stable id, then change `<div class="themes-gallery">` to `<section class="themes-gallery" aria-labelledby="themes-heading">`. Add `id="themes-heading"` to the `<h1>`. Each card stays `<div>` (cards are not landmarks themselves; the section is the landmark).
3. **P5 — variants/single.html**: same pattern. `<h1 id="variants-heading">` and `<section class="variants-gallery" aria-labelledby="variants-heading">`. Each card already uses `<section class="variants-gallery__card">` — fine to leave nested sections (the outer one provides the landmark, inner ones are sub-regions; can also be downgraded to `<article>` if double-section ARIA noise is a concern, but Hugo's existing `<section>` per card is intentional per CSS class).
4. **P6 — theme-toggle-button.html**: change
   ```
   aria-label="{{ i18n "theme_toggle_label" | default "Toggle light and dark theme" }}"
   ```
   to
   ```
   aria-label="{{ with i18n "theme_toggle_label" }}{{ . }}{{ else }}Toggle light and dark theme{{ end }}"
   ```
   Same pattern for `title` attribute. The `with`/`else` form treats the key-as-string-when-missing as a non-empty string... so actually the cleanest fix is to confirm Hugo's behavior: per Hugo docs `i18n` returns empty string when key missing AND no fallback configured. Use the **two-argument form** `{{ i18n "theme_toggle_label" "Toggle light and dark theme" }}` — Hugo treats the second arg as fallback. Verify with `hugo version` ≥ 0.128 (matches theme.toml min version).
5. **Q4 — head.html**: in the existing `{{- if site.Params.themeToggle }}` block (around line 43), add before the `<script>` tag:
   ```html
   <noscript><style>.theme-toggle{display:none!important}</style></noscript>
   ```
   This is rendered into `<head>` only when the theme toggle feature is on, so no cost when disabled.
6. **Manual verification:** keyboard tab through `/themes/` and `/variants/` — focus order unchanged. Screen-reader landmark list now shows "section: Color themes" / "section: Layout variants" instead of nothing.
7. **Test toggle without JS:** disable JS in browser devtools, reload, confirm `.theme-toggle` is hidden (or render server-side with `themeToggle = true` and curl the rendered head to confirm noscript style is present).
8. **Build**: `hugo --gc --minify` clean.

## Success Criteria

- [ ] `/themes/` has `<section aria-labelledby="themes-heading">` wrapping the gallery
- [ ] `/variants/` has `<section aria-labelledby="variants-heading">` wrapping the gallery
- [ ] `<html>` no longer carries `data-theme="auto"` initial attribute; CSS still renders correctly in all 4 palettes × light/dark × auto-via-prefers-color-scheme
- [ ] theme-toggle aria-label/title use Hugo two-arg `i18n` fallback
- [ ] `.theme-toggle` hidden via `<noscript>` style when feature enabled
- [ ] keyboard tab order on gallery pages unchanged
- [ ] `hugo --gc --minify` completes clean

## Risk Assessment

- **Risk:** removing `data-theme="auto"` breaks a hypothetical user CSS that selects `[data-theme="auto"]`. **Mitigation:** the attribute was undocumented; a search of the codebase shows no CSS or JS references it. Document the removal in CHANGELOG.
- **Risk:** Hugo `i18n` two-arg form was added in 0.41 but the fallback semantics differ across versions. **Mitigation:** confirm against `hugo version` and theme.toml's stated minimum (`>= 0.128`).
- **Risk:** nested `<section>` (gallery section + per-card section in variants) creates ARIA double-region noise. **Mitigation:** acceptable per WCAG; alternative is to demote per-card sections to `<article>` — defer unless review pushes.
- **Risk:** `<noscript>` style with `!important` overrides theme — but since `.theme-toggle` is the only target, scope is narrow.
