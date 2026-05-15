---
phase: 5
title: "Performance: Hugo image pipeline (AVIF/WebP responsive)"
status: completed
priority: P1
effort: "2d"
dependencies: [3]
---

# Phase 5: Performance — Hugo image pipeline (AVIF/WebP responsive)

## Overview

Replace plain `<img>` tags with a Hugo-processed `<picture>` element delivering AVIF + WebP + JPEG fallback, sized correctly for the rendered slot. Apply to both `params.avatar` and per-link `image` (added in Phase 3). Net effect: ~40–60% image payload reduction in modern browsers, eliminated CLS via explicit dimensions, faster LCP via `fetchpriority="high"`.

Also fingerprint the CSS file for safer long-cache headers (`max-age=31536000, immutable`).

Depends on Phase 3 — that phase introduces `link.image`, which this phase optimizes.

## Context Links

- Source: `plans/reports/researcher-260515-hugo-lighthouse-best-practices.md` §1.2 (responsive images) and §5.3 (asset fingerprinting)
- Hugo image processing docs: https://gohugo.io/content-management/image-processing/
- Current state: avatar is one raw `<img>` with `loading="eager"` only (no width/height/srcset/AVIF/WebP); Phase 1 adds dimensions/fetchpriority; this phase adds format/responsive negotiation.

## Requirements

### Functional

**Avatar pipeline:**

- When `params.avatar` is a path inside the site (`/images/…` or relative), Hugo's `resources.Get` resolves it.
- Generate three variants at standard pixel densities: 112w (1x), 224w (2x).
- Encode each in AVIF (q60), WebP (q75), JPEG (q85). Hugo's `Process` action handles AVIF and WebP since 0.83.
- Render as `<picture>`:
  ```html
  <picture>
    <source type="image/avif" srcset="{avif-112} 1x, {avif-224} 2x">
    <source type="image/webp" srcset="{webp-112} 1x, {webp-224} 2x">
    <img class="bio__avatar" src="{jpeg-112}" width="112" height="112"
         alt="{{ name }}" loading="eager" fetchpriority="high" decoding="async" />
  </picture>
  ```
- If `params.avatar` is an absolute external URL (`https://…`), skip processing — emit a plain `<img>` (with Phase 1 attrs) and document the trade-off.

**Per-link thumbnail pipeline (from Phase 3):**

- When `link.image` is a local resource, process to 24w + 48w (1x / 2x) in WebP + JPEG; AVIF skipped (overhead not worth for thumbnails this small).
- `loading="lazy"`, `decoding="async"`, explicit width/height.

**CSS fingerprinting:**

- `bonsai.css` loaded via `resources.Get | resources.Minify | resources.Fingerprint`, emitted with content-hash filename `/css/bonsai.{hash}.css`.
- Enables hosting to set `Cache-Control: public, max-age=31536000, immutable` on `/css/*` safely.
- Same treatment for `theme-toggle.js` and `share.js`.

### Non-functional

- Hugo extended required for WebP/AVIF (already a soft requirement per Bonsai README "Hugo ≥ 0.128 extended"). Reaffirm in `theme.toml` and README.
- Build time impact: image processing is cached in `resources/_gen/`. First-time build adds ~2–4 sec per processed image; subsequent builds reuse cache.
- AVIF encode is slow at high quality but ~1.5–2× faster at q60 vs q90. Use q60 with `lossless = false` defaults.
- For external-URL avatars: no processing, no benefit — document.

## Architecture

```
partials/avatar.html (rewrite)
  ├─ if params.avatar is local resource:
  │   $orig := resources.Get $path
  │   $avif1x := $orig.Process "resize 112x112 webp" / similar pipeline
  │   $webp1x, $jpg1x same
  │   $avif2x, $webp2x, $jpg2x at 224x224
  │   emit <picture>
  └─ else fall through to existing branch (external URL → plain <img>; unset → SVG initials)

partials/link-button.html (modify Phase 3 image branch)
  └─ if link.image is local:
       process to 24w + 48w in webp + jpg
       emit <picture> with srcset
     else: emit plain <img>

partials/head.html (modify)
  └─ stylesheet link now references fingerprinted resource:
       {{ $css := resources.Get "css/bonsai.css" | resources.Minify | resources.Fingerprint }}
       <link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}" />

  └─ same pattern for theme-toggle.js (when themeToggle=true) and share.js (when share=true)
```

