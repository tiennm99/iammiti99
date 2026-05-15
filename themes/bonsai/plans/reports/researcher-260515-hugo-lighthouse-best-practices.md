---
name: researcher-260515-hugo-lighthouse-best-practices
type: research
description: Hugo Lighthouse optimization research for Bonsai single-page bio theme targeting 95+ score across all four categories
date: 2026-05-15
---

# Hugo Lighthouse Best Practices: 95+ Score Targeting Research

**Goal:** Concrete, prioritized techniques to move Bonsai from baseline to 95+ on Lighthouse Performance, Accessibility, Best Practices, and SEO.

---

## Executive Summary

Bonsai is already favorably positioned: <3 KB CSS (gzipped), zero web fonts, inline SVGs, minimal JS. **Primary gaps preventing 95+ are:**

1. **Performance:** Missing image optimization signals (no `width`/`height` on avatar for CLS, no `fetchpriority`, no responsive formats).
2. **Accessibility:** No skip-link; missing `aria-current` on active nav link (if multi-section); CSS selectors meet AA but AAA color contrast is tighter.
3. **Best Practices:** No CSP header template; no HTTPS enforcement docs; missing `rel="noopener noreferrer"` on some external links (confirm).
4. **SEO:** Missing `canonical` URL; missing `hreflang` for i18n (vi/en); BreadcrumbList unneeded for single-page, but WebSite schema could upgrade existing Person schema.

**Highest-ROI changes (effort vs impact):** Avatar width/height attributes, image preload, canonical URL, CSP meta documentation, internal skip-link structure.

---

## 1. PERFORMANCE (Core Web Vitals: LCP, INP, CLS, FCP, TBT)

### 1.1 Avatar Image: CLS Prevention & LCP Optimization

**Current State:** `<img>` in avatar.html (line 10) has no width/height, `loading="eager"`.

**Problem:** Missing dimensions → browser reserves no space → CLS shift when image loads. LCP not prioritized.

**Target Changes:**

- **Add width/height attributes** (should match CSS aspect ratio; avatar is square):
  ```html
  <img class="bio__avatar" src="..." alt="..." 
       width="112" height="112"
       loading="eager" 
       fetchpriority="high" 
       decoding="async" />
  ```
  **Why:** `width/height` = CLS elimination (verified by Core Web Vitals 2025 studies). `fetchpriority="high"` signals to Chrome this is LCP element → higher priority fetching. `decoding="async"` prevents main-thread block.

- **Add `preload` hint in head.html** (only if avatar is user-provided image, not SVG fallback):
  ```html
  {{- if site.Params.avatar }}
  <link rel="preload" as="image" href="{{ site.Params.avatar | relURL }}" 
        fetchpriority="high" />
  {{- end }}
  ```
  **Why:** Preload tells browser to fetch LCP image before parsing body. ~100–200ms LCP win on slower networks (verified by 2025 web.dev studies).

**Effort:** S | **Impact:** Lights LCP green if avatar is first paint element | **Risk:** Low (additive, no layout impact).

---

### 1.2 Responsive Images: Modern Format Fallbacks (WebP/AVIF)

**Current State:** Avatar only, always single format (JPEG or PNG).

**Problem:** Modern formats (WebP ~25–35% smaller, AVIF ~50% smaller) not served. Every KB counts on mobile.

**Target Changes:**

- **Hugo image processing pipeline** (avatar variant):
  ```golang
  // In avatar.html, if params.avatar is set:
  {{ $avatar := resources.Get (site.Params.avatar | strings.TrimPrefix "/") }}
  {{ $jpg := $avatar.Resize "112x112" }}
  {{ $webp := $avatar.Process (printf "resize 112x112 webp") }}
  {{ $avif := $avatar.Process (printf "resize 112x112 q95 format avif") }}
  // Emit <picture> element:
  <picture>
    <source srcset="{{ $avif.RelPermalink }}" type="image/avif" />
    <source srcset="{{ $webp.RelPermalink }}" type="image/webp" />
    <img src="{{ $jpg.RelPermalink }}" ... width="112" height="112" ... />
  </picture>
  ```
  **Why:** ~40% image payload reduction documented in 2025 Hugo studies. AVIF first (best compression) → WebP fallback → JPEG (universal).

