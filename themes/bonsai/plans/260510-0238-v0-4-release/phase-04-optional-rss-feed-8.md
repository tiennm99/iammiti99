---
phase: 4
title: Optional RSS feed (#8)
status: completed
priority: P3
effort: 45m
dependencies: []
---

# Phase 4: Optional RSS feed (#8)

## Overview

Add `params.rss = true` opt-in. When enabled, the theme stops adding `RSS` to its `disableKinds` recommendation and renders an RSS feed of `[[params.links]]`. Adds `<link rel="alternate" type="application/rss+xml">` to `<head>`.

## Design notes

- Hugo respects user `disableKinds` in their `hugo.toml`. The theme can't force-enable RSS — but it can:
  - Document the param in README
  - Provide an `index.rss.xml` template that runs when the user removes `RSS` from `disableKinds`
  - Add the `<link rel="alternate">` in `head.html` when `params.rss` is true (regardless of `disableKinds` — feed crawler will 404 if user mismatches; that's their config)
- Item shape: `<title>` = link title, `<link>` = link URL, `<description>` = optional description, `<pubDate>` = build time (links lack intrinsic dates).

## Related Code Files

- Create: `layouts/index.rss.xml` — template for the feed
- Modify: `layouts/partials/head.html` — emit `<link rel="alternate">` when `params.rss = true`
- Modify: `README.md` — document the new param + the `disableKinds` removal step

## Implementation Steps

1. Create `layouts/index.rss.xml` rendering an RSS 2.0 feed:
   - `<channel>` populated from `params.name`, `params.tagline`, `params.bio`, site `baseURL`, build `time.Now`
   - `<item>` per `[[params.links]]` entry; `<pubDate>` = build time; `<guid isPermaLink="true">` = link URL
2. In `layouts/partials/head.html`, when `site.Params.rss` is true: `<link rel="alternate" type="application/rss+xml" title="…" href="{{ \`index.xml\` | absURL }}">`. Hugo emits `index.xml` for the home RSS template.
3. README: add `rss` to the params table; add a short "Enable RSS" subsection explaining that user must remove `RSS` from their `disableKinds` line and set `params.rss = true`.
4. Build + curl `/index.xml` — confirm valid RSS 2.0 (well-formed XML, items present); confirm `<head>` of `/` carries the alternate link when `rss = true`.
5. Validate against W3C feed validator if reachable; if not, manually inspect for required elements.
6. Update CHANGELOG (Unreleased).

## Success Criteria

- [ ] `layouts/index.rss.xml` exists and renders well-formed RSS 2.0 when feature on
- [ ] `<head>` carries `<link rel="alternate">` when `params.rss = true`
- [ ] No RSS link emitted when `params.rss` unset/false (default)
- [ ] README documents the new param + `disableKinds` step
- [ ] `hugo --gc --minify` clean
- [ ] PR opened against main

## Risk Assessment

- **Risk:** User leaves `RSS` in `disableKinds` and the alternate link 404s. **Mitigation:** README is explicit; theme cannot override user's `disableKinds`.
- **Risk:** Build-time pubDate makes the feed change every build, polluting feed readers. **Mitigation:** documented as a known limitation; alternative is a per-link `pubDate` field (out of scope).
- **Risk:** Emoji/unicode in `params.tagline` breaks XML. **Mitigation:** Hugo's `transform.XMLEscape` or default escaping in templates handles it.
