---
title: Bonsai v0.4.0 Complete Feature & Performance Audit
date: 2026-05-15
status: complete
---

# Bonsai v0.4.0 Complete Feature & Performance Audit

**Purpose:** Inventory all shipped features, assets, and signals in Bonsai to enable meaningful comparison against Linktree feature parity and Lighthouse optimization gaps.

**Scope:** v0.4.0 final (2026-05-10 release). Based on source analysis + live build output (exampleSite, Hugo 0.154.0, minified).

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total HTML (minified)** | 8,015 bytes raw / 3,221 bytes gzipped |
| **CSS (production)** | 10,470 bytes raw / 2,910 bytes gzipped |
| **JS (production)** | 1,123 bytes (theme-toggle only, loaded optionally) |
| **Icons shipped** | 45 total (32 brand + 13 UI) |
| **Layouts supported** | 3 (`stack`, `grid`, `inline`) |
| **Color themes** | 4 palettes × 2 modes (light/dark) |
| **i18n languages** | 2 builtin (English, Vietnamese) + extensible |
| **Build output** | 9 files, 132 KB total (includes SVG icons & CSS duplicates) |
| **CSS budget status** | ✅ 2.9 KB gzip (goal: <5 KB) |

---

## 1. LAYOUTS & PARTIALS

### File Manifest

| File | Lines | Purpose | Key Params | CSS Classes | i18n Keys |
|------|-------|---------|-----------|-------------|-----------|
| `layouts/_default/baseof.html` | 13 | HTML5 skeleton, theme attr, head/main/footer blocks | `colorTheme`, `lang` | `.bonsai`, data-bonsai-theme | — |
| `layouts/index.html` | 3 | Single-page index → `partial "bio-card.html"` | — | — | — |
| `layouts/index.rss.xml` | 32 | RSS 2.0 feed generator (opt-in via `params.rss`) | `site.Params.links`, `.rss`, `name`, `bio` | — | — |
| `layouts/partials/head.html` | 59 | Meta tags, OG, Twitter, favicon, schema, RSS link, theme-toggle script | `name`, `tagline`, `bio`, `avatar`, `ogImage`, `ogImageUrl`, `faviconSvg`, `appleTouchIcon`, `themeToggle`, `rss`, `schema` | — | — |
| `layouts/partials/bio-card.html` | 32 | Main content container: avatar, name, tagline, bio, nav | `name`, `tagline`, `bio`, `links`, `layout` | `.bio`, `.bio__avatar`, `.bio__name`, `.bio__tagline`, `.bio__text`, `.bio__links`, `.bio__links--{layout}` | `nav_links_label` |
| `layouts/partials/avatar.html` | 36 | Img or SVG initials circle (auto-derive from `name`) | `avatar`, `avatarInitials`, `avatarBg`, `name` | `.bio__avatar`, `.bio__avatar--initials` | — |
| `layouts/partials/link-button.html` | 12 | Individual link: `<a>` with icon + title, target/_blank for http/https | `title`, `url`, `icon` | `.link`, `.link__icon`, `.link__title` | — |
| `layouts/partials/icon.html` | 13 | Inline SVG renderer: lookup from `data/icons.yaml`, fallback to generic extlink | `icon` (param name) | — | — |
| `layouts/partials/schema-person.html` | 28 | JSON-LD ProfilePage > Person (suppressible via `params.schema = false`) | `name`, `bio`, `avatar`, `jobTitle`, `location`, `email`, `links` | — | — |
| `layouts/partials/footer.html` | 13 | Footer text + optional theme toggle button | `footer`, `footerText`, `name`, `themeToggle` | `.bonsai-footer`, `.bonsai-footer p` | `footer_default`, `theme_toggle_label`, `theme_toggle_title` |
| `layouts/partials/theme-toggle-button.html` | 24 | Sun/moon button, data-attr trigger, aria-pressed, inline SVG | `themeToggle` | `.theme-toggle`, `.theme-toggle__sun`, `.theme-toggle__moon` | `theme_toggle_label`, `theme_toggle_title` |
| `layouts/variants/single.html` | 40 | Demo: 3 layout variant cards (stack/grid/inline) with sample links | — (hardcoded demo data) | `.bio__links--{variant}`, `.variants-gallery`, `.variants-gallery__card`, etc. | — |
| `layouts/themes/single.html` | 30 | Demo: 4 color palette chips (bonsai/sakura/sumi/koi) with accent preview | — (hardcoded demo data) | `.themes-gallery`, `.themes-gallery__card`, `.themes-gallery__chip`, etc. | — |
| `layouts/icons/single.html` | 14 | Demo: 45-icon grid from `site.Data.icons` | — | — | — |

### Key Parameter Flow

