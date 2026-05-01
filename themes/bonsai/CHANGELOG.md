# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- (placeholder for v0.2 — layout variants, color presets, schema.org Person markup)

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