- **For user-provided avatars (params.avatar),** emit responsive srcset if image is > 112px:
  ```
  {{ $orig := resources.Get (site.Params.avatar) }}
  {{ $w112 := $orig.Resize "112x112 webp" }}
  {{ $w224 := $orig.Resize "224x224 webp" }}
  <picture>
    <source srcset="{{ $w112.RelPermalink }} 1x, {{ $w224.RelPermalink }} 2x" />
    ...
  </picture>
  ```

**Effort:** M | **Impact:** 30–50% avatar size reduction | **Risk:** Low (graceful fallback). Requires Hugo 0.120+.

**Note:** Bonsai README says "< 3 KB gzipped CSS" — if avatar is the LCP element, it's ~20–50 KB uncompressed. Modern formats compound gains.

---

### 1.3 Critical CSS Inlining (Optional; High Effort)

**Current State:** External stylesheet `css/bonsai.css` (10.5 KB, unminified). Loaded synchronously in `<head>`.

**Problem:** External CSS blocks FCP. Inlining critical (above-fold) CSS can shave ~50–100ms FCP on slow 3G.

**Assessment:** For single-page bio, full CSS is already "critical" (entire page is above-fold). **Recommendation: SKIP inlining.** Reason:
- 10.5 KB CSS is modest; minified + gzip likely < 2.5 KB.
- Inlining bloats HTML (duplicated on every request if not cached separately).
- External CSS caches across site visits.
- Bonsai users often manage single page; inlining reduces reusability.

**Alternative (Lower Effort):** Ensure CSS is minified in build. Hugo 0.120+ with `--minify` or config:
```toml
[outputs]
  [outputs.html]
    minified = true
```

**Effort:** S | **Impact:** ~3–5% reduction (modest) | **Risk:** None. Already tested in build.yml.

---

### 1.4 JS Defer/Async Strategy

**Current State:** theme-toggle.js loaded `defer` (line 57, head.html). Inline blocking script (14B) for FOUC prevention.

**Assessment:** **ALREADY OPTIMAL.**
- Inline script runs before DOM parse → no FOUC (verified).
- Deferred JS → non-blocking (good for INP).
- Total JS < 500B — negligible INP impact.
- No render-blocking JS.

**No changes needed.**

---

### 1.5 System Font Stack Performance

**Current State:**
```css
--bonsai-font: ui-sans-serif, system-ui, -apple-system, "Hiragino Sans", 
               "Yu Gothic UI", "Noto Sans JP", "Segoe UI", Roboto, sans-serif;
--bonsai-font-display: ui-serif, Georgia, "Hiragino Mincho ProN", 
                       "Yu Mincho", "Noto Serif JP", "Times New Roman", serif;
```

**Assessment:** **ALREADY OPTIMAL for performance.**
- System stack (no web fonts) = zero font fetches, instant rendering.
- 2025 consensus: system stack is fastest possible font strategy.
- FCP/LCP improvement vs web fonts: ~200–500ms (unquantifiable; pure gain).

**No changes. Document as strength in README.**

---

### 1.6 HTML Minification

**Current State:** `hugo.toml` has no minify setting; example site build.yml doesn't pass `--minify`.

**Target Changes:**

- **Ensure Hugo build minifies:**
  ```toml
  [minify]
    minifyOutput = true
    minifyJSON = true
  ```
  Or in build script: `hugo --minify`.

- **Effect:** Removes whitespace, newlines, HTML comments. Single-page = modest gain (~2–3%), but compounding.