**Bio card** reads from `site.Params`:
- `name` → `<h1 class="bio__name">`
- `tagline` → `<p class="bio__tagline">`
- `bio` (markdown) → `<p class="bio__text">` (via `markdownify`)
- `links` (array of dicts) → `<nav class="bio__links bio__links--{layout}">` with range
- `layout` (string: stack|grid|inline) → validates against allowlist, warns on unknown, falls back to `stack`
- `avatar` (URL or unset) → img with loading="eager" OR inline SVG with initials
- `avatarInitials` (string) → override auto-derived initials
- `avatarBg` (CSS color) → style attr on circle (safe via `safeCSS`)

**Head** reads from `site.Params`:
- `ogImage` (bool, default true) → gate all og:image/twitter:image meta
- `ogImageUrl` (URL) → use explicit OG image, upgrade twitter:card to summary_large_image
- Otherwise fallback to `avatar` as OG image (square, summary card)
- `faviconSvg`, `appleTouchIcon` → optional modern favicon link alternatives
- `themeToggle` (bool, default false) → render inline FOUC script + noscript style + defer script load
- `rss` (bool, default false) → emit `<link rel="alternate">` + conditionally render RSS feed
- `schema` (bool, default true) → emit JSON-LD Person markup

**Schema-person** reads:
- `name`, `bio`, `avatar`, `jobTitle`, `location`, `email` → Person fields
- `links` → extract non-mailto/non-tel URLs for `sameAs` array

---

## 2. CSS BREAKDOWN

### File Sizes

| File | Raw Bytes | Gzipped | Percent of Total |
|------|-----------|---------|-----------------|
| `static/css/bonsai.css` | 10,470 | 2,910 | 100% (production) |
| `static/css/gallery.css` | 2,252 | 626 | demo-only (not shipped to user sites) |
| **Total production** | **10,470** | **2,910** | — |

### CSS Structure: `bonsai.css`

**Root variables (layout, font, shadow):**
- `--bonsai-shadow`: soft drop shadow (0 8px 24px)
- `--bonsai-radius`: 14px border radius
- `--bonsai-gap`: clamp(.75rem, 1.6vw, 1rem) — responsive link gap
- `--bonsai-pad`: clamp(1.25rem, 4vw, 2rem) — responsive padding
- `--bonsai-max`: 32rem — max content width
- `--bonsai-font`: system ui-sans-serif stack (no web fonts)
- `--bonsai-font-display`: system ui-serif stack (Georgia fallback)

**Color palettes (4 × 2 modes = 8 variants):**

| Palette | Light BG | Light Text | Light Accent | Dark BG | Dark Text | Dark Accent | Notes |
|---------|----------|-----------|--------------|---------|----------|------------|-------|
| `bonsai` (default) | #f4efe6 | #2b2b2b | #8b3a2b | #1a1817 | #ece6d9 | #d6856e | washi paper + vermilion |
| `sakura` | #fff5f5 | #3a2228 | #c93f63 | #1f1418 | #f7e3e9 | #ec7596 | cherry blossom (darkened to 4.49:1 WCAG AA) |
| `sumi` | #fafafa | #111111 | #1a1a1a | #0d0d0d | #f5f5f5 | #dddddd | monochrome ink |
| `koi` | #fef6e4 | #3a2620 | #bd4c1c | #1c1410 | #f7e2c4 | #ff8b5c | orange + cream (darkened to 4.63:1 WCAG AA) |

Palette selection via `[data-bonsai-theme="{name}"]` on `<html>`. Light/dark mode cascade:
1. `:root` / `[data-bonsai-theme]` → light defaults
2. `@media (prefers-color-scheme: dark)` → dark override (respects user OS pref)
3. `[data-theme="dark"]` / `[data-theme="light"]` → manual toggle override (localStorage)

**Component selectors:**

