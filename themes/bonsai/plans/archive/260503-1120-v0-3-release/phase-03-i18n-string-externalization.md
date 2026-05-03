---
phase: 3
title: "i18n string externalization"
status: pending
priority: P2
effort: "1.5h"
dependencies: []
---

# Phase 3: i18n string externalization

## Overview
Move every hardcoded English string in templates to Hugo i18n bundles so non-English sites work end-to-end. Ship `en` (default) + `vi` (smoke test for the maintainer's locale + non-Latin diacritics).

## Requirements
- Functional:
  - All theme-rendered strings sourced from `i18n/{lang}.toml` via `{{ i18n "key" }}`.
  - Site `languageCode` (e.g. `vi-VN`) resolves to the matching bundle; falls back to `en` for missing keys.
  - User-supplied strings (`params.name`, `params.tagline`, `params.bio`, link `title`s, `params.footerText`) remain untouched — those are user content, not theme strings.
- Non-functional:
  - Adding a new language requires one new `.toml` file, no template edits.
  - Existing English-only sites see no behavior change (en is the default).

## Architecture
- Audit current hardcoded strings in templates:
  - `bio-card.html`: `aria-label="Links"` (nav landmark).
  - `theme-toggle-button.html`: button label / aria-label / title (likely "Toggle theme").
  - `footer.html`: default `© {year} {name}` template (the format itself is i18n-able; `name` stays a param).
  - `og-image.html` (new in Phase 2): no user-visible strings; skip.
  - `head.html`: no user-visible strings.
- Create `i18n/en.toml` with all extracted keys.
- Create `i18n/vi.toml` mirroring `en.toml` with Vietnamese translations (smoke-test diacritics + Hugo's locale resolution).
- Replace inline strings with `{{ i18n "key" }}` calls.

## Related Code Files
- Create:
  - `i18n/en.toml`
  - `i18n/vi.toml`
- Modify:
  - `layouts/partials/bio-card.html` — replace `aria-label="Links"` with `aria-label="{{ i18n "nav_links_label" }}"`.
  - `layouts/partials/theme-toggle-button.html` — replace English strings with i18n calls.
  - `layouts/partials/footer.html` — i18n the default footer template (when `params.footerText` is unset).
  - `exampleSite/hugo.toml` — keep `languageCode = "en-us"`; add a commented example for `vi-VN`.
- Delete: none.

## Implementation Steps
1. Read `theme-toggle-button.html` + `footer.html` to enumerate every English literal.
2. Create `i18n/en.toml` with proposed keys:
   - `nav_links_label = "Links"`
   - `theme_toggle_label = "Toggle theme"`
   - `theme_toggle_to_dark = "Switch to dark theme"`
   - `theme_toggle_to_light = "Switch to light theme"`
   - `footer_default = "© {{ .year }} {{ .name }}"` — Hugo i18n supports template params via the `dict` 2nd arg.
3. Create `i18n/vi.toml` with translated values (e.g. `nav_links_label = "Liên kết"`, `theme_toggle_label = "Đổi giao diện"`).
4. Replace template literals with `{{ i18n "key" }}` (or `{{ i18n "key" $ctx }}` where params needed).
5. Test: build exampleSite with `languageCode = "en-us"` → strings unchanged. Switch to `languageCode = "vi-VN"` → Vietnamese strings appear.
6. Hugo missing-translation behavior: by default Hugo emits `[i18n] translation not found for key 'X'` — verify no warnings during `en` build.

## Todo List
- [ ] Audit all hardcoded English strings in `layouts/partials/`.
- [ ] Draft full key list; review for granularity (e.g., separate to_dark / to_light vs single Toggle).
- [ ] Write `i18n/en.toml`.
- [ ] Write `i18n/vi.toml` (Vietnamese translations).
- [ ] Replace all literals in templates with `{{ i18n }}` calls.
- [ ] Build exampleSite with `en-us` — verify no missing-translation warnings.
- [ ] Build exampleSite with `vi-VN` — verify Vietnamese strings render, including footer template-with-params case.
- [ ] Verify diacritics render correctly in HTML.

## Success Criteria
- [ ] No English literals remain in `layouts/partials/*.html` (excluding HTML attribute names + user-content placeholders).
- [ ] `i18n/en.toml` and `i18n/vi.toml` ship with the theme.
- [ ] Switching `languageCode` in `hugo.toml` flips all theme strings, no template edits needed.
- [ ] Adding a new language is a single-file change.

## Risk Assessment
- **Hugo i18n with template params** — `footer_default` uses `{{ .year }}`. Hugo's i18n template params require the right `dict` invocation; verify with the official docs (gohugo.io/content-management/multilingual/#translate-strings-in-templates) before committing.
- **vi.toml as smoke test** — if maintainer doesn't speak the target language, machine translation is OK for the smoke test as long as it's labeled. For Vietnamese, the maintainer is a native speaker so this is safe.
- **Theme-toggle button has dynamic state** — `to_dark` vs `to_light` switch on current theme. JS-based, so the i18n strings need to be readable by `theme-toggle.js` — pass them as `data-` attributes on the button, not as JS string literals.
- **Pluralization not needed** — none of the current strings have count-based variants. Defer Hugo's plural i18n until a real need arises.