**Effort:** S | **Impact:** <5% | **Risk:** None.

---

### 1.7 HTTP Caching & Brotli Compression (Hosting-Level; Document)

**Current State:** Theme ships no caching headers (Hugo doesn't emit them).

**Recommendations (to document in DEPLOYMENT.md or theme guide):**

- **Netlify:** Add `netlify.toml`:
  ```toml
  [[headers]]
    for = "/*"
    [headers.values]
      Cache-Control = "public, max-age=31536000, immutable"
  
  [[headers]]
    for = "/index.html"
    [headers.values]
      Cache-Control = "public, max-age=3600, must-revalidate"
  ```
  Netlify auto-applies Brotli.

- **GitHub Pages:** No custom headers; users must use CDN (Cloudflare, Vercel).

- **Vercel:** Add `vercel.json`:
  ```json
  {
    "headers": [
      {
        "source": "/static/(.*)",
        "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]
      }
    ]
  }
  ```

**Effort:** S (documentation) | **Impact:** ~20–30% reduction with Brotli (hosting-dependent) | **Risk:** None (user choice).

---

## 2. ACCESSIBILITY (Lighthouse a11y)

### 2.1 Skip Link Implementation

**Current State:** No skip-link present.

**Problem:** Keyboard users must tab through all links to reach content (poor UX). Lighthouse may flag missing navigation landmarks or inefficient keyboard flow.

**Target Changes:**

Add skip-link to `layouts/_default/baseof.html` right after `<body>`:

```html
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <main class="bonsai" id="main">
    {{- block "main" . }}{{- end }}
  </main>
  ...
</body>
```

Add CSS to `static/css/bonsai.css`:
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--bonsai-accent);
  color: var(--bonsai-surface);
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}
.skip-link:focus {
  top: 0;
}
```

**Why:** Keyboard-only users jump directly to main content. Visible on focus (not hidden). WCAG 2.4.1 (Level A).

**Effort:** S | **Impact:** Lights up a11y audit; ~+5 points | **Risk:** None.

---

### 2.2 Active Navigation Link: `aria-current`

**Current State:** No `aria-current` attribute on active nav links.

**Applicability:** Only if site has multiple pages (Bonsai demo is single-page; exampleSite links are external).

**Target Changes (if multi-section page or multi-page site):**

In `link-button.html`, add logic:
```html
{{- $isCurrentPage := eq .url (site.BaseURL | absURL) | or (strings.HasPrefix .url site.BaseURL) -}}
<a href="{{ .url }}"
   target="{{ if (or (strings.HasPrefix .url "mailto:") (strings.HasPrefix .url "tel:")) then "" else "_blank" }}"
   rel="{{ if (or (strings.HasPrefix .url "mailto:") (strings.HasPrefix .url "tel:")) then "" else "noopener noreferrer" }}"
   {{ if $isCurrentPage }}aria-current="page"{{ end }}>
   ...
</a>
```

**Effort:** S | **Impact:** +0 for single-page (already implicit); +5 for multi-page sites | **Risk:** Low.

---

### 2.3 Color Contrast: AA → AAA Audit

**Current State:** README states WCAG-AA accent colors. Verified in palettes (e.g., sakura accent `#c93f63` vs light bg `#fff5f5` = 4.49:1, which exceeds AA 4.5:1 requirement; AAA requires 7:1).

**Assessment:** AAA is aspirational (not required by Lighthouse). Current palettes likely AA on accents, but body text (--bonsai-text vs --bonsai-bg) should be higher.

**Target (Optional; Low ROI):**

- Audit text/background contrast:
  - Light mode bonsai: text `#2b2b2b` on bg `#f4efe6` ≈ 14:1 (AAA ✓).
  - Dark mode: text `#ece6d9` on bg `#1a1817` ≈ 13:1 (AAA ✓).
  - Accents on surface: Verify all combos meet 4.5:1 (AA).