## Related Code Files

**Modify:**
- `layouts/partials/avatar.html` — picture-element output for local avatars
- `layouts/partials/link-button.html` — picture-element output for local link thumbnails
- `layouts/partials/head.html` — fingerprinted stylesheet + scripts with `integrity=`
- `theme.toml` — reaffirm `min_version = "0.140.0"` and "Hugo extended required" note
- `README.md` — document image-pipeline behavior and the local-vs-external distinction
- `exampleSite/hugo.toml` — point demo `avatar` to a local image so demo exercises the pipeline (currently `/images/avatar.svg` which is already local — verify path resolves)

**Move (assets → resources, if needed):**
- For Hugo to process `/images/avatar.svg`, image must live under `assets/` not `static/`. Decision: keep user images under `static/` for backward-compat AND document that processing requires moving to `assets/`. OR: detect both via `resources.Get` (works for `assets/`) and `resources.GetMatch` against `static/` via a helper. Simpler: tell users to put avatars in `assets/avatars/` and reference as `avatar = "avatars/me.jpg"`.

**Create:**
- `exampleSite/assets/avatars/sample-avatar.jpg` — replace SVG placeholder so demo exercises image pipeline
- Update `exampleSite/hugo.toml` → `avatar = "avatars/sample-avatar.jpg"`

## Implementation Steps

1. **Decide and document the avatar path convention.**
   Two options:

   **Option A (recommended):** Bonsai treats `params.avatar` as a path relative to `assets/`. Convention shift from v0.4 (where it was a URL or a `static/` path).

   **Option B (back-compat):** Theme tries `resources.Get` first; on miss, falls back to plain `<img>` with the unprocessed path. No user migration needed.

   **Plan with Option B.** Pseudo:
   ```go
   {{- $avatar := site.Params.avatar -}}
   {{- $local := false -}}
   {{- $img := "" -}}
   {{- if not (strings.HasPrefix $avatar "http") -}}
     {{- $clean := strings.TrimPrefix $avatar "/" -}}
     {{- with resources.Get $clean -}}
       {{- $img = . -}}{{- $local = true -}}
     {{- end -}}
   {{- end -}}
   {{- if $local -}}
     {{- /* picture-element pipeline */ -}}
   {{- else if $avatar -}}
     {{- /* fallback to plain <img> with Phase-1 attrs */ -}}
   {{- else -}}
     {{- /* existing initials SVG branch */ -}}
   {{- end -}}
   ```

2. **Avatar `<picture>` pipeline:**
   ```go
   {{- $w := 112 -}}{{- $h := 112 -}}
   {{- $jpg1x := $img.Process (printf "resize %dx%d jpg q85" $w $h) -}}
   {{- $jpg2x := $img.Process (printf "resize %dx%d jpg q85" (mul $w 2) (mul $h 2)) -}}
   {{- $webp1x := $img.Process (printf "resize %dx%d webp q75" $w $h) -}}
   {{- $webp2x := $img.Process (printf "resize %dx%d webp q75" (mul $w 2) (mul $h 2)) -}}
   {{- $avif1x := $img.Process (printf "resize %dx%d webp q60" $w $h) | resources.Process "resize 112x112 avif" -}}
   ```
   Note: Hugo 0.83+ added AVIF via `resources.Process "convert avif"`. Confirm syntax against installed Hugo at implementation time — exact format string changed across 0.83/0.140; reference live docs.

3. **Link-thumbnail pipeline** mirrors avatar but at 24w + 48w, WebP + JPEG only (skip AVIF).

4. **Fingerprinted CSS** (`head.html`):
   ```go
   {{- $css := resources.Get "css/bonsai.css" | resources.Minify | resources.Fingerprint "sha384" -}}
   <link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}" crossorigin="anonymous" />
   ```
   - Move `static/css/bonsai.css` → `assets/css/bonsai.css` (Hugo `resources.Get` reads from `assets/`).
   - Same for `theme-toggle.js`, `share.js` → `assets/js/…`.
   - This is a structural change: update `static/css/…` references in `layouts/themes/single.html` and `layouts/variants/single.html` to use `resources.Get "css/gallery.css"` too.

