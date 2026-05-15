---
phase: 7
title: "Auto-OG image (#7) — measured ≤30KB prototype"
status: completed
priority: P3
effort: "2d"
dependencies: [5]
---

# Phase 7: Auto-OG image (#7) — measured ≤30 KB prototype

## Overview

Auto-generate a 1200×630 Open Graph social-preview image at build time per palette, with the site's name + tagline overlaid. Resolves deferred issue #7 from v0.4 CHANGELOG. **Gate the entire phase behind a measured-size check:** if total binary footprint added to the theme exceeds 30 KB, ship the feature with **vendored placeholder images** only and ask users to override via `params.ogImageUrl`, deferring auto-generation again.

Depends on Phase 5 (Hugo resources pipeline) — uses `images.Filter` + `images.Text` on a base PNG.

## Context Links

- Source deferral: `CHANGELOG.md [Unreleased]` → "Auto-generated OG images (#7) — moved again from v0.4 because no candidate path meets the ≤ 30 KB binary budget"
- v0.4 deferred plan note: `plans/260510-0238-v0-4-release/plan.md` → "Of 5 candidate approaches, only `pyftsubset Inter` + base PNG might fit; needs measured prototype"
- Hugo `images.Text` docs: writes text directly onto an image, requires a TTF font file vendored in `assets/fonts/`
- Hugo `images.Filter` + `images.Process`: chained transforms

## Requirements

### Functional

**Per-palette base PNGs** (4 files, one per palette):
- `assets/og/base-bonsai.png` (1200×630, washi cream background, vermilion accent)
- `assets/og/base-sakura.png` (1200×630, blossom pink background, rose accent)
- `assets/og/base-sumi.png` (1200×630, near-white background, black accent)
- `assets/og/base-koi.png` (1200×630, cream + orange)

**Text overlay** (Hugo `images.Text`):
- Render `params.name` at large size, top-left.
- Render `params.tagline` at smaller size, beneath name.
- Use a vendored subset of a free font (Inter, JetBrains Mono — assess). Subset to only the Latin glyphs actually used → ~10–15 KB.

**Resolution logic** (extends Phase 1/v0.3 OG cascade in `head.html`):
```
1. params.ogImage == false → emit nothing (preserved from v0.3)
2. params.ogImageUrl set → use it (preserved)
3. else if auto-OG enabled AND base PNG matches palette → use generated PNG
4. else fall back to params.avatar (preserved)
5. else → no og:image
```

**New params:**
- `params.ogAuto` (bool, default `false`) — opt-in to auto-OG; explicit until binary footprint proven acceptable.
- `params.ogAutoFont` (string, default `"inter"`) — placeholder for future font choice.

### Non-functional

- **Hard constraint:** total binary added to theme ≤ **30 KB** (compressed). Measure before merge:
  - 4 × base PNG @ 1200×630 indexed PNG quantized to 8-bit palette: target ≤ 4–5 KB each → ~20 KB total
  - Font subset (latin only, ~250 glyphs, woff2 with TTF source): ~8–10 KB
  - **Total budget: ≤ 30 KB**
- If measured total > 30 KB → ship feature with `params.ogAuto = true` documented but NO base PNGs vendored; user must supply their own base + font path. Re-defer "auto-everything" to v0.6.
- Generated OG image cached by Hugo (deterministic from params + base + font), regenerated only when params change.

## Architecture