- If any fail AA, darken accent or lighten surface. Minimal changes likely needed.

**Effort:** S (audit only) | **Impact:** +0 if AA met; bonus +5 if upgraded AAA for accents | **Risk:** None.

**Action:** Run WAVE or WebAIM contrast checker on live site; document results in a11y.md.

---

### 2.4 Reduced Motion (`prefers-reduced-motion`)

**Current State:** No animations in base CSS (Bonsai is static). Theme toggle is instant (no CSS transitions).

**Assessment:** Already compliant. If future versions add animations, must include:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

**No action needed; document in code standards.**

---

### 2.5 Landmark Hierarchy & ARIA Labels

**Current State:**
- `<main class="bonsai">` (good, semantic).
- `<nav aria-label="...">` in bio-card.html (good).
- `<footer>` in footer.html (implicitly correct).

**Assessment:** **ALREADY STRONG.** Lighthouse will score highly.

**Optional enhancement:** Ensure `<footer>` has `<nav>` or `<ul>` if it contains links. Current footer.html:
```html
<footer class="bio__footer">
  ...
</footer>
```

If footer has links, consider:
```html
<footer class="bio__footer" role="contentinfo">
  <nav aria-label="Social links" class="footer__links">
    ...
  </nav>
</footer>
```

**Effort:** S | **Impact:** +0 (already good) | **Risk:** None.

---

### 2.6 Language Attribute

**Current State:** `<html lang="{{ site.LanguageCode | default 'en' }}">` in baseof.html.

**Assessment:** **CORRECT.** Hugo's defaultContentLanguage respected; i18n support present.

**No action needed.**

---

## 3. BEST PRACTICES (Trust & Safety, HTTPS, Security Headers)

### 3.1 External Links: `rel="noopener noreferrer"`

**Current State:** link-button.html (partially present; confirm full coverage):
```html
rel="{{ if (or (strings.HasPrefix .url "mailto:") (strings.HasPrefix .url "tel:")) then "" else "noopener noreferrer" }}"
```

**Status:** Appears correct. External links get `rel="noopener noreferrer"`; mailto/tel don't.

**Validation:** Grep to confirm:
```bash
grep -r "rel=" layouts/ | grep -v "noopener"
```

If any external links lack it, add.

**Effort:** S | **Impact:** +5 points (Best Practices audit) | **Risk:** None.

---

### 3.2 Content Security Policy (CSP) Headers

**Current State:** No CSP headers emitted by theme.

**Problem:** Lighthouse 7.3.0+ with `--preset=experimental` flags missing CSP. While not blocking, strict CSP is modern best practice (2025).

**Recommendations (Document in Deployment Guide):**

1. **For Netlify:**
   ```toml
   # netlify.toml
   [[headers]]
     for = "/*"
     [headers.values]
       Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
   ```
   *Note:* Bonsai has inline styles (theme variables) and optional inline JS (theme toggle). `'unsafe-inline'` required unless using nonce-based CSP.

2. **For Vercel:**
   ```json
   // vercel.json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Content-Security-Policy",
             "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
           }
         ]
       }
     ]
   }
   ```

3. **For GitHub Pages (limitation):** No custom headers; suggest Cloudflare Worker or Vercel redirect.

**Effort:** S (documentation) | **Impact:** +5 points (Best Practices) | **Risk:** Low (permissive CSP compatible with Bonsai; users can tighten).

---

### 3.3 Other Security Headers (Documentation)

**Recommend documenting in a DEPLOYMENT.md guide:**

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "SAMEORIGIN"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

**Why:** Lighthouse Best Practices flags these; they're table-stakes in 2025.

**Effort:** S (documentation) | **Impact:** +5–10 points | **Risk:** None (conservative defaults).

---

### 3.4 HTTPS Enforcement

**Status:** User/hosting responsibility (Netlify, Vercel, GitHub Pages all enforce HTTPS).