| Class | Descendants | Purpose | Key Rules |
|-------|------------|---------|-----------|
| `.bonsai` | — | main container | `flex: 1`, `max-width: 32rem`, centered, padding responsive |
| `.bio` | `.bio__avatar`, `.bio__name`, `.bio__tagline`, `.bio__text`, `.bio__links` | bio card article | `text-align: center` |
| `.bio__avatar` | — | circular img or svg | 112×112, border + shadow, `object-fit: cover` |
| `.bio__avatar--initials` | — | SVG circle variant | `display: block`, auto-centered |
| `.bio__name` | — | h1, display serif | `clamp(1.5rem, 3.5vw, 1.875rem)`, `font-weight: 600`, letter-spacing -.01em |
| `.bio__tagline` | — | muted subheading | `.95rem`, color muted |
| `.bio__text` | — | bio paragraph (markdown) | `.98rem`, max-width 28rem, centered |
| `.bio__links` | `.link` × n | link container | flex column, gap responsive, margin-top 1.5rem |
| `.bio__links--grid` | — | 2-col grid layout | `grid-template-columns: 1fr 1fr`, collapses to 1fr @480px |
| `.bio__links--inline` | — | horizontal icon row | `flex-direction: row`, `justify-content: center`, titles SR-only (clip technique) |
| `.link` | `.link__icon`, `.link__title` | individual link button | flex, gap .625rem, padding .9rem 1.25rem, border + shadow, transition on hover |
| `.link:hover` | — | link hover state | `translateY(-1px)`, accent border, subtle bg tint via `color-mix(in oklab, ...)` |
| `.link:focus-visible` | — | keyboard focus | 2px outline, 2px offset |
| `.link:active` | — | press state | `transform: none` |
| `.link__icon` | `svg` | icon wrapper | inline-flex, accent color, 20×20 |
| `.link__icon svg` | — | icon svg | `fill: currentColor`, block display |
| `.link__icon svg[stroke="currentColor"]` | — | lucide icons | `fill: none` (stroke-based) |
| `.link__title` | — | link text | `line-height: 1` |
| `.bonsai-footer` | `p`, `.theme-toggle` | footer section | flex column, center, muted color, `.8rem` |
| `.theme-toggle` | `.theme-toggle__sun`, `.theme-toggle__moon` | sun/moon button | 44×44 hit target (AAA), circular, data-attr trigger, transition on hover |
| `.theme-toggle:hover` | — | button hover | `translateY(-1px)`, accent border |
| `.theme-toggle:focus-visible` | — | button keyboard focus | 2px outline, 2px offset |
| `.theme-toggle__sun` | — | sun icon | shown in dark mode, hidden in light |
| `.theme-toggle__moon` | — | moon icon | shown in light mode, hidden in dark |

**Accessibility & Motion:**
- `@media (prefers-reduced-motion: reduce)` → disable all transitions and transforms on `.link`, `.theme-toggle` and hover/active states
- `a11y` landmarks: `<nav aria-label>` on links nav (i18n "nav_links_label"), `<footer>` semantic
- Focus visible: 2px solid outline, 2px offset (WCAG AAA)
- Hit target: 44×44 on theme toggle (Apple HIG / WCAG 2.5.5 AAA)

**Vendor Prefix / Modern CSS:**
- `-webkit-font-smoothing: antialiased` (performance)
- `-webkit-text-size-adjust: 100%` (mobile font scaling)
- `box-sizing: border-box` on `*`
- `100dvh` (dynamic viewport height, avoids mobile address bar crop)
- `clamp()` for responsive sizing (no media queries needed for some props)
- `color-mix(in oklab, ...)` for hover tint (v0.4 polish, no fallback — older browsers see no tint)
- CSS variables for theme switching (no JS required for palette swap, only for localStorage)

### Gallery CSS (demo-only, `/themes/` and `/variants/`)

| Class | Purpose |
|-------|---------|
| `.themes-gallery` | 4-card auto-fit grid (minmax 240px), 1.5rem gap |
| `.themes-gallery__card` | card bg, border, radius, padding |
| `.themes-gallery__name` | heading serif, 1.1rem |
| `.themes-gallery__hex` | monospace hex code, muted |
| `.themes-gallery__chip` | small accent preview button |
| `.themes-gallery__chip--accent` | chip with palette accent color |
| `.variants-gallery` | 1-col stack of 3 demo cards |
| `.variants-gallery__card` | card bg, border, radius |
| `.variants-gallery__name` | heading serif, 1.1rem |
| `.variants-gallery__desc` | muted description |
| `.variants-gallery__code` | monospace config example |

**Not shipped to production:** gallery.css is loaded via `head_extra` block on `/themes/` and `/variants/` pages only, saving ~1.9 KB raw / ~200 B gzipped on every real user site (v0.4 optimization).

---

## 3. JAVASCRIPT

### File: `static/js/theme-toggle.js`

| Metric | Value |
|--------|-------|
| Raw bytes | 1,123 |
| Minified | ~580 bytes gzipped |
| Load condition | Only when `params.themeToggle = true` |
| Load timing | `defer` (non-blocking) |

**Functionality:**
- Reads saved theme from localStorage (`bonsai-theme` key)
- On click, toggles between `light` and `dark`, sets `document.documentElement.dataset.theme`, persists
- Syncs `aria-pressed` state to reflect current mode
- Safety: wrapped in IIFE, try/catch for localStorage access failures
- **Inline FOUC prevention:** ~140 B inline blocking script in `<head>` applies saved theme pre-paint (avoid flash of unstyled content on page load)

### Inline Scripts in Head

