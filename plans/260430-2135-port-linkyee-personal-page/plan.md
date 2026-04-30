# Plan: port linkyee idea → iammiti99 personal page

**Source:** ZhgChgLi/linkyee (MIT) — idea/architecture only, no code reuse
**Mode:** xia `--port`
**Stack:** vanilla HTML/CSS/JS output, Node.js build script, GitHub Pages
**Date:** 2026-04-30

## Goal

Single-page link-in-bio site at `iammiti99.github.io` (or custom domain). Config-driven, refreshes daily for live GitHub stats.

## Architecture (one-liner)

```
config.yaml  ──┐
GitHub API ────┼──> build.js (Node 20) ──> _site/index.html ──> upload-pages-artifact ──> deploy-pages
links.yaml  ──┘
```

## Phases

| # | Phase | Status | File |
| --- | --- | --- | --- |
| 1 | Scaffold + config schema | ✅ completed | [phase-01-scaffold-and-config.md](phase-01-scaffold-and-config.md) |
| 2 | Page design (HTML + CSS) | ✅ completed | [phase-02-page-design.md](phase-02-page-design.md) |
| 3 | Build script + GitHub data | ✅ completed | [phase-03-build-and-data.md](phase-03-build-and-data.md) |
| 4 | Deploy pipeline (Actions) | ✅ completed | [phase-04-deploy-pipeline.md](phase-04-deploy-pipeline.md) |

**Smoke test:** `node build.js` succeeded — `_site/index.html` (3.4 KB) renders cleanly with 1 repo resolved (`★ N · Md ago` decoration).
**Deferred:** Font Awesome SRI integrity hash (TODO in `src/template.html` line 47); avatar image and favicons (placeholders).

## Dependencies between phases

- P1 → P2 → P3 → P4 (strict sequential; each phase consumes the previous)
- P3 depends on config schema from P1 and template from P2

## Key dependencies

- Node.js 20+ (built-in `fetch`, no npm deps for build script)
- `js-yaml` (only npm dep — for parsing YAML config); alternative: switch to JSON to keep zero-dep
- GitHub Actions: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`
- Font Awesome 6 CDN

## Source manifest (frozen)

- Repo: ZhgChgLi/linkyee
- Cloned: /tmp/linkyee-src (depth=1, ref unknown — main HEAD as of 2026-04-30)
- License: MIT — no code reuse so attribution = README credit only

## Decision matrix (locked from xia Phase 4)

| # | Decision | Source | Local | Choice |
| --- | --- | --- | --- | --- |
| 1 | Stack | Ruby + Liquid | Vanilla HTML out, Node build | local |
| 2 | Live data | HTML scrape + Liquid vars | GH REST API + JS template | improved |
| 3 | Theme | Default theme reused | Fresh design | local |
| 4 | Icons | Vendored FA | FA via CDN | hybrid |
| 5 | Deploy | Force-push gh-pages | `deploy-pages` artifact | improved |
| 6 | Cron | Daily 00:00 UTC | Daily 00:00 UTC | source |

## Risk score

**Low (0 critical assumptions).** All scope is local-only, reversible, no shared systems.

## Recon report

[plans/reports/xia-260430-2135-linkyee-recon.md](../reports/xia-260430-2135-linkyee-recon.md)

## Success criteria

- Site loads at `iammiti99.github.io` (or configured custom domain)
- Profile (avatar, name, tagline), links list, social icons all populate from a single config file
- Every link with a `repo:` shows live star count and "last updated N days ago"
- Daily cron rebuild succeeds without manual intervention
- Lighthouse: ≥95 in all categories
- Page weight under 100 KB (excluding FA CDN)