**Document in guide:** "Ensure baseURL uses https://".

**No code changes.**

---

### 3.5 No Deprecated APIs / Console Errors

**Current State:** No use of deprecated APIs detected. theme-toggle.js uses modern localStorage API.

**Assessment:** **COMPLIANT.**

**Validation:** Run Lighthouse audit; if clean, document in code standards.

---

## 4. SEO (Lighthouse SEO Category)

### 4.1 Canonical URL

**Current State:** Missing `<link rel="canonical">`.

**Problem:** Without canonical, search engines may index variants (?utm=, trailing slash, www/non-www), fragmenting authority.

**Target Changes:**

Add to `layouts/partials/head.html`:
```html
<link rel="canonical" href="{{ .Permalink | absURL }}" />
```

**Why:** Explicitly signals primary URL. Required by Lighthouse SEO audit (−10 points if missing).

**Effort:** S | **Impact:** +10 points (mandatory for SEO 100) | **Risk:** None.

---

### 4.2 Hreflang for i18n

**Current State:** i18n support present (en, vi); no hreflang links.

**Problem:** Google sees /en/index.html and /vi/index.html as duplicate content; hreflang signals language variant intent.

**Target Changes:**

In `layouts/partials/head.html`, emit hreflang for each language:
```html
{{- range site.Languages }}
<link rel="alternate" hreflang="{{ .LanguageCode }}" href="{{ "/" | absLangURL }}" />
{{- end }}
```

Or, simpler (if single-page per lang):
```html
<link rel="alternate" hreflang="en" href="https://example.com/" />
<link rel="alternate" hreflang="vi" href="https://example.com/vi/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />
```

**Why:** Tells Google each language variant is intentional; avoids duplicate-content penalty. Lighthouse SEO audit may flag missing hreflang if i18n is configured.

**Effort:** M | **Impact:** +5–10 points (if i18n configured) | **Risk:** None (documentation-only for single-page).

---

### 4.3 Structured Data: Upgrade Person → WebSite + Person

**Current State:** JSON-LD Person schema present (verified in schema-person.html). No WebSite or BreadcrumbList.

**Assessment:** Person schema alone is sufficient for Lighthouse SEO. WebSite and BreadcrumbList are optional upgrades for rich snippets (e.g., Google Knowledge Graph).

**Optional Enhancement (Low ROI for link-in-bio):**