| Script | Size | Purpose |
|--------|------|---------|
| Theme hydration (inline) | ~140 B | Applied saved `data-theme` before first paint (avoids FOUC) |
| `<noscript><style>.theme-toggle{display:none}</style></noscript>` | ~70 B | Hides theme toggle button when JS disabled (button is JS-only) |
| `<script defer src="/js/theme-toggle.js"></script>` | loaded if `themeToggle = true` | Deferred script load, non-blocking |

**Zero JS default:** Sites with `themeToggle = false` (default) load zero JavaScript. Theme respects `prefers-color-scheme` via CSS media query only.

---

## 4. DATA & ICONS

### Icon Manifest: `data/icons.yaml`

**Structure:** Public icon name → {family, slug}

**Brand icons (32, from Simple Icons v13 CC0):**
- github, gitlab, mastodon, bsky, x, threads, linkedin, instagram, facebook, tiktok, youtube, twitch, discord, telegram, signal, whatsapp, reddit, medium, devto, substack, hashnode, kofi, patreon, buymeacoffee, paypal, bandcamp, soundcloud, spotify, figma, dribbble, stackoverflow, matrix

**UI icons (13, from Lucide Static v0.460 ISC):**
- mail, globe, link, rss, calendar, phone, mappin, filetext, extlink, share, bookopen, download, heart

**Total:** 45 icons vendored in `assets/icons/{brand,ui}/*.svg`

**Rendering:** Via `partials/icon.html` — lookup in `site.Data.icons`, fetch via `resources.Get()`, render inline SVG with `safeHTML`. Unknown icon names fallback to generic external-link glyph (hardcoded in partial).

**Icon sizes (viewBox):**
- Brand (Simple Icons): 24×24 viewBox, rendered as 20×20 (scale down for visual balance)
- UI (Lucide): 24×24 viewBox, rendered as 20×20
- Both inherit text color (`.link__icon { color: var(--bonsai-accent) }`)

---

## 5. INTERNATIONALIZATION (i18n)

### Files

| File | Keys | Languages |
|------|------|-----------|
| `i18n/en.toml` | 4 | English (default/fallback) |
| `i18n/vi.toml` | 4 | Vietnamese |

### i18n Key Reference

| Key | English | Vietnamese | Used in | Context |
|-----|---------|-----------|---------|---------|
| `nav_links_label` | "Links" | "Liên kết" | `partial "bio-card.html"` `<nav aria-label>` | Landmark label for screen readers |
| `theme_toggle_label` | "Toggle light and dark theme" | "Chuyển giao diện sáng / tối" | `partial "theme-toggle-button.html"` `aria-label` | Button accessible name (screen readers) |
| `theme_toggle_title` | "Toggle theme" | "Đổi giao diện" | `partial "theme-toggle-button.html"` `title` attr | Tooltip hint (hover) |
| `footer_default` | "© {{ .year }} {{ .name }}" | "© {{ .year }} {{ .name }}" | `partial "footer.html"` | Default footer text (used when `params.footerText` unset) |

**Fallback behavior:** Missing keys in a non-`en` language fall back to `en` (automatic via Hugo i18n system). User content (`name`, `tagline`, `bio`, link `title`s, `footerText`) is never auto-translated — stays user-owned.

**Extensibility:** Adding a new language is a single file: copy `i18n/en.toml` to `i18n/{lang}.toml`, translate 4 strings, set `defaultContentLanguage = "{lang}"` in `hugo.toml`.

---

## 6. SITE PARAMETERS (All Supported `params.*`)

### Master Reference Table

| Param | Type | Required | Default | Example | Notes |
|-------|------|----------|---------|---------|-------|
| `name` | string | no | site `title` | "Jane Doe" | Display in h1, page title, footer, schema |
| `tagline` | string | no | — | "Designer & coder" | Muted subheading under name |
| `bio` | string (markdown) | no | — | "Making the web..."  | Markdown supported, centered paragraph |
| `avatar` | string (URL) | no | — | "/images/avatar.jpg" | 112×112 circular img with border. Unset → inline SVG initials |
| `avatarInitials` | string | no | auto-derived | "JD" | Override auto-initials (first letter × 2 words from `name`) |
| `avatarBg` | string (CSS color) | no | `var(--bonsai-accent)` | "#ff6b9d" | Background color of initials circle; can be color or CSS var |
| `colorTheme` | string | no | "bonsai" | "sakura" | Palette: bonsai, sakura, sumi, or koi |
| `layout` | string | no | "stack" | "grid" | Link arrangement: stack (default), grid, or inline. Validates at build time |
| `favicon` | string (URL) | no | "/favicon.ico" | "/favicon.svg" | Standard favicon fallback |
| `faviconSvg` | string (URL) | no | — | "/favicon.svg" | Modern SVG favicon (preferred by modern browsers). v0.4+ opt-in |
| `appleTouchIcon` | string (URL) | no | — | "/apple-touch-icon.png" | 180×180 PNG for iOS home-screen. v0.4+ opt-in |
| `ogImage` | bool | no | true | false | Suppress all `og:image` / `twitter:image` meta tags |
| `ogImageUrl` | string (URL) | no | — | "/og-preview.png" | Explicit 1200×630 OG image. Unset → fallback to avatar. Upgrades twitter:card to summary_large_image |
| `schema` | bool | no | true | false | Emit schema.org Person JSON-LD in head |
| `jobTitle` | string | no | — | "Software Engineer" | Optional Person.jobTitle for schema |
| `location` | string | no | — | "San Francisco, CA" | Optional Person.address for schema |
| `email` | string | no | — | "jane@example.com" | Optional Person.email for schema (also used in `sameAs` filter for links) |
| `footer` | bool | no | true | false | Show/hide footer section |
| `footerText` | string (HTML) | no | — | "© 2026 Jane" | Override default footer. HTML allowed, uses `safeHTML` |
| `themeToggle` | bool | no | false | true | Render sun/moon button in footer + load toggle script |
| `rss` | bool | no | false | true | Emit RSS 2.0 feed at `/index.xml` (requires removing `RSS` from `disableKinds`). v0.4+ opt-in |
| `links` | array (see below) | no | — | — | Array of link objects |