5. **Subresource Integrity (SRI):** add `integrity=` and `crossorigin=` to stylesheet/scripts. Validates content hash. Requires same-origin or CORS-friendly. Document interaction with CSP (`'strict-dynamic'` incompatible — keep simple CSP).

6. **Migrate sample assets in exampleSite** so demo exercises the pipeline:
   - Move `exampleSite/static/images/avatar.svg` → keep, but also add `exampleSite/assets/avatars/sample-avatar.jpg` (real raster image, ~200×200 source).
   - Switch `avatar = "/images/avatar.svg"` → `avatar = "avatars/sample-avatar.jpg"`.
   - SVG demo can move to a `/svg-avatar/` page if desired (out of scope).

7. **Build verification + measurement**:
   ```bash
   cd exampleSite && hugo --themesDir ../.. --gc --minify --templateMetrics
   # Inspect public/avatars/ — should contain avif/webp/jpg variants
   # Inspect public/css/bonsai.{hash}.css — fingerprinted output
   # Measure sizes
   du -sb public/avatars/* public/css/* public/js/*
   gzip -kc public/css/bonsai.*.css | wc -c
   ```

8. **Lighthouse run** (manual, on built site):
   - Expect Performance improvement ≥ +10 points from image format alone.
   - LCP element should now be the optimized AVIF/WebP avatar.

## Todo List

- [ ] Move `static/css/*.css` → `assets/css/*.css`
- [ ] Move `static/js/*.js` → `assets/js/*.js`
- [ ] Add fingerprinted `<link>` + `<script>` with SRI in `head.html`
- [ ] Rewrite `partials/avatar.html` with local-vs-external branching + `<picture>` pipeline
- [ ] Update `partials/link-button.html` Phase-3 image branch to use `<picture>` pipeline
- [ ] Update `exampleSite` to use a real raster avatar under `assets/`
- [ ] Update `layouts/themes/single.html` + `layouts/variants/single.html` gallery CSS reference to use resources.Get
- [ ] Document avatar path convention shift in README (back-compat note: still works for absolute URL & static/-relative paths via fallback)
- [ ] Verify CSP `'self'` still passes with SRI + CORS
- [ ] Measure: image payload reduction vs v0.4 baseline
- [ ] Measure: Lighthouse Performance delta on exampleSite

## Success Criteria

- [ ] Local avatar serves as `<picture>` with AVIF, WebP, JPEG sources
- [ ] External-URL avatar still works (fallback to plain `<img>` with Phase-1 attrs)
- [ ] Avatar payload (best-format negotiated) ≤ 50% of v0.4 JPEG-only size for a 200×200 source
- [ ] CSS link is fingerprinted; identical-content rebuilds reuse same hash
- [ ] `integrity=` attribute present and validates (browser DevTools: no SRI errors)
- [ ] No regression in zero-JS default — pipeline runs at build time only
- [ ] `hugo --gc --minify` builds clean; processed images cached on second run
- [ ] Lighthouse Performance ≥ 90 on exampleSite (locked threshold per validation session 1)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| AVIF encoding slow / build-time impact in CI | Hugo caches under `resources/_gen/`; commit cache only if CI is greenfield. Document `--gc` to prune. |
| Hugo AVIF support varies across versions (`resources.Process "avif"`) | Pin `min_version = "0.140.0"` (already planned in Phase 3). Confirm AVIF works on 0.140+. |
| Move from `static/` to `assets/` is a breaking change for user sites that hard-code paths | Phase uses fallback to `<img>` when `resources.Get` misses — keeps back-compat. |
| SRI `integrity=` blocks loading when CSS is edited locally during dev | Hugo regenerates hash on every rebuild; only a problem for stale CDN cache, which is the use case SRI solves. |
| CSP must allow `'self'` for stylesheets (already does in Phase 1 deploy template) | Confirmed — Phase 1 CSP allows `'self'` for style-src. |
| Hash-in-filename breaks naive cache-busting some users rely on | Documented; `?v=…` query-string busting still works for users who prefer it (would require revert). |
| Image processing fails silently for missing files | `resources.Get` returns nil → falls through to `<img>` branch — safe. |

## Security Considerations

- SRI (`integrity=`) ensures CSS/JS isn't tampered with in transit by an intermediate proxy.
- Hugo's image processing happens at build time on trusted source files; no runtime image processing means no SSRF surface.
- AVIF/WebP decoders in browsers are well-fuzzed; no novel attack surface introduced.