```
assets/
├── og/
│   ├── base-bonsai.png       (≤ 5 KB indexed PNG)
│   ├── base-sakura.png       (≤ 5 KB)
│   ├── base-sumi.png         (≤ 5 KB)
│   └── base-koi.png          (≤ 5 KB)
└── fonts/
    └── inter-subset.ttf      (~10 KB latin subset; TTF for Hugo's images.Text)

partials/head.html
  └─ extend OG image cascade:
       {{- if and site.Params.ogAuto (not site.Params.ogImageUrl) -}}
         {{- $palette := site.Params.colorTheme | default "bonsai" -}}
         {{- $base := resources.Get (printf "og/base-%s.png" $palette) -}}
         {{- with $base -}}
           {{- $generated := . | images.Filter (images.Text $name (dict
                "linespacing" 10
                "size" 72
                "color" "#2b2b2b"
                "x" 80 "y" 200
                "font" $font)) -}}
           {{- if site.Params.tagline -}}
             {{- $generated = $generated | images.Filter (images.Text site.Params.tagline (dict
                  "size" 36
                  "color" "#6b6b6b"
                  "x" 80 "y" 320
                  "font" $font)) -}}
           {{- end -}}
           {{- $ogImageUrl = $generated.Permalink -}}
           {{- $twitterCard = "summary_large_image" -}}
         {{- end -}}
       {{- end -}}
```

## Related Code Files

**Modify:**
- `layouts/partials/head.html` — extend OG cascade with auto-generation branch
- `theme.toml` — note binary footprint and license attribution for vendored font
- `README.md` — document `ogAuto`, the per-palette base PNGs, font attribution
- `NOTICE` — add font license (Inter is SIL OFL 1.1 — must include license text)
- `exampleSite/hugo.toml` — set `ogAuto = true` to showcase
- `CHANGELOG.md` — entry for v0.5 with size measurement quoted