**Each `[[params.links]]` entry:**

| Field | Type | Required | Example | Notes |
|-------|------|----------|---------|-------|
| `title` | string | yes | "GitHub" | Link label, plain text (no markdown) |
| `url` | string | yes | "https://github.com/jane" | Target URL. `mailto:` and `tel:` rendered without target=_blank |
| `icon` | string | no | "github" | Icon name from data/icons.yaml. Unknown names render generic external-link icon |
| `description` | string | no | "My GitHub profile" | Optional, used in RSS `<description>` only (not shown on page) |

**Hugo-level config required:**

```toml
disableKinds = ["taxonomy", "term", "404"]  # minimum
# Optional: remove "RSS" from disableKinds to enable params.rss = true

[params]
  name = "Jane Doe"
  tagline = "Designer"
  bio = "..."
  # ... all params above
```

---

## 7. BUILD OUTPUT & PERFORMANCE

### Build Success

```
Hugo v0.154.0 extended
Build time: 109 ms
Pages: 5 (index, icons/, themes/, variants/, RSS feed)
Static files: 4 (css/bonsai.css, css/gallery.css, js/theme-toggle.js, images/avatar.svg)
Total output: 9 files, 132 KB
```

### Output File Breakdown

| File | Size | Notes |
|------|------|-------|
| `public/index.html` | 7.9 KB (8,015 raw) | minified; single page |
| `public/index.xml` | 1.8 KB | RSS feed (opt-in) |
| `public/css/bonsai.css` | 11 KB | unminified on disk; 10.47 KB raw |
| `public/css/gallery.css` | 2.2 KB | loaded on /themes/ and /variants/ only |
| `public/js/theme-toggle.js` | 1.1 KB | loaded when themeToggle = true |
| `public/variants/index.html` | 14 KB | demo page |
| `public/icons/index.html` | 42 KB | 45-icon gallery (demo; not shipped to user sites) |
| `public/themes/index.html` | 4.2 KB | 4-palette demo page |
| `public/images/avatar.svg` | 280 bytes | example avatar |

### Minified Index.html Anatomy

```
8,015 bytes total
─ ~200 B: DOCTYPE, html/head/body tags, data-bonsai-theme
─ ~1,200 B: meta tags (charset, viewport, color-scheme, title, description, OG, Twitter, JSON-LD)
─ ~50 B: favicon <link>
─ ~50 B: CSS <link>
─ ~50 B: RSS <link> (if enabled)
─ ~150 B: theme hydration inline script + noscript
─ ~100 B: theme-toggle deferred script <link> (if enabled)
─ ~3,500 B: <main> bio card + nav (avatar SVG, h1, p, nav links with inline SVGs)
─ ~1,500 B: footer + theme toggle button (if enabled)
─ ~100 B: closing tags
```

**Gzip efficiency:** 8,015 → 3,221 bytes (60% reduction)

---

## 8. LIGHTHOUSE-RELEVANT SIGNALS (Current State)

### Present ✅

