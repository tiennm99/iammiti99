---
phase: 1
title: "Lighthouse quick wins + meta hardening"
status: completed
priority: P1
effort: "1d"
dependencies: []
---

# Phase 1: Lighthouse quick wins + meta hardening

## Overview

Ship the highest-ROI Lighthouse fixes — all single-file, additive, zero-risk edits. Targets: LCP (avatar attrs + preload), SEO (canonical, og:url, theme-color, robots), A11y (skip-link), Best-Practices (CSP/security via doc + meta).

Expected combined gain (per researcher report §6 matrix rows 1–6, 10): +35 raw Lighthouse points → moves baseline well above the ≥90 floor locked in validation session 1, before any larger feature work.

## Context Links

- Source: `plans/reports/researcher-260515-hugo-lighthouse-best-practices.md` §1.1, §2.1, §4.1, §3.2
- Current audit: `plans/reports/researcher-260515-bonsai-current-audit.md` §8 "Missing ❌"

## Requirements

### Functional

- Avatar `<img>` (`partials/avatar.html`) emits `width="112" height="112" fetchpriority="high" decoding="async" loading="eager"`.
- `<head>` (`partials/head.html`) emits:
  - `<link rel="canonical" href="{{ .Permalink }}">` (uses page Permalink, not site BaseURL — works for multi-page extensions later).
  - `<meta property="og:url" content="{{ .Permalink }}">`.
  - `<meta name="theme-color" content="{{ params.themeColor }}">` — opt-in param; if unset, omit (don't guess accent from palette since accent is in CSS-only and would require palette-aware Hugo logic; KISS).
  - `<meta name="robots" content="{{ params.robots | default 'index,follow' }}">` — defaultable, suppressable.
  - Optional `<link rel="preload" as="image" href="{{ params.avatar | relURL }}" fetchpriority="high">` only when `params.avatar` is set AND `params.preloadAvatar | default true` is true (skip for SVG-initials fallback, no file to preload).
- Skip-link injected in `baseof.html` immediately after `<body>`: `<a class="skip-link" href="#main">{{ i18n "skip_to_content" | default "Skip to content" }}</a>`. Main wrapper gains `id="main"`.
- `i18n/en.toml` + `i18n/vi.toml` get new key `skip_to_content`.

### Non-functional

- Skip-link CSS budget: ≤ 200 bytes raw. Hidden off-screen by default, revealed on `:focus`.
- No new web fonts, no new JS.
- Backward-compatible: every new param defaults to a sensible value or omission.

## Architecture

```
partials/head.html
  ├─ canonical link
  ├─ og:url meta
  ├─ optional theme-color meta (params.themeColor)
  ├─ robots meta (default "index,follow", opt-out via params.robots = "noindex,nofollow")
  └─ optional avatar preload (when params.avatar && params.preloadAvatar)

partials/avatar.html
  └─ img tag gains width/height/fetchpriority/decoding attrs

layouts/_default/baseof.html
  ├─ skip-link (first child of body)
  └─ main now has id="main"

static/css/bonsai.css
  └─ .skip-link rule block (~150 B raw)

i18n/{en,vi}.toml
  └─ skip_to_content key
```

## Related Code Files

**Modify:**
- `layouts/partials/head.html` — add canonical, og:url, theme-color, robots, optional avatar preload
- `layouts/partials/avatar.html` — width/height/fetchpriority/decoding on `<img>`
- `layouts/_default/baseof.html` — skip-link + `id="main"` on main wrapper
- `static/css/bonsai.css` — `.skip-link` styles
- `i18n/en.toml` — `skip_to_content` key
- `i18n/vi.toml` — `skip_to_content` key
- `README.md` — document new params (`themeColor`, `robots`, `preloadAvatar`)
- `exampleSite/hugo.toml` — showcase new params

**Create:**
- `docs/deployment-guide.md` — security headers templates for Netlify, Vercel, Cloudflare Pages, GitHub Pages limitations (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options)
- `exampleSite/static/_headers` — Netlify-style header file (works on Netlify + Cloudflare Pages)
- `exampleSite/vercel.json` — Vercel header config example

## Implementation Steps

1. **Avatar attrs** (`partials/avatar.html`)
   - On the `<img>` branch: add `width="112" height="112" fetchpriority="high" decoding="async"`.
   - On the SVG-initials branch: SVG already has `width="112" height="112"`. No change.

2. **Head meta hardening** (`partials/head.html`)
   - After `<title>`, add:
     ```html
     <link rel="canonical" href="{{ .Permalink }}" />
     <meta name="robots" content="{{ site.Params.robots | default `index,follow` }}" />
     {{- with site.Params.themeColor }}
     <meta name="theme-color" content="{{ . }}" />
     {{- end }}
     ```
   - In OG block, after `og:image` resolution, add:
     ```html
     <meta property="og:url" content="{{ .Permalink }}" />
     ```
   - Before the stylesheet link, add:
     ```html
     {{- if and site.Params.avatar (ne (site.Params.preloadAvatar | default true) false) }}
     <link rel="preload" as="image" href="{{ site.Params.avatar | strings.TrimPrefix "/" | relURL }}" fetchpriority="high" />
     {{- end }}
     ```

3. **Skip-link** (`layouts/_default/baseof.html`)
   - Replace `<main class="bonsai">` with `<main class="bonsai" id="main">`.
   - Add `<a class="skip-link" href="#main">{{ i18n "skip_to_content" | default "Skip to content" }}</a>` as first child of `<body>`.

4. **Skip-link CSS** (`static/css/bonsai.css`)
   - Append:
     ```css
     .skip-link {
       position: absolute;
       top: -3rem;
       left: .5rem;
       padding: .5rem 1rem;
       background: var(--bonsai-accent);
       color: var(--bonsai-bg);
       border-radius: var(--bonsai-radius);
       text-decoration: none;
       z-index: 100;
       transition: top .15s ease;
     }
     .skip-link:focus { top: .5rem; outline: 2px solid var(--bonsai-text); outline-offset: 2px; }
     @media (prefers-reduced-motion: reduce) { .skip-link { transition: none; } }
     ```

5. **i18n keys** (`i18n/en.toml`, `i18n/vi.toml`)
   - en: `[skip_to_content] other = "Skip to content"`
   - vi: `[skip_to_content] other = "Bỏ qua tới nội dung"`

6. **Deploy templates** (`docs/deployment-guide.md`, `exampleSite/static/_headers`, `exampleSite/vercel.json`)
   - `_headers`:
     ```
     /*
       Cache-Control: public, max-age=3600, must-revalidate
       X-Content-Type-Options: nosniff
       X-Frame-Options: SAMEORIGIN
       Referrer-Policy: strict-origin-when-cross-origin
       Permissions-Policy: camera=(), microphone=(), geolocation=()
       Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; frame-ancestors 'self'
     /css/*
       Cache-Control: public, max-age=31536000, immutable
     /js/*
       Cache-Control: public, max-age=31536000, immutable
     /images/*
       Cache-Control: public, max-age=31536000, immutable
     ```
   - `vercel.json`: equivalent JSON form.
   - `docs/deployment-guide.md`: explain each header, note `'unsafe-inline'` is required only when `params.themeToggle = true` (inline FOUC script) — strict CSP achievable by removing themeToggle or using SRI/nonce.

7. **README + exampleSite update**
   - README: add rows to params table for `themeColor`, `robots`, `preloadAvatar`.
   - `exampleSite/hugo.toml`: add `themeColor = "#8b3a2b"` (matches default bonsai palette) and a commented-out `# robots = "index,follow"`.

8. **Build verification**
   - `cd exampleSite && hugo --themesDir ../.. --gc --minify` should still produce green build.
   - `curl -sI` against built `public/index.html` post-deploy to verify header file applied (CI step).

## Todo List

- [ ] Add avatar `width/height/fetchpriority/decoding` attrs (`partials/avatar.html`)
- [ ] Add canonical, og:url, robots, theme-color meta (`partials/head.html`)
- [ ] Add optional avatar preload (`partials/head.html`)
- [ ] Add skip-link + `id="main"` (`baseof.html`)
- [ ] Append skip-link CSS (`static/css/bonsai.css`)
- [ ] Add `skip_to_content` i18n key (en, vi)
- [ ] Create `_headers` + `vercel.json` deploy templates
- [ ] Write `docs/deployment-guide.md` with security-header rationale
- [ ] Update README params table
- [ ] Update `exampleSite/hugo.toml` to showcase new params
- [ ] Verify CSS budget still ≤ 5 KB gzipped after skip-link rule

## Success Criteria

- [ ] `curl -s {site} | grep -c 'rel="canonical"'` returns 1
- [ ] `curl -s {site} | grep -c 'property="og:url"'` returns 1
- [ ] `curl -s {site} | grep -c 'name="robots"'` returns 1
- [ ] Avatar `<img>` has `width`, `height`, `fetchpriority`, `decoding` attrs
- [ ] Skip-link visible on Tab keypress, hidden otherwise
- [ ] Lighthouse SEO category ≥ 90 on exampleSite demo (canonical alone adds +10)
- [ ] Lighthouse Performance LCP improved measurably (fetchpriority effect)
- [ ] No regressions: `hugo --gc --minify` clean build
- [ ] CSS production size delta ≤ +200 B raw / +40 B gzipped

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| `params.preloadAvatar` default-on could preload unused image if avatar unset | Guarded: only emits `<link rel="preload">` when `params.avatar` is set. |
| Skip-link reveal animation conflicts with reduced-motion | `@media (prefers-reduced-motion: reduce)` clause disables transition. |
| Permissive `'unsafe-inline'` CSP for themeToggle FOUC inline script | Documented in deployment-guide; users can drop `themeToggle` to tighten. |
| `<meta name="theme-color">` not palette-aware (only one color even when 4 palettes ship) | Documented limitation. Per-palette theme-color would need JS or extra params. KISS: ship single user-set value. |
| Existing sites set `params.themeColor` already and expect different behavior | Param name not previously used — grep across user sites unknowable, but unlikely collision. |

## Security Considerations

- CSP template in `_headers` permits `'unsafe-inline'` for scripts (required by the inline FOUC script when `themeToggle = true`) and styles (required by inline SVG `style=` attrs in avatar partial). Documented as the trade-off.
- `referrer-policy: strict-origin-when-cross-origin` prevents leaking full URLs to external link targets.
- `permissions-policy` blocks camera/mic/geo by default — bio pages don't need them.