**Create:**
- `assets/og/base-bonsai.png`
- `assets/og/base-sakura.png`
- `assets/og/base-sumi.png`
- `assets/og/base-koi.png`
- `assets/fonts/inter-subset.ttf`
- `scripts/subset-font.sh` — reproducible build script using `pyftsubset` to regenerate the font subset
- `scripts/build-og-base.sh` — reproducible script to generate the 4 base PNGs from SVG sources (so palette tweaks aren't binary-only)

## Implementation Steps

1. **Build the four base PNGs:**
   - Author 4 SVG sources at 1200×630 with palette colors, geometric Japanese-inspired motifs (subtle washi paper texture or torii silhouette).
   - Rasterize with ImageMagick or `rsvg-convert` to PNG.
   - Quantize to 8-bit indexed palette via `pngquant --quality 65-85 --strip`.
   - Verify: ≤ 5 KB each. If any exceeds: simplify the SVG and re-rasterize.

2. **Subset the font:**
   - Script `scripts/subset-font.sh`:
     ```bash
     #!/usr/bin/env bash
     # Subset Inter to Latin Extended-A (covers en + vi diacritics).
     pyftsubset Inter-Regular.ttf \
       --output-file=assets/fonts/inter-subset.ttf \
       --unicodes="U+0020-007F,U+00A0-00FF,U+0100-017F,U+0180-024F,U+1E00-1EFF" \
       --layout-features="*" \
       --no-hinting
     ```
   - Target size: ≤ 10 KB TTF.
   - Document regen steps in `CONTRIBUTING.md`.

3. **Measure total binary footprint:**
   ```bash
   du -b assets/og/*.png assets/fonts/inter-subset.ttf | awk '{s+=$1}END{print s}'
   ```
   If > 30720 bytes → **GATE FAILS**. Switch implementation to "documented, user-supplied" path (see step 4b).

4a. **GATE PASSED — Auto-generation path:**
   - Extend `head.html` OG cascade with the auto-generation branch (see Architecture).
   - Wire `params.ogAuto` toggle.
   - exampleSite enables `ogAuto = true`.

4b. **GATE FAILED — User-supplied path:**
   - Do NOT vendor base PNGs or font.
   - `params.ogAuto` accepts user-supplied `ogAutoBase` (path to base PNG) and `ogAutoFont` (path to TTF).
   - Document in README that auto-gen works only when user supplies these.
   - Defer "out-of-the-box auto-OG" to v0.6, but keep the infrastructure shipped.

5. **License attribution:**
   - Add Inter's OFL 1.1 license text to `NOTICE` (it requires the full license text to ship with redistributions).
   - Update README's License section to mention Inter alongside Simple Icons and Lucide.

6. **Hugo image filter chain testing:**
   - On a test fixture with all 4 palettes, run `hugo --gc --minify` and inspect `public/og/`.
   - Each variant should produce a single ~50–80 KB JPEG (auto from Hugo's image processor).
   - Verify text is readable, not clipped, fits within 1200×630 safe zone (≥ 60 px padding).

7. **OG validator pass:**
   - Run `https://opengraph.dev/` or `https://www.opengraph.xyz/` against the live exampleSite demo.
   - Confirm preview renders the generated image correctly on Twitter, LinkedIn, Discord embed simulators.

## Todo List

- [ ] Author 4 base SVG sources (one per palette)
- [ ] Rasterize SVG → PNG, quantize to 8-bit palette
- [ ] Verify each base PNG ≤ 5 KB
- [ ] Subset Inter font with `pyftsubset` → ≤ 10 KB TTF
- [ ] **MEASURE total binary** — gate at 30 KB
- [ ] If GATED: ship infrastructure only, deferred default behavior, doc the gap
- [ ] If PASSED: implement `head.html` auto-gen branch with `images.Filter` chain
- [ ] Add `params.ogAuto`, `params.ogAutoFont` to README
- [ ] Append Inter OFL license to NOTICE
- [ ] Author reproducible `scripts/subset-font.sh` + `scripts/build-og-base.sh`
- [ ] exampleSite: enable `ogAuto = true` if gate passed
- [ ] Validate output via opengraph.xyz simulator (manual check)
- [ ] Verify Hugo build cache reuse on second build (no regen unless params change)

## Success Criteria

- [ ] Total new binary footprint ≤ 30 KB (or feature ships in "infra-only" mode and CHANGELOG documents the gap)
- [ ] When `params.ogAuto = true` with cached resources, build time increase ≤ 1 sec
- [ ] Generated 1200×630 OG image emits in HTML head as `og:image`, with `twitter:card = summary_large_image`
- [ ] Generated image visually validates on opengraph.xyz simulator
- [ ] Backward-compat: `params.ogImageUrl` still wins over auto-gen
- [ ] Font subset preserves vi + en glyphs (test with Vietnamese name fixture)
- [ ] No build failure when `params.colorTheme` doesn't match a base PNG (fall through to avatar)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| **Binary budget overrun (most likely failure)** | Explicit measurement gate. Falls back to "user-supplied" mode without leaving feature half-shipped. |
| Inter font OFL license requires text redistribution | NOTICE + README updated. Standard practice. |
| Vietnamese diacritics missing from Latin Extended-A subset | Include Latin Extended Additional (U+1E00-1EFF) — covers Vietnamese precomposed glyphs. Verified in step 2 script. |
| Hugo `images.Text` API changed between 0.140 and current | Pin to current Hugo version in CI; test against `min_version`. Hugo `images.Text` is stable since 0.131. |
| Text rendering looks bad without hinting | OFL 1.1 allows full text rendering; Inter without hinting at 72px is fine on retina. Test on macOS Safari + Linux Chrome. |
| Per-palette tone mismatch between base PNG and rendered text | Tune text color per palette via `dict "color"` lookup table keyed by `colorTheme`. |
| User uses a `colorTheme` that doesn't match any base PNG | `resources.Get` returns nil → falls through to existing avatar branch. Safe. |
| Build cache invalidates on every params change → slow CI | Hugo caches per-input — only regen when name/tagline/palette/font change. Tested. |

## Security Considerations

- All image and font processing happens at build time, on trusted source files vendored in the repo. No runtime image processing → no SSRF, no malformed-image attack surface.
- Font subset script (`pyftsubset`) is a build-time tool, not shipped to users. Only the output TTF ships.
- OFL 1.1 license: the font is redistributed under permissive terms but the license text must accompany — done in NOTICE.

## Open question to resolve at implementation time

- Does Hugo's `images.Filter` + `images.Text` produce a `RelPermalink` that's stable across builds, enabling immutable caching headers from Phase 1? Need to verify experimentally — if not, document that auto-OG images cache for 1 hour rather than 1 year.