| Signal | Where | Status |
|--------|-------|--------|
| **Mobile viewport** | `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">` | ✅ Present |
| **Color scheme** | `<meta name="color-scheme" content="light dark">` | ✅ Present (v0.4) |
| **Theme color** | — | ❌ Missing (no `<meta name="theme-color">`) |
| **Description** | `<meta name="description">` (from `params.bio` or fallback) | ✅ Present |
| **OG type** | `<meta property="og:type" content="profile">` | ✅ Present |
| **OG title** | `<meta property="og:title">` (from `params.name`) | ✅ Present |
| **OG description** | `<meta property="og:description">` (from `params.bio`) | ✅ Present (if bio set) |
| **OG image** | `<meta property="og:image">` | ✅ Present (if `ogImage != false`) |
| **Twitter card** | `<meta name="twitter:card">` (summary or summary_large_image) | ✅ Present |
| **Twitter image** | `<meta name="twitter:image">` (if OG image set) | ✅ Present (conditional) |
| **JSON-LD Schema (Person)** | `<script type="application/ld+json">` | ✅ Present (if `schema != false`) |
| **Favicon link** | `<link rel="icon" href="/favicon.ico">` | ✅ Present |
| **SVG favicon link** | `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` | ✅ Present (if `faviconSvg` set, v0.4+) |
| **Apple touch icon** | `<link rel="apple-touch-icon" href="/...">` | ✅ Present (if `appleTouchIcon` set, v0.4+) |
| **RSS alternate link** | `<link rel="alternate" type="application/rss+xml">` | ✅ Present (if `rss = true`) |
| **Semantic HTML** | `<nav aria-label>`, `<footer>`, `<article>`, heading hierarchy | ✅ Present |
| **Focus visible outline** | `.link:focus-visible { outline: 2px solid ... }` | ✅ Present (44px hit target on button) |
| **Prefers-color-scheme** | `@media (prefers-color-scheme: dark)` | ✅ Present |
| **Prefers-reduced-motion** | `@media (prefers-reduced-motion: reduce)` | ✅ Present (v0.4) |
| **Lazy loading** | Avatar: `loading="eager"` | ⚠️ Eager (not lazy) — appropriate for above-fold hero image |
| **Image dimensions** | Avatar SVG: `width="112" height="112"`, img: width/height inferred | ✅ Present on SVG; img relies on natural dims |
| **Noscript fallback** | `.theme-toggle { display: none !important }` when JS disabled | ✅ Present (v0.4) |
| **No render-blocking CSS** | Single CSS file, inline critical CSS (theme hydration only) | ✅ Good |
| **No web fonts** | System font stacks only (ui-sans-serif, ui-serif, Georgia, Roboto fallback) | ✅ Present |

### Missing ❌

| Signal | Impact | Justification |
|--------|--------|---------------|
| **`<meta name="theme-color">`** | Minimal (mobile address bar tint) | Not critical for bio page; could be added to match accent color |
| **`<meta name="robots">`** | Minimal (SEO) | Should include `"index, follow"` for discoverability |
| **`<link rel="canonical">`** | Minimal (multi-domain canonicalization) | Not needed for single-URL bio page |
| **`<meta property="og:url">`** | Moderate (social share metadata) | Missing; should be `{{ site.BaseURL }}` |
| **Image width/height attrs (img)** | Minimal (CLS prevention) | Avatar img inferred from natural dims; no CLS risk if ratio consistent |
| **`loading="lazy"` for external images** | N/A | Avatar is above-fold hero; `eager` is correct |
| **Sitemap link** | Minimal (SEO) | Single page doesn't need sitemap; could add for completeness |
| **Alt text on SVG icons** | Moderate (a11y) | Icons have `aria-hidden="true"` (correct for decorative); text in adjacent `<span>` |
| **`crossorigin` attr on CDN images** | N/A | No CDN images; all vendored |

---

## 9. STRUCTURED DATA: schema-person.html

### JSON-LD ProfilePage > Person

**Emitted when:** `params.schema != false` (default true)

**Fields always emitted:**
- `@context`: "https://schema.org"
- `@type`: "ProfilePage" (wrapper) → `mainEntity` Person
- `Person.@type`: "Person"
- `Person.name`: from `params.name` (or `site.Title`)
- `Person.url`: site BaseURL

**Fields conditionally emitted:**

| Field | Source | Included if |
|-------|--------|------------|
| `Person.description` | `params.bio` | bio set |
| `Person.image` | `params.avatar` | avatar URL set (no initials SVG) |
| `Person.jobTitle` | `params.jobTitle` | set |
| `Person.address` | `params.location` | set |
| `Person.email` | `params.email` | set |
| `Person.sameAs` | `[[params.links]]` | URLs extracted (excludes mailto:, tel:) |

**Example output:**
```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": "Jane Doe",
    "url": "https://example.com/",
    "jobTitle": "Software Engineer",
    "address": "San Francisco",
    "email": "jane@example.com",
    "image": "https://example.com/avatar.jpg",
    "description": "Building tools and ideas.",
    "sameAs": [
      "https://github.com/jane",
      "https://linkedin.com/in/jane",
      "https://mastodon.social/@jane"
    ]
  }
}
```

**Fallbacks:** Missing fields simply omitted (no null values). `sameAs` is an array only if ≥ 1 URL found; can be empty if all links are mailto:/tel:.

