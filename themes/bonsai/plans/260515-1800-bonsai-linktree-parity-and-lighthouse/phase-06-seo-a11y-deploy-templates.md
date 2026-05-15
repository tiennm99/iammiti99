---
phase: 6
title: "SEO + a11y hardening + deploy templates"
status: completed
priority: P2
effort: "2d"
dependencies: []
---

# Phase 6: SEO + a11y hardening + deploy templates

## Overview

Mop-up phase for the SEO / Best-Practices / A11y categories that Phase 1 quick-wins didn't cover. Adds hreflang for i18n, opt-in WebSite JSON-LD, opt-in web manifest, tap-target audit fix, plus a complete set of deploy templates (Netlify, Vercel, Cloudflare Pages, GitHub Pages CDN-via-Cloudflare) so users can apply security headers and aggressive cache policies in one commit.

## Context Links

- Source: `plans/reports/researcher-260515-hugo-lighthouse-best-practices.md` §4.2 (hreflang), §4.3 (WebSite schema), §4.5 (tap targets), §5.1 (manifest)
- Audit: `plans/reports/researcher-260515-bonsai-current-audit.md` §8 ("Present ✅" / "Missing ❌") — confirms hreflang, WebSite schema, manifest are missing
- Phase 1 already shipped: `_headers`, `vercel.json` minimal templates — this phase expands them

## Requirements

### Functional

**1. Hreflang links** (only when site has multiple languages configured):
```html
{{- if gt (len site.Languages) 1 }}
  {{- range site.Languages }}
  <link rel="alternate" hreflang="{{ .Lang }}" href="{{ site.BaseURL | relLangURL }}" />
  {{- end }}
  <link rel="alternate" hreflang="x-default" href="{{ site.BaseURL }}" />
{{- end }}
```

