---
phase: 2
title: "OG image params (override + twitter card upgrade)"
status: in-progress
priority: P2
effort: "0.5h"
dependencies: []
notes: "Scope reduced from auto-generation. Auto-gen requires font + base PNG vendoring (~150 KB binary), conflicts with minimalist theme principle. Moved to v0.4 candidates."
---

# Phase 2: OG image params (scope-reduced)

**Reduced from auto-generation.** Reason: build-time text overlay needs Hugo `images.Text` + vendored TTF (~50–120 KB) + 4 base PNGs. That's significant binary weight in a `< 4 KB CSS` theme. Defer auto-gen to v0.4 once a smaller path is found (e.g. system-font CSS-rendered SVG behind a rasterizer).

## What ships in v0.3
- `params.ogImageUrl` — explicit user-provided OG image URL. Takes precedence over `params.avatar`.
- `params.ogImage = false` — opt out entirely (emit no `og:image` / `twitter:image`).
- When any image present, `twitter:card` upgrades from `summary` to `summary_large_image` if user explicitly opted in via `params.ogImageUrl` (since avatar is square, keep `summary` for avatar fallback).

## Overview
Auto-generate a 1200×630 Open Graph preview image from `params.name`, `params.tagline`, and the active palette accent color. Falls back gracefully if user supplies their own `params.avatar` path that resolves to an OG-suitable image — and skippable entirely via `params.ogImage = false`.

## Requirements
- Functional:
  - When `params.ogImage` is unset or `true` AND no `params.ogImageUrl` override: theme generates a 1200×630 PNG via Hugo image processing.
  - Generated image: solid background = palette `bg`; centered name (large) + tagline (smaller) in palette `fg`; small accent stripe on the left in palette `accent`.
  - When `params.ogImageUrl` is set: use that absolute/relative URL verbatim, skip generation.
  - When `params.ogImage = false`: emit no `og:image` and no `twitter:image` (back-compat with v0.2 behavior when no avatar set).
  - Same generated image used for `og:image` AND `twitter:image` (upgrade card to `summary_large_image`).
- Non-functional:
  - Build time impact: < 500ms for default site (one image, one variant).
  - Generated image is content-hashed by Hugo for cache busting.
  - Works without any external binary — pure Hugo image API.

## Architecture
- Hugo lacks native text-on-image rendering. Approach: ship a **template-PNG-per-palette** (4 PNGs, ~5 KB each) in `assets/og/` with the palette background + accent stripe baked in, leaving a transparent / solid text region. Then overlay text via SVG-to-image: render an SVG with name + tagline, convert to image via Hugo's `images.Filter` or external pipeline.
- **Simpler alternative (chosen):** generate the entire OG image as an **SVG**, return it as `og:image` content. Crawlers (Twitter, Facebook, Slack, Discord, LinkedIn) all accept SVG OG images **except Twitter and Facebook** which strip them. So SVG-only is too risky.
- **Final approach:** generate SVG → render to PNG using Hugo's built-in `resources.GetRemote` pattern is no good (no binary). Use Hugo's `images.Text` filter (Hugo 0.108+) which overlays text on an existing image using a TTF font. We ship one base palette PNG per theme (4 PNGs) and one TTF font (~50 KB Inter or system-stack-equivalent open font like Geist Mono — license check required).
- Concrete pipeline:
  1. `assets/og/base-{theme}.png` — 1200×630 solid bg + accent stripe.
  2. `assets/og/font.ttf` — single open-license sans (Inter Regular ~120 KB, or smaller alt).
  3. New partial `partials/og-image.html` — does:
     ```
     {{ $base := resources.Get (printf "og/base-%s.png" $theme) }}
     {{ $img := $base | images.Filter (images.Text $name (dict "color" $fg "size" 72 "x" 80 "y" 220 "font" $font))
                     | images.Filter (images.Text $tagline (dict "color" $fg "size" 36 "x" 80 "y" 340 "font" $font)) }}
     {{ $img := $img | resources.Fingerprint }}
     ```
  4. `head.html` consumes `{{ partial "og-image.html" . }}` to emit `<meta property="og:image">` + `<meta name="twitter:image">` + upgrade `twitter:card` to `summary_large_image`.