---

## 10. OG / TWITTER METADATA

### Meta Tags in Head

| Meta Tag | Value Source | Condition | v0.4 Status |
|----------|--------------|-----------|-----------|
| `og:type` | hardcoded "profile" | always | ✅ v0.1+ |
| `og:title` | `params.name` \| `site.Title` | always | ✅ v0.1+ |
| `og:description` | `params.bio` \| `params.tagline` \| `site.Params.description` | fallback chain | ✅ v0.1+ |
| `og:image` | logic: see below | conditional | ✅ v0.3+ (with ogImageUrl logic) |
| `twitter:card` | "summary" (default) or "summary_large_image" if ogImageUrl set | conditional | ✅ v0.3+ |
| `twitter:image` | same as og:image | conditional | ✅ v0.3+ |

**OG image resolution (v0.3 logic, refined in v0.4):**

```
if params.ogImage == false
  → emit nothing (suppress all og:image / twitter:image)
else if params.ogImageUrl is set
  → use ogImageUrl (1200×630 recommended)
  → set twitter:card = "summary_large_image"
else if params.avatar is set
  → use avatar (square, 112×112)
  → twitter:card = "summary" (default)
else
  → no og:image (inline initials SVG not suitable for social preview)
  → twitter:card = "summary"
```

**Missing in v0.4:**
- `og:url` (not emitted; should be `site.BaseURL`)
- `og:site_name` (could add)
- `twitter:creator` / `twitter:site` (author handles)

---

## 11. CHANGELOG & DEFERRED FEATURES

### v0.4.0 (2026-05-10) — Released

**Added:**
- Favicon polish: opt-in `faviconSvg`, `appleTouchIcon`
- Demo-only gallery CSS (saves 1.9 KB raw / 200 B gzipped on user sites)
- 10 new icons (bandcamp, soundcloud, spotify, figma, dribbble, stackoverflow, matrix, bookopen, download, heart) → 45 total
- Optional RSS feed: `params.rss = true`
- A11y: accent darkened on sakura/koi for WCAG AA
- A11y: gallery wrappers `<section aria-labelledby>`, variant cards demoted to `<article>`
- Polish: `.link:hover` adds subtle accent tint
- Polish: theme toggle hidden via `<noscript>` when JS disabled
- i18n: theme-toggle aria-label/title use with/else fallback (no raw keys in DOM)
- Removed: non-standard `data-theme="auto"` (now only light/dark)