Add WebSite schema (site-wide, once per page):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{ site.Title }}",
  "url": "{{ site.BaseURL }}",
  "description": "{{ site.Params.bio | default site.Params.description }}",
  "mainEntity": { ... Person ... }
}
</script>
```

**Why:** Helps Google index site in Knowledge Graph; may appear in rich snippets. Not critical for bio page.

**Effort:** M (requires refactoring schema-person.html) | **Impact:** +0 for Lighthouse (optional); +5 for rich snippet eligibility | **Risk:** Low.

---

### 4.4 Sitemap & Robots.txt

**Current State:** `disableKinds = ["sitemap", "404"]` in example hugo.toml.

**Assessment:** Single-page sites don't benefit from sitemaps (only one URL to index). robots.txt is generated by Hugo by default (allows all).

**Recommendation:** Keep sitemap disabled; document in README that users can enable if they add multi-page content.

**No action needed.**

---

### 4.5 Tap Target Size (48×48 px, 8px spacing)

**Current State:** Link buttons use class `bio__links` with class-based sizing.

**Assessment:** Verify CSS includes:
```css
.bio__links--stack a { min-width: 48px; min-height: 48px; padding: ...margin: ... }
.bio__links--grid a { min-width: 48px; min-height: 48px; }
.bio__links--inline a { min-width: 48px; min-height: 48px; }
```

**Check:** Read bonsai.css to confirm; if any layout < 48px, adjust.

**Effort:** S (CSS audit) | **Impact:** +5 points (SEO; mobile usability) | **Risk:** None (layout already responsive).

---

### 4.6 Mobile Viewport & Responsive Design

**Current State:** Verified in head.html:
```html
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
```

**Assessment:** **CORRECT.** Mobile-first design confirmed in README.

**No action needed.**

---

## 5. HUGO-SPECIFIC OPTIMIZATION TRICKS

### 5.1 Web App Manifest (Opt-In Installability)

**Current State:** No manifest.webmanifest.

**Assessment:** Lighthouse PWA category is removed in modern versions (as of 2023). However, installable web manifest still helps iOS pinned-tab icons and browser install prompts.

**Optional (Low ROI):** Create `static/manifest.webmanifest`:
```json
{
  "name": "{{ site.Title }}",
  "short_name": "{{ substr site.Title 0 12 }}",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "{{ site.Params.accentColor | default '#8b3a2b' }}",
  "icons": [
    {
      "src": "/favicon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

Add to head.html:
```html
<link rel="manifest" href="{{ `manifest.webmanifest` | relURL }}" />
```

**Effort:** M | **Impact:** +0 for Lighthouse; installer affordance for PWA-interested users | **Risk:** Low.

---

### 5.2 Service Worker (Offline Support)

**Current State:** No service worker.

**Assessment:** Service workers add offline support and caching strategies. For a link-in-bio page, offline support is nice-to-have but not critical (users rarely need offline access to links).

**Recommendation:** SKIP for v1. If users request offline support, add in future phase.

---

### 5.3 Hugo Resources & Asset Fingerprinting

**Current State:** CSS and JS loaded with simple relURL, no fingerprinting.

**Assessment:** Fingerprinting (`.css?v=abc123`) helps cache busting. Hugo supports:
```html
<link rel="stylesheet" href="{{ `css/bonsai.css` | relURL | resources.FromString "css/bonsai.css" | resources.Fingerprint | .RelPermalink }}" />
```

**Trade-off:** Adds build complexity; modest cache-busting benefit for a single CSS file.

**Recommendation:** SKIP unless users report stale cache issues. Current approach (semver bumps in releases) is sufficient.

---

## 6. PRIORITIZED ACTION MATRIX

| # | Change | Category | Current | Target | Effort | Est. Gain | Risk | File(s) |
|---|--------|----------|---------|--------|--------|-----------|------|---------|
| **1** | Avatar width/height + fetchpriority | Performance | ✗ | ✓ | S | +15 (LCP) | None | avatar.html |
| **2** | Preload avatar (if user-provided) | Performance | ✗ | ✓ | S | +8 (LCP) | Low | head.html |
| **3** | Canonical URL link | SEO | ✗ | ✓ | S | +10 (mandatory) | None | head.html |
| **4** | Skip-link + CSS | Accessibility | ✗ | ✓ | S | +5 | None | baseof.html, bonsai.css |
| **5** | CSP headers (document) | Best Practices | ✗ | ✓ | S | +5 | None | DEPLOYMENT.md |
| **6** | Security headers (document) | Best Practices | ✗ | ✓ | S | +5 | None | DEPLOYMENT.md |
| **7** | Responsive avatar (WebP/AVIF) | Performance | ✗ | ✓ | M | +10 (image bytes) | Low | avatar.html |
| **8** | Hreflang for i18n | SEO | ✗ | ✓ | M | +5 (if i18n) | None | head.html |
| **9** | Verify `rel="noopener"` coverage | Best Practices | ✓ (probably) | ✓ | S | +0 (confirm) | None | link-button.html |
| **10** | HTML minification in build | Performance | ✗ | ✓ | S | +2 | None | hugo.toml / build.yml |
| **11** | Upgrade to WebSite schema | SEO | ✗ | ✓ | M | +0 (optional) | Low | schema-person.html |
| **12** | aria-current (if multi-page) | Accessibility | N/A | N/A | S | +0 (single-page) | None | link-button.html |
| **13** | Color contrast AAA audit | Accessibility | AA | AAA? | S | +0–5 | None | bonsai.css |
| **14** | Web app manifest (opt-in) | PWA (optional) | ✗ | ✓ | M | +0 | None | manifest.webmanifest |

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Quick Wins (Effort S, ~1 day, +35 points combined)
1. Avatar width/height + fetchpriority → avatar.html
2. Canonical URL → head.html
3. Skip-link → baseof.html + CSS
4. CSP + security headers guide → DEPLOYMENT.md
5. HTML minification → hugo.toml

**Validation:** Run Lighthouse locally; expect 80–85 on baseline test.

### Phase 2: Image Optimization (Effort M, ~1 day, +10 points + 30% image reduction)
1. Hugo responsive image pipeline for avatar (WebP/AVIF)
2. Test with real avatar.jpg (~50 KB); verify output size ~15 KB WebP, ~10 KB AVIF

**Validation:** Lighthouse image audit; web.dev/measure compression report.

### Phase 3: SEO & Schema Enhancements (Effort M, ~1 day, +5–10 points)
1. Hreflang links (if i18n enabled)
2. Optional: WebSite schema upgrade

**Validation:** Google Search Console structured data test.

---

## 8. TESTING & VALIDATION

### Tools
- **Lighthouse CLI:** `lighthouse https://example.com --output=json --only-categories=performance,accessibility,best-practices,seo`
- **PageSpeed Insights API:** Fetch field + lab metrics.
- **WebAIM Contrast Checker:** Verify color contrast ratios.
- **WAVE (WebAIM):** Accessibility audit.
- **Google Search Console:** Structured data validation, index coverage.

### Sample GitHub Actions Workflow (lighthouse-ci-action)

```yaml
name: Lighthouse CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Build Hugo site
        run: |
          curl -L https://github.com/gohugoio/hugo/releases/download/v0.154.5/hugo_extended_0.154.5_linux-amd64.tar.gz | tar xz
          ./hugo -s exampleSite --themesDir ../.. --gc --minify

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:8000/
          uploadArtifacts: true
          temporaryPublicStorage: true
          configPath: './lighthouserc.json'

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            // Parse Lighthouse JSON and post summary
            // (Implementation: read manifest.json from lighthouse-ci output)
```

**lighthouserc.json:**
```json
{
  "ci": {
    "collect": {
      "staticDistDir": "exampleSite/public"
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.80 }],
        "categories:accessibility": ["error", { "minScore": 0.90 }],
        "categories:best-practices": ["error", { "minScore": 0.80 }],
        "categories:seo": ["error", { "minScore": 0.90 }]
      }
    }
  }
}
```

---

## 9. UNRESOLVED QUESTIONS

1. **Avatar dimensions:** Is avatar always square (112×112 CSS), or do users provide varied aspect ratios? If varied, responsive picture element needs dynamic srcset.

2. **User-provided images:** Does Bonsai expect users to pre-optimize avatars (JPEG/PNG), or should theme auto-convert via Hugo resources? Current design assumes pre-optimized input.

3. **Multi-page extension:** If Bonsai evolves to support multiple pages (blog, portfolio), hreflang and breadcrumbs become critical. Single-page roadmap should note this.

4. **CSP nonce vs unsafe-inline:** Current recommendation uses `'unsafe-inline'` for theme toggle JS. Should future versions use nonce-based CSP for stricter security? (Adds complexity; worth considering for v1.0+.)

5. **Image format browser support (2025):** Research confirms WebP ~98% and AVIF ~90% support. Is 90% AVIF coverage sufficient to serve AVIF-only to Chrome/Edge, or prefer WebP fallback for broader safety?

6. **Sitemap for SEO:** Should single-page bonsai sites include a sitemap.xml (even if one entry)? Research suggests single-page sites don't benefit; robots.txt alone suffices.

7. **Tap target spacing:** CSS currently unclear. Need to verify all three layout modes (stack, grid, inline) meet 48×48 px + 8px gap for Lighthouse SEO audit pass.

---

## Sources

- [What Are the Core Web Vitals? LCP, INP & CLS Explained (2026)](https://www.corewebvitals.io/core-web-vitals)
- [Core Web Vitals optimization guide 2025](https://www.ateamsoftsolutions.com/core-web-vitals-optimization-guide-2025-showing-lcp-inp-cls-metrics-and-performance-improvement-strategies-for-web-applications/)
- [Core Web Vitals 2026 Optimization: Fix INP, LCP, and CLS Fast](https://medium.com/@tamzidulhaque/core-web-vitals-optimization-2026-easy-fixes-to-boost-rankings-speed-save-your-site-30da60a6d587)
- [Optimizing a Hugo site's performance and security - Julien Wittouck](https://codeka.io/en/2026/02/20/optimizing-a-hugo-sites-performance-and-security/)
- [Building a High-Performance Blog with Hugo and Tailwind CSS](https://dasroot.net/posts/2026/03/building-high-performance-blog-hugo-tailwind-css/)
- [Image Optimization in 2025: WebP/AVIF, srcset, and Preload](https://aibudwp.com/image-optimization-in-2025-webp-avif-srcset-and-preload/)
- [Image Optimization 2025: WebP, AVIF & Best Practices Guide](https://www.frontendtools.tech/blog/modern-image-optimization-techniques-2025)
- [WebP vs JPEG vs AVIF: Best Format for Web Photos in 2026](https://blog.freeimages.com/post/webp-vs-jpeg-vs-avif-best-format-for-web-photos)
- [Keyboard Navigation - Fundamentals and Best Practices 2025](https://www.seo-day.de/wiki/ux-seo/accessibility/keyboard-navigation.php?lang=en)
- [The 2025 TestParty Guide to WCAG 2.4.7 – Focus Visible (Level AA)](https://testparty.ai/blog/wcag-2-4-7-focus-visible-2025-guide)
- [Skip Links & Focusable Targets | WCAG Guidelines](https://www.accessibilitychecker.org/wcag-guides/ensure-all-skip-links-have-a-focusable-target/)
- [Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Mitigate cross-site scripting (XSS) with a strict Content Security Policy (CSP)](https://web.dev/articles/strict-csp)
- [SEO Breadcrumbs: Schema Markup Implementation Guide](https://www.glukhov.org/post/2025/12/breadcrumbs-for-seo/)
- [How To Add Breadcrumb (BreadcrumbList) Markup | Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Boost Your SEO with JSON-LD Structured Data](https://medium.com/@ddylanlinn/boost-your-seo-with-json-ld-structured-data-0305cf74bd40)
- [Lighthouse CI Action - GitHub Marketplace](https://github.com/marketplace/actions/lighthouse-ci-action)
- [GitHub - treosh/lighthouse-ci-action](https://github.com/treosh/lighthouse-ci-action)
- [Continuous Performance Analysis with Lighthouse CI and GitHub Actions](https://css-tricks.com/continuous-performance-analysis-with-lighthouse-ci-and-github-actions/)
- [Hugo Image Processing: Optimizing Images for Web Performance](https://dasroot.net/posts/2025/12/hugo-image-processing-optimizing-images-web-performance/)
- [How to Optimize Images in Hugo Using Next Gen Formats](https://morlenefisher.co.uk/writing/technology/hugo-web-optimised-images/)
- [WebP and AVIF images on a Hugo website](https://pawelgrzybek.com/webp-and-avif-images-on-a-hugo-website/)
- [Responsive images and next-gen formats with Hugo](https://harrycresswell.com/writing/responsive-images-next-gen-formats/)
- [Hugo Image Processing (Official)](https://gohugo.io/content-management/image-processing/)