**2. Opt-in WebSite + SearchAction JSON-LD** (rich-snippet eligibility):
- New `params.schemaWebSite` boolean (default `false` — pure opt-in; doesn't change existing Person schema).
- When `true`, emit a second `<script type="application/ld+json">` with `@type: WebSite` referencing the existing Person via `author`.

**3. Opt-in web manifest** (installable PWA affordance):
- New `params.manifest` boolean (default `false`).
- When `true`, theme emits `<link rel="manifest" href="/manifest.webmanifest">` AND generates the manifest file via Hugo output format.
- Manifest derives `name`, `short_name`, `theme_color`, `background_color`, icon paths from `params.name`, `params.themeColor`, `params.faviconSvg`, `params.appleTouchIcon`.

**4. Tap-target audit + fix:**
- Verify all link layouts meet 48×48 px tap target with 8 px spacing.
- Current state (audit): `stack` and `grid` already comfortably over 48 px due to ~.9 rem padding. `inline` (icon-only row) currently uses 20×20 icons in a flex row — needs explicit min-width/min-height.
- Add CSS:
  ```css
  .bio__links--inline .link { min-width: 48px; min-height: 48px; padding: .75rem; }
  .bio__links--inline { gap: clamp(.5rem, 1.5vw, 1rem); /* ensure ≥ 8 px spacing */ }
  ```

**5. Expanded deploy templates:**
- Build out `docs/deployment-guide.md` started in Phase 1 with full Netlify, Vercel, Cloudflare Pages, GitHub Pages (note: no custom headers; suggest Cloudflare Worker overlay) sections.
- Each section: full config snippet, what each line does, what Lighthouse audit it satisfies.

**6. Robots.txt + sitemap.xml** (Hugo-native):
- Currently disabled in exampleSite: `disableKinds = ["sitemap", "RSS", "404"]`.
- For a single-page bio, `sitemap.xml` is low-value but Lighthouse SEO sometimes flags missing. Recommendation: keep disabled by default but document opt-in.
- Robots.txt: Hugo emits a default one if `enableRobotsTXT = true`. Recommend setting this in README config snippet.

### Non-functional

- New params (`schemaWebSite`, `manifest`) both default off — no behavioral change for existing sites.
- Hreflang block emits *only* when multi-language site detected; zero overhead for default single-language users.
- CSS additions ≤ 200 B raw (inline-layout tap-target fix).
- Manifest file size ≤ 500 B (generated once at build time when opted in).

## Architecture

```
partials/head.html
  ├─ hreflang block (conditional on multi-language)
  ├─ optional WebSite schema (new partial: partials/schema-website.html)
  └─ optional manifest link (when params.manifest)

partials/schema-website.html (new)
  └─ JSON-LD WebSite with author → Person reference

layouts/_default/manifest.webmanifest (new) + outputFormat config
  └─ Hugo template that builds the manifest JSON from params

static/css/bonsai.css → assets/css/bonsai.css (post-Phase-5)
  └─ tap-target fix for .bio__links--inline .link

docs/deployment-guide.md
  ├─ Netlify section: full netlify.toml + _headers
  ├─ Vercel section: full vercel.json
  ├─ Cloudflare Pages section: _headers (compatible with Netlify format)
  └─ GitHub Pages section: limitation note + Cloudflare-Worker overlay recipe
```

## Related Code Files

**Modify:**
- `layouts/partials/head.html` — hreflang block, conditional manifest link, conditional WebSite schema partial call
- `assets/css/bonsai.css` (was `static/css/bonsai.css` pre-Phase-5) — tap-target fix for inline layout
- `README.md` — document `schemaWebSite`, `manifest`, `enableRobotsTXT` recommendation, hreflang behavior
- `exampleSite/hugo.toml` — set `enableRobotsTXT = true`; demonstrate `manifest = true`
- `docs/deployment-guide.md` — expand to full 4-host coverage

**Create:**
- `layouts/partials/schema-website.html`
- `layouts/_default/manifest.webmanifest`
- `exampleSite/static/manifest-icon-192.png` and `manifest-icon-512.png` (or document that user must provide)

## Implementation Steps

1. **Hreflang block** (`head.html`, near canonical link):
   ```html
   {{- if gt (len site.Languages) 1 }}
     {{- range site.Languages }}
     <link rel="alternate" hreflang="{{ .Lang }}" href="{{ partial "internal/_funcs/relLangPrefix.html" . }}{{ $.RelPermalink }}" />
     {{- end }}
     <link rel="alternate" hreflang="x-default" href="{{ $.Permalink }}" />
   {{- end }}
   ```
   Hugo's `RelPermalink` + i18n integration handles per-language path prefixes.

2. **WebSite schema partial** (`partials/schema-website.html`):
   ```go
   {{- if site.Params.schemaWebSite -}}
   {{- $payload := dict
     "@context" "https://schema.org"
     "@type" "WebSite"
     "name" (site.Params.name | default site.Title)
     "url" site.BaseURL
     "inLanguage" site.LanguageCode
   -}}
   {{- with site.Params.bio -}}{{- $payload = merge $payload (dict "description" .) -}}{{- end -}}
   <script type="application/ld+json">{{ $payload | jsonify | safeJS }}</script>
   {{- end -}}
   ```
   Invoke from `head.html` after `schema-person.html`.

3. **Manifest template** (`layouts/_default/manifest.webmanifest`):
   ```go
   {{- $themeColor := site.Params.themeColor | default "#8b3a2b" -}}
   {{- $bgColor := site.Params.themeBackground | default "#f4efe6" -}}
   {
     "name": "{{ site.Params.name | default site.Title }}",
     "short_name": "{{ substr (site.Params.name | default site.Title) 0 12 }}",
     "start_url": "/",
     "display": "standalone",
     "background_color": "{{ $bgColor }}",
     "theme_color": "{{ $themeColor }}",
     "icons": [
       {{- with site.Params.appleTouchIcon }}
       { "src": "{{ . | relURL }}", "sizes": "180x180", "type": "image/png" }{{ if site.Params.faviconSvg }},{{ end }}
       {{- end }}
       {{- with site.Params.faviconSvg }}
       { "src": "{{ . | relURL }}", "sizes": "any", "type": "image/svg+xml" }
       {{- end }}
     ]
   }
   ```
   Add to hugo.toml outputs:
   ```toml
   [outputs]
     home = ["HTML", "RSS", "Manifest"]
   [outputFormats.Manifest]
     mediaType = "application/manifest+json"
     baseName = "manifest"
     isPlainText = true
     notAlternative = true
   ```

4. **Manifest link in head**:
   ```html
   {{- if site.Params.manifest }}
   <link rel="manifest" href="{{ `manifest.webmanifest` | relURL }}" />
   {{- end }}
   ```

5. **Tap-target CSS fix** (append to `bonsai.css`):
   ```css
   .bio__links--inline .link { min-width: 48px; min-height: 48px; padding: .75rem; justify-content: center; }
   .bio__links--inline { gap: clamp(.5rem, 1.5vw, 1rem); }
   ```

6. **Expand `docs/deployment-guide.md`:**
   - **Netlify** section: `netlify.toml` (build config) + `_headers` (security + cache). Brotli auto-applied.
   - **Vercel** section: `vercel.json` with `headers` array, `cleanUrls`, `trailingSlash` settings.
   - **Cloudflare Pages** section: same `_headers` as Netlify; mention Brotli auto.
   - **GitHub Pages**: limitation note (no custom headers). Recipe: front with a Cloudflare Worker that injects headers. Provide minimal Worker script.
   - Each section: link from-text to the Lighthouse audit it satisfies (e.g., "X-Content-Type-Options nosniff → Lighthouse Best-Practices 'Has a strong HTTPS-only policy'").

7. **README updates**: brief sub-section "Lighthouse hardening" pointing to deployment-guide; bullet list of new opt-in params.

8. **exampleSite**: enable `manifest = true`, `schemaWebSite = true`, `enableRobotsTXT = true` in `hugo.toml` to showcase all three on the live demo.

9. **Build verification**:
   - `hugo --gc --minify`. Verify `public/manifest.webmanifest` is valid JSON (parse with `jq`).
   - Verify `public/robots.txt` present.
   - View built `public/index.html`: confirm hreflang block emitted only when multi-language config, manifest `<link>` present, WebSite JSON-LD present.

## Todo List

- [ ] Add hreflang block to `head.html` (conditional on `len site.Languages > 1`)
- [ ] Create `partials/schema-website.html` + wire into `head.html`
- [ ] Create `layouts/_default/manifest.webmanifest` + register output format
- [ ] Add tap-target fix CSS for `.bio__links--inline .link`
- [ ] Expand `docs/deployment-guide.md` with Netlify / Vercel / Cloudflare Pages / GitHub Pages sections
- [ ] Add Cloudflare Worker overlay recipe for GitHub Pages
- [ ] Document new params in README (`schemaWebSite`, `manifest`)
- [ ] Set `enableRobotsTXT = true` in exampleSite
- [ ] Enable `manifest = true` + `schemaWebSite = true` in exampleSite demo
- [ ] Provide placeholder manifest icons (192×192, 512×512) in exampleSite static/
- [ ] Verify hreflang appears only on multi-lang site fixture
- [ ] Verify Lighthouse SEO ≥ 90 on exampleSite

## Success Criteria

- [ ] Hreflang block emits for multi-lang fixture; absent on single-lang
- [ ] `params.schemaWebSite = true` emits valid WebSite JSON-LD (validate against schema.org parser)
- [ ] `params.manifest = true` produces `/manifest.webmanifest` (valid JSON) and `<link rel="manifest">`
- [ ] All three inline-layout link variants pass Lighthouse "Tap targets sized appropriately" audit
- [ ] `docs/deployment-guide.md` covers 4 hosts with full snippets
- [ ] Lighthouse SEO ≥ 90 on exampleSite demo
- [ ] Lighthouse Best-Practices ≥ 90 once hosting headers applied
- [ ] No regression: existing v0.4 demos render identical HTML when none of the new opt-in params are set

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Hreflang URL construction misuses Hugo i18n helpers (Hugo's `relLangURL` is page-dependent, not site-level) | Use page-context `.RelPermalink` per language site object — test against the i18n exampleSite fixture. Hugo's docs cover this pattern. |
| Manifest icons missing → invalid manifest, Lighthouse warns | Provide placeholder PNG icons in exampleSite; document required icon sizes in README. |
| Adding WebSite schema introduces JSON-LD validation conflicts with Person | Keep WebSite as a separate `<script>` tag with `@type: WebSite`; Person remains its own ProfilePage. Google supports multiple JSON-LD blocks per page. |
| Manifest output format collides with someone's existing custom output formats | Output format `Manifest` uses a unique baseName and mediaType — collision unlikely. |
| Inline layout tap-target fix changes the visual density users rely on | Document; the change applies only to `inline` layout which is the explicitly icon-only mode where tap targets matter most. |
| GitHub Pages users without Cloudflare can't apply security headers | Documented limitation. Suggest hosting alternatives (Netlify free tier) for users who care. |

## Security Considerations

- Manifest is a passive declarative file — no execution context, no injection vector.
- Hreflang link tags are URL-only; no script content.
- WebSite JSON-LD uses `jsonify | safeJS` like existing Person schema — same trust model.
- Documented Cloudflare Worker recipe runs at edge, not in user browser — owned by the site operator.