## Related Code Files
- Create:
  - `assets/og/base-bonsai.png` (1200×630 — washi paper bg + vermilion stripe)
  - `assets/og/base-sakura.png`
  - `assets/og/base-sumi.png`
  - `assets/og/base-koi.png`
  - `assets/og/font.ttf` (single open-license sans; document source + license in NOTICE)
  - `layouts/partials/og-image.html`
  - `scripts/generate-og-bases.sh` — repeatable ImageMagick script that generates the 4 base PNGs from palette CSS values, so palette tweaks regenerate cleanly.
- Modify:
  - `layouts/partials/head.html` — replace static `og:image` block with `{{ partial "og-image.html" . }}`; upgrade `twitter:card` to `summary_large_image` when image present.
  - `README.md` (in Phase 4) — document `params.ogImage` and `params.ogImageUrl`.
  - `NOTICE` — credit font + base image generation.
- Delete: none.

## Implementation Steps
1. Pick font. Candidates: Inter (OFL), Geist (OFL), IBM Plex Sans (OFL). Smallest weight that reads well at 72px. Document choice in NOTICE.
2. Write `scripts/generate-og-bases.sh` — uses ImageMagick (`magick -size 1200x630 xc:#bg -fill #accent -draw 'rectangle 0,0 16,630'`) to generate all 4 base PNGs.
3. Run script, commit the 4 base PNGs to `assets/og/`.
4. Add font file. Verify license, add NOTICE entry.
5. Write `layouts/partials/og-image.html`:
   - Resolve theme via same `site.Params.colorTheme | default "bonsai"` pattern.
   - Resolve foreground color via a small dict mapping theme → fg hex (matches CSS palette).
   - Skip generation if `site.Params.ogImage == false` → return empty.
   - Skip generation if `site.Params.ogImageUrl` set → emit it verbatim, return.
   - Otherwise: load base PNG, overlay name + tagline via `images.Text`, fingerprint, emit `<meta>` tags.
6. Update `head.html` — call partial, remove old conditional.
7. Add an exampleSite check: build `hugo --themesDir ../..` and verify `public/og-*.png` exists with overlay text.

## Todo List
- [ ] Pick + license-check OG font; add to `assets/og/`; document in NOTICE.
- [ ] Write `scripts/generate-og-bases.sh`; generate all 4 base PNGs; commit.
- [ ] Implement `partials/og-image.html` with skip-on-false + url-override + generation paths.
- [ ] Wire into `head.html`; upgrade twitter:card to `summary_large_image` when image present.
- [ ] Verify generated image renders correctly via `hugo server` → inspect `public/og/*.png`.
- [ ] Verify all 4 palette themes produce distinct, readable images.
- [ ] Test crawler preview via opengraph.xyz or twitter card validator (manual).

## Success Criteria
- [ ] Default config (no `ogImage*` params) generates a palette-matched OG image.
- [ ] `params.ogImageUrl = "/static/my-og.png"` overrides generation, skips Hugo image pipeline.
- [ ] `params.ogImage = false` emits no `og:image` / `twitter:image`.
- [ ] All 4 themes produce visually-distinct, readable images.
- [ ] Build time delta < 500ms for the default exampleSite.
- [ ] Image is content-hashed (filename includes fingerprint).

## Risk Assessment
- **Hugo `images.Text` requires Hugo 0.108+** — `theme.toml` already pins `min_version = "0.128"`; safe.
- **Font file size** — Inter Regular is ~120 KB; acceptable as a one-time vendored asset, but check if a smaller subset (Latin-only) reduces to ~40 KB. Use `pyftsubset` if so.
- **Long names overflow the canvas** — clip text at ~30 chars; document the limit in README.
- **Tagline with markdown** — `images.Text` is plain-text only; strip markdown via `plainify` filter before overlay.
- **Reusing `og:image` for `twitter:image`** — Twitter's `summary_large_image` requires 2:1 ratio; 1200×630 is close enough (1.9:1) and is the de-facto standard.
- **Locale-specific characters** — font must include glyphs for non-Latin names; if user is Vietnamese (per repo author) and font lacks Vietnamese diacritics, image will show tofu. Pick a font with Vietnamese coverage (Inter does).
