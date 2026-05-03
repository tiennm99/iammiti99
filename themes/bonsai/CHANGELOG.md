# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- (placeholder for v0.3 — layout variants, i18n support)

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
