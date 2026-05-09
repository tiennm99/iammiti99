# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Deferred to v0.5
- **Auto-generated OG images** (#7) — moved again from v0.4 because no candidate path meets the ≤ 30 KB binary budget. Needs measured prototype before committing.
- **Multi-section bio** (#9) — schema design call deferred per the issue's own "2026-Q3 candidate" recommendation.

## [0.4.0] — 2026-05-10

A11y, polish, and ergonomics release. All additions are strictly opt-in or transparent; v0.3 sites upgrade with no config edits. Closes #8, #10, #11; defers #7 + #9 to v0.5.

### Added
- **Favicon polish** — opt-in `params.faviconSvg` and `params.appleTouchIcon` for SVG and iOS home-screen icons. Default behavior unchanged when unset.
- **Demo-only gallery CSS** — `/themes/` and `/variants/` pages load a separate `static/css/gallery.css`; `static/css/bonsai.css` no longer ships gallery selectors to user sites. Saves ~1.9 KB raw / ~200 B gzipped on every real site. New `head_extra` block in `baseof.html` enables per-page stylesheet additions.
- **10 new icons** — set grows from 35 to 45. Brand additions: `bandcamp`, `soundcloud`, `spotify`, `figma`, `dribbble`, `stackoverflow`, `matrix`. Utility additions: `bookopen`, `download`, `heart`. Vendored from Simple Icons v13 (CC0) and Lucide v0.460 (ISC) at the same versions; soft ceiling for v0-line is ~50.
- **Optional RSS feed** — opt-in `params.rss = true` renders an RSS 2.0 feed of `[[params.links]]` at `/index.xml` and emits `<link rel="alternate">` in `<head>`. Requires removing `RSS` from `disableKinds`. `pubDate` = build time. Off by default; existing sites unaffected.

### Changed
- **A11y** — sakura accent darkened `#d4456a → #c93f63` (4.04 → 4.49 vs bg) and koi accent darkened `#c8521e → #bd4c1c` (4.17 → 4.63 vs bg) to reach WCAG AA on the gallery accent chip. Brand intent preserved (cherry blossom pink / koi orange). README hex table synced.
- **A11y** — `/themes/` and `/variants/` gallery wrappers are `<section aria-labelledby>` keyed to the page `<h1>`. Variant cards demoted from `<section>` to `<article>` to avoid double-region nesting.
- **Polish** — `.link:hover` adds a subtle accent tint via `color-mix(in oklab, …)` alongside the existing border + 1px lift. Strengthens hover affordance without breaking the restrained look.
- **Polish** — theme toggle hidden via `<noscript>` when JavaScript is disabled (button is JS-only; previously rendered but did nothing).
- **i18n** — theme-toggle `aria-label` and `title` now use `with`/`else` fallback so a missing translation key in a custom language never leaks the raw key into the DOM.

### Removed
- Non-standard `data-theme="auto"` attribute from `<html>`. The CSS only ever queried `light` / `dark` via `:not([data-theme="..."])`; `auto` was a no-op. Inline FOUC script (v0.3) sets the attribute on first paint when the user has chosen, so behavior is unchanged.

### Deferred to v0.5
- Auto-generated OG images (#7).
- Multi-section bio (#9).

## [0.3.0] — 2026-05-03

Layout, social-preview, and i18n release. All additions are strictly opt-in; v0.2 sites upgrade with no config edits.

### Added
- **Layout variants** — `params.layout` accepts `stack` (default), `grid` (responsive 2-col), or `inline` (icon-only horizontal row). Pure CSS, zero JS. Unknown values warn at build time and fall back to `stack`. Live gallery at `/variants/`.
- **OG image controls** — `params.ogImageUrl` for an explicit 1200×630 social-preview image (auto-upgrades `twitter:card` to `summary_large_image`); `params.ogImage = false` to suppress all `og:image` / `twitter:image` tags. Avatar still serves as the fallback when neither is set.
- **i18n string externalization** — every theme-rendered string (`nav` aria-label, theme-toggle labels, default footer template) sourced from `i18n/{lang}.toml`. Bundles for `en` (default) and `vi` ship with the theme. Adding a language is a single-file change.

### Changed
- `layouts/partials/bio-card.html` validates `params.layout` against the allowlist and emits `bio__links bio__links--{layout}` so variant rules scope under a parent class (avoids the v0.2-style specificity collision).
- `layouts/partials/head.html` resolves OG image via the new `ogImage`/`ogImageUrl` ladder; emits `twitter:image` whenever `og:image` is present.
- `layouts/partials/footer.html` uses `i18n "footer_default"` when no `params.footerText` override is set.
- `exampleSite/hugo.toml` switches the demo to `layout = "grid"` to make the new feature visible on the live site.

### Deferred
- Auto-generated OG images (text overlay on per-palette base PNGs). Required vendoring a TTF + 4 base PNGs (~150 KB binary) into a theme that prides itself on `< 4 KB CSS`. Moved to v0.4 once a smaller path is found.

## [0.2.0] — 2026-05-03

Polish & SEO release. All additions are strictly opt-in; v0.1 sites upgrade with no config edits.

### Added
- **Color theme presets** — four named palettes (`bonsai` default, `sakura`, `sumi`, `koi`); select via new `params.colorTheme`. Each has light + dark variants. Gallery at `/themes/`.
- **schema.org Person markup** — JSON-LD `ProfilePage > Person` injected in `<head>`. Built from existing params + optional `params.jobTitle`, `params.location`, `params.email`. Suppressible via `params.schema = false`. `mailto:` and `tel:` links excluded from `sameAs`.
- **Theme toggle UI button** — sun/moon button rendered in footer when `params.themeToggle = true`. Sun shown in dark mode, moon in light (button shows target). `aria-pressed` reflects state. Existing localStorage persistence preserved.
- **Avatar initials fallback** — when `params.avatar` is unset, theme renders an inline SVG circle with auto-derived initials (first letter of up to 2 words from `params.name`). Override with `params.avatarInitials`. Background overrideable via `params.avatarBg`.

### Changed
- `static/css/bonsai.css` restructured — color vars now scoped per `[data-bonsai-theme]`; layout vars (radius/gap/pad/fonts) stay in `:root`.
- `layouts/_default/baseof.html` emits `data-bonsai-theme` attribute on `<html>`.
- `layouts/partials/bio-card.html` delegates avatar rendering to new `partials/avatar.html`.
- `static/js/theme-toggle.js` syncs `aria-pressed` on first paint and on click.
- `exampleSite/hugo.toml` switches demo to `colorTheme = "sakura"` to showcase a non-default palette.

## [0.1.0] — 2026-05-01

First production-ready release. Live demo at <https://tiennm99.github.io/bonsai/>.

### Added
- 35 icons out of the box: 25 brand (Simple Icons CC0) + 10 utility (Lucide ISC), vendored at build time
- `data/icons.yaml` manifest mapping public icon names → vendored SVG paths
- Data-driven `partials/icon.html` (13 lines) replacing the hand-curated `if/else if` chain
- `scripts/sync-icons.sh` — idempotent vendoring script, version-pinned to `simple-icons@13` + `lucide-static@0.460`
- Icon gallery page at `/icons/` (rendered from `exampleSite/content/icons/`)
- GitHub Actions `build` workflow — `hugo --gc --minify` on every PR and `main` push
- GitHub Actions `deploy` workflow — auto-deploys `exampleSite/` to GitHub Pages on `main`
- Dependabot config for weekly action updates
- `CONTRIBUTING.md` covering dev setup, icon-add workflow, PR guidelines
- `NOTICE` file crediting third-party icon sources

### Changed
- README rewritten with badges, live-demo link, configuration table, all-parameters reference
- `exampleSite/hugo.toml` adds Mastodon and Bluesky example links
- `theme.toml` `demosite` field points at the live GitHub Pages URL

## [0.0.1] — 2026-05-01

### Added
- Initial scaffold: theme structure, baseof/index/partial layouts, washi-paper light + sumi-ink dark CSS, 8 hand-curated inline SVG icons (github, globe, mail, twitter, linkedin, youtube, instagram, rss), exampleSite, Apache-2.0 LICENSE
