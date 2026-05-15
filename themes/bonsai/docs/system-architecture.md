# System architecture

Bonsai is a [Hugo](https://gohugo.io) theme — a directory of templates, partials, CSS, JS, and data files that Hugo reads when building a user's site. There is no runtime: every page, JSON-LD block, OG meta tag, QR PNG, AVIF/WebP image variant, vCard, RSS feed, and Lighthouse-relevant output is produced at `hugo build` time.

## Directory layout

```
bonsai/
├── theme.toml                  # Hugo theme metadata (name, min_version, license)
├── data/icons.yaml             # Public icon name → {family, slug} manifest
├── i18n/                       # Localized UI strings (en, vi shipped; extensible)
├── assets/                     # Hugo resource root (image/CSS/JS pipeline reads from here)
│   ├── css/                    # Stylesheets (fingerprinted at build time)
│   ├── js/                     # Optional scripts (theme-toggle, share)
│   └── icons/                  # Vendored SVG icons (Simple Icons + Lucide)
├── layouts/
│   ├── _default/baseof.html    # HTML5 skeleton
│   ├── index.html              # Home page entry (calls bio-card partial)
│   ├── index.rss.xml           # RSS 2.0 feed of links/sections
│   ├── _default/vcard.vcf      # vCard output template (opt-in)
│   ├── _default/manifest.webmanifest  # PWA manifest (opt-in)
│   └── partials/
│       ├── head.html           # All <head> content
│       ├── bio-card.html       # Main bio card with sections/links branching
│       ├── link-button.html    # Individual link (with thumbnail / featured / scheduled / rel / note)
│       ├── link-group.html     # Renders one <nav> of links (used by flat + sectioned modes)
│       ├── icon.html           # Inline SVG icon lookup (data/icons.yaml → assets/icons/)
│       ├── avatar.html         # Avatar: <picture> for local, <img> for URL, SVG initials fallback
│       ├── share-button.html   # Opt-in Web Share button
│       ├── qr-block.html       # Opt-in QR code block (images.QR)
│       ├── analytics-loader.html  # Opt-in GA4 loader + click listener
│       ├── schema-person.html  # JSON-LD ProfilePage > Person
│       ├── schema-website.html # Opt-in JSON-LD WebSite
│       ├── theme-toggle-button.html
│       └── footer.html
│   ├── themes/single.html      # Demo: color-palette gallery
│   ├── variants/single.html    # Demo: layout-variant gallery
│   └── icons/single.html       # Demo: icon gallery
└── exampleSite/                # Self-contained demo + reference config
    ├── hugo.toml               # Showcases every opt-in param
    ├── static/_headers         # Netlify / Cloudflare Pages header file
    ├── vercel.json             # Vercel header config
    └── content/                # Demo content
```

## Build-time pipelines

### 1. CSS / JS pipeline

```
assets/css/bonsai.css
   └─ resources.Get
        └─ resources.Minify        (strip whitespace, comments)
             └─ resources.Fingerprint "sha384"
                  └─ /css/bonsai.min.<sha>.css  +  integrity="sha384-..."
```

Same shape for `gallery.css`, `theme-toggle.js`, `share.js`. The fingerprinted output lets hosts apply `Cache-Control: public, max-age=31536000, immutable` to `/css/*` and `/js/*` safely — any content change produces a new filename hash.

### 2. Image pipeline

When `params.avatar` resolves as a local asset:

```
assets/avatars/me.jpg
   ├─ .Process "resize 112x112 jpg q85"   → JPEG 1x
   ├─ .Process "resize 224x224 jpg q85"   → JPEG 2x
   ├─ .Process "resize 112x112 webp q75"  → WebP 1x
   ├─ .Process "resize 224x224 webp q75"  → WebP 2x
   ├─ .Process "resize 112x112 avif q60"  → AVIF 1x
   └─ .Process "resize 224x224 avif q60"  → AVIF 2x
         ↓
       <picture>
         <source type="image/avif" srcset="… 1x, … 2x">
         <source type="image/webp" srcset="… 1x, … 2x">
         <img src=jpeg-1x srcset=…>
       </picture>
```

External-URL avatars (`https://…`) skip the pipeline and emit a plain `<img>` with Phase-1 attributes (width/height/fetchpriority/decoding).

### 3. QR pipeline

```
images.QR <Permalink> {level: medium, scale: 4}
   └─ Build-time PNG at /qr_<hash>.png
         ↓
       <img class="bio__qr-img" src="…" width="…" height="…" alt="…">
```

### 4. Auto-OG (infra-only in v0.5)

```
$base := resources.Get params.ogAutoBase   (1200×630 PNG)
$font := resources.Get params.ogAutoFont   (TTF, latin subset recommended)
$base | images.Filter (images.Text $name {size:72, x:80, y:220, font:$font})
      | images.Filter (images.Text $tagline {size:36, x:80, y:340, font:$font})
   └─ Generated 1200×630 → og:image + twitter:card=summary_large_image
```

Theme ships no base PNG or font — user supplies via `params.ogAutoBase`/`ogAutoFont` (paths relative to `assets/`).

### 5. JSON-LD strategy

Always: `ProfilePage > Person` (suppressible via `params.schema = false`).
Opt-in: `WebSite` (via `params.schemaWebSite = true`) — emitted as a second `<script type="application/ld+json">` block. Google supports multiple JSON-LD blocks per page.

### 6. i18n flow

Every user-facing string the theme renders is sourced from `i18n/<lang>.toml`. Hugo's `i18n` function falls back from the active language to `en` on missing keys. User content (`name`, `tagline`, `bio`, link `title`s, `footerText`) is never auto-translated.

## Lighthouse-relevant signals (what the theme emits)

| Category | Signal | Source |
|----------|--------|--------|
| Performance | Avatar dims + `fetchpriority="high"` + `decoding="async"` | `partials/avatar.html` |
| Performance | Avatar preload (when local) | `partials/head.html` |
| Performance | Modern image formats (AVIF/WebP/JPEG `<picture>`) | `partials/avatar.html` |
| Performance | Fingerprinted CSS / JS with SRI | `partials/head.html` |
| Performance | Zero web fonts, system stack | `assets/css/bonsai.css` |
| A11y | Skip-link, `<nav aria-label>`, semantic landmarks | `baseof.html`, `bio-card.html` |
| A11y | Tap targets ≥ 48×48 on inline layout | `assets/css/bonsai.css` |
| A11y | `prefers-reduced-motion` honored | `assets/css/bonsai.css` |
| A11y | WCAG-AA accent colors | palette CSS |
| Best-Practices | Security headers (CSP, X-Frame, Referrer-Policy, Permissions-Policy) | `exampleSite/static/_headers` + `vercel.json` |
| Best-Practices | `rel="noopener noreferrer"` on external links | `link-button.html` |
| Best-Practices | SRI `integrity=` on assets | `partials/head.html` |
| SEO | `<link rel="canonical">` | `partials/head.html` |
| SEO | `<meta property="og:url">`, `og:type`, `og:title`, `og:description`, `og:image` | `partials/head.html` |
| SEO | Hreflang alternates (multi-lang sites) | `partials/head.html` |
| SEO | JSON-LD Person (always) + optional WebSite | `schema-person.html`, `schema-website.html` |
| SEO | `<meta name="robots">` configurable | `partials/head.html` |
| SEO | Tap-target sizing | `assets/css/bonsai.css` |

## Backward-compatibility contract

- Every new param added in v0.5 defaults to off OR has a safe default that preserves v0.4 behavior.
- `[[params.links]]` continues to work unchanged when `[[params.sections]]` is absent.
- Avatar URL paths from `static/` still work via the fallback branch in `partials/avatar.html`.
- The CSS/JS file move from `static/` to `assets/` is invisible to user sites — the fingerprinted output is served at `/css/*` and `/js/*`.