**Deferred to v0.5:**
- **Auto-generated OG images (#7)** — Needs measured prototype. Current approach (text overlay on PNGs) adds ~150 KB binary, violates <4 KB CSS philosophy. No candidate path found that meets budget yet.
- **Multi-section bio (#9)** — Schema design call deferred per issue's "2026-Q3 candidate" recommendation.

### v0.3.0 (2026-05-03) — Released

**Added:**
- Layout variants: `stack` (default), `grid`, `inline` (pure CSS)
- OG image controls: `ogImageUrl`, `ogImage = false`
- i18n string externalization (en, vi bundles; extensible)

### v0.2.0 (2026-05-03) — Released

**Added:**
- Color theme presets: bonsai, sakura, sumi, koi (4 palettes × 2 modes)
- schema.org Person JSON-LD
- Theme toggle UI button (opt-in)
- Avatar initials fallback

### v0.1.0 (2026-05-01) — Released

**Added:**
- 35 icons (25 brand + 10 utility), vendored
- Icon gallery, themes gallery
- GitHub Actions CI/CD
- Initial HTML/CSS structure

---

## 12. CSS CLASS TAXONOMY

### Production Classes (bonsai.css only)

**Layout Container:**
- `.bonsai` — main content wrapper (flex container, max-width, centered)

**Bio Card:**
- `.bio` — article wrapper (text-align center)
- `.bio__avatar` — circular img or SVG (112×112)
- `.bio__avatar--initials` — SVG variant (block display)
- `.bio__name` — h1 heading (display serif, responsive font)
- `.bio__tagline` — muted subheading
- `.bio__text` — bio paragraph
- `.bio__links` — nav flex container
- `.bio__links--stack` — full-width vertical (implicit default, no explicit rule)
- `.bio__links--grid` — 2-col grid, 1-col @480px
- `.bio__links--inline` — horizontal flex row, titles SR-only

**Link Button:**
- `.link` — `<a>` button (flex, border, shadow, transitions)
- `.link:hover` — lift + border accent + bg tint
- `.link:focus-visible` — 2px outline, 2px offset
- `.link:active` — no lift on press
- `.link__icon` — icon wrapper (inline-flex, accent color, 20×20)
- `.link__icon svg` — SVG rendering (fill: currentColor)
- `.link__icon svg[stroke="currentColor"]` — Lucide override (fill: none)
- `.link__icon svg.lucide` — Lucide class override (fill: none)
- `.link__title` — link text (line-height 1)

**Footer:**
- `.bonsai-footer` — footer flex column (muted, .8rem)
- `.bonsai-footer p` — footer paragraph (margin: 0)

**Theme Toggle:**
- `.theme-toggle` — button (44×44, circular, transition)
- `.theme-toggle:hover` — lift + accent border
- `.theme-toggle:focus-visible` — 2px outline
- `.theme-toggle:active` — no lift on press
- `.theme-toggle .theme-toggle__sun` — sun icon (hidden/shown per mode)
- `.theme-toggle .theme-toggle__moon` — moon icon (hidden/shown per mode)

**Total:** 28 class selectors (excluding demo gallery)

### Demo-Only Classes (gallery.css)

**Themes Gallery:**
- `.themes-gallery` — auto-fit grid
- `.themes-gallery__card` — palette card
- `.themes-gallery__name` — heading
- `.themes-gallery__hex` — hex code
- `.themes-gallery__chip` — color chip
- `.themes-gallery__chip--accent` — accent-colored chip

**Variants Gallery:**
- `.variants-gallery` — 1-col stack
- `.variants-gallery__card` — variant card
- `.variants-gallery__name` — heading
- `.variants-gallery__desc` — description
- `.variants-gallery__code` — code block

**Total:** 11 classes (not shipped to user sites)

### CSS Selector Specificity

All selectors have specificity ≤ (0, 1, 1):
- Single class selectors: `.link`, `.bio__name` → (0, 1, 0)
- Pseudo-class: `.link:hover`, `.link:focus-visible` → (0, 1, 1)
- Attribute selector: `svg[stroke="currentColor"]` → (0, 1, 1)
- Child combinator: `.bio__links--inline .link` → (0, 2, 0)
- Pseudo-element: none used

**No ID selectors, no !important (except noscript style for .theme-toggle), no deeply nested specificity battles.**

---

## 13. UNRESOLVED QUESTIONS

1. **OG Image Auto-Generation (#7):** What binary size budget would justify including auto-OG generation? Current prototypes exceed 30 KB. Is there a path under 10 KB (e.g., tiny canvas library + data URLs)?

2. **Multi-Section Bio (#9):** How should multi-section schema be structured? ProfilePage > Person with multiple `description` fields, or separate content sections with distinct schema types? How does rendering change (layout variants apply per-section)?

3. **Robots & Canonical Meta:** Should theme emit `<meta name="robots" content="index, follow">` and `<link rel="canonical">` by default, or keep those user-configurable?

4. **Theme Color Meta:** Should `<meta name="theme-color">` be emitted automatically (mapped to current palette accent), or left to user?

5. **OG URL Meta:** Should `og:url` be emitted (currently missing)? Currently only `og:type`, `og:title`, `og:description`, `og:image` are present.

6. **Avatar Image Dimensions on `<img>`:** Should width/height attributes be added to `.bio__avatar <img>` to prevent CLS? Currently only SVG avatars have explicit dimensions. (Low risk if avatar aspect ratio is always 1:1, but explicit dims would be safer.)

7. **Icon Extensibility:** Is 50 icons a hard ceiling for v0-line, or should the limit increase in v1? Are there gaps in the current 45-icon set that users frequently request?

8. **RSS Feed Stability:** Is using build time (`now.Format`) as pubDate acceptable, or should future versions support per-link timestamps or at least cache-friendly etag logic?

9. **Lighthouse PageSpeed Insights:** Have you run the live demo against PSI? At <3 KB CSS + no web fonts + no JS by default, what's the actual Lighthouse score (Performance, A11y, Best Practices, SEO)?

---

## Summary

**Bonsai v0.4.0 is a highly optimized, minimal link-in-bio theme with:**
- ✅ **2.9 KB gzipped CSS** (well under 5 KB goal)
- ✅ **45 vendored icons** (brand + utility, no CDN)
- ✅ **3 layout variants** + 4 color palettes
- ✅ **Optional RSS feed** + JSON-LD Person schema
- ✅ **A11y** (semantic HTML, WCAG AA accents, 44×44 touch targets, prefers-reduced-motion)
- ✅ **i18n** (en, vi, extensible)
- ✅ **Zero JS by default** (theme toggle optional, localStorage-backed)
- ❌ **Not yet shipped:** Auto-OG images, multi-section bio, theme-color/robots/canonical meta
- ⚠️ **CSS budget:** Demo gallery CSS separated; not shipped to production sites (saves ~200 B gzipped per user site)

**Build pipeline:** Hugo 0.154.0 → 9 files (5 pages + 4 static assets) in 109 ms. Minified. Production-ready.

