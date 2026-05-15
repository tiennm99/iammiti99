# Bonsai

[![build](https://github.com/tiennm99/bonsai/actions/workflows/build.yml/badge.svg)](https://github.com/tiennm99/bonsai/actions/workflows/build.yml)
[![license](https://img.shields.io/github/license/tiennm99/bonsai)](LICENSE)
[![Hugo](https://img.shields.io/badge/hugo-%E2%89%A50.140-ff4088?logo=hugo)](https://gohugo.io)

A minimalist Hugo theme for link-in-bio pages, inspired by [Linktree](https://linktr.ee) and the Japanese art of [bonsai](https://en.wikipedia.org/wiki/Bonsai) — *small, curated, intentional*.

**→ [Live demo](https://tiennm99.github.io/bonsai/)** · **[Icon gallery](https://tiennm99.github.io/bonsai/icons/)** · **[Layout variants](https://tiennm99.github.io/bonsai/variants/)** · **[Color themes](https://tiennm99.github.io/bonsai/themes/)**

> 盆栽 (bonsai): "tray planting" — the art of growing miniature trees through patient, deliberate cultivation. Every branch placed with care.

Bonsai treats your bio page the same way: a quiet, well-pruned page that surfaces only what matters — your name, who you are, and where people can find you.

## Features

**Core**
- **Single-page bio** — name, avatar, tagline, links. Nothing else.
- **Data-driven links** — `[[params.links]]` flat list, OR `[[params.sections]]` for grouped sections with headings (v0.5).
- **45 icons out of the box** — 32 brand (GitHub, Mastodon, Bluesky, Spotify, Figma, Matrix…) + 13 utility (mail, globe, rss, heart, download…). Vendored from [Simple Icons](https://simpleicons.org) and [Lucide](https://lucide.dev).
- **Light & dark mode** — respects `prefers-color-scheme`; optional toggle.
- **Zero JavaScript by default** — pure HTML + CSS; opt-in JS only for theme toggle / share button / GA4.
- **Fast** — ~2.4 KB gzipped CSS, no web fonts (system stack), no runtime fetches.
- **Accessible** — semantic HTML, skip-link, 48×48 tap targets, `focus-visible` outlines, `prefers-reduced-motion`, WCAG-AA palettes.
- **Responsive** — mobile-first, looks right at every viewport.

**Linktree-parity opt-ins (v0.5)**
- **Per-link enhancements** — `image` thumbnails, `featured` flag, `startDate`/`endDate` scheduled visibility, custom `rel`, `note` caption.
- **Share button** — `navigator.share` with clipboard fallback + ARIA-live toast (`params.share`).
- **QR code** — build-time PNG of the page Permalink via `images.QR` (`params.qr`).
- **vCard download** — generated `.vcf` at `/vcard.vcf` for one-click contact import (`params.vcard`).
- **GA4 click analytics** — `[params.analytics]` block; auto-emits `data-analytics-event` + UTM injection. *GA4 sets cookies — consent is your responsibility.*

**Lighthouse hardening (v0.5)**
- **`<picture>` avatar** — AVIF + WebP + JPEG at 1x/2x via Hugo's image processor.
- **Fingerprinted CSS/JS** with SRI `integrity=` — enables 1-year `Cache-Control: immutable`.
- **Canonical + `og:url` + theme-color + robots meta** emitted by default.
- **Hreflang alternates** automatic for multi-language sites.
- **Web manifest + WebSite JSON-LD** — opt-in via `params.manifest` / `params.schemaWebSite`.
- **Deploy templates** for Netlify / Cloudflare Pages / Vercel / GitHub Pages — see [`docs/deployment-guide.md`](./docs/deployment-guide.md).
- **Lighthouse CI** workflow gating PRs at ≥ 0.90 across Performance, A11y, Best-Practices, SEO.

## Quick Start

### As a Git submodule (simplest)

```bash
git submodule add https://github.com/tiennm99/bonsai.git themes/bonsai
```

Add to `hugo.toml`:

```toml
theme = "bonsai"
```

### As a Hugo Module

```bash
hugo mod init github.com/<you>/<your-site>
hugo mod get github.com/tiennm99/bonsai
```

Add to `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/tiennm99/bonsai"
```

## Configuration

Minimal `hugo.toml`:

```toml
baseURL = "https://example.com/"
title   = "Your Name"
theme   = "bonsai"

# Single-page bio — disable everything Hugo doesn't need.
disableKinds = ["taxonomy", "term", "RSS", "sitemap", "404"]

[params]
  name    = "Your Name"
  tagline = "Tending my little corner of the internet"
  bio     = "Short bio. One sentence is plenty."
  avatar  = "/images/avatar.jpg"

  [[params.links]]
    title = "GitHub"
    url   = "https://github.com/yourname"
    icon  = "github"

  [[params.links]]
    title = "Email"
    url   = "mailto:you@example.com"
    icon  = "mail"
```

### All parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | site `title` | Display name shown as `<h1>`. |
| `tagline` | string | — | One-liner under the name. |
| `bio` | string (markdown) | — | Short bio paragraph. Markdown supported. |
| `avatar` | string (URL) | — | Avatar image path. If unset, theme renders an SVG circle with auto-derived initials. |
| `avatarInitials` | string | first letters of `name` | Override the initials when no `avatar` is set. |
| `avatarBg` | string (CSS color) | `var(--bonsai-accent)` | Background color of the initials circle. |
| `favicon` | string (URL) | `/favicon.ico` | Favicon path (`.ico` fallback). |
| `faviconSvg` | string (URL) | — | Optional SVG favicon. Modern browsers prefer this when set. |
| `appleTouchIcon` | string (URL) | — | 180×180 PNG for iOS home-screen / Safari pinned tabs. |
| `colorTheme` | string | `bonsai` | Palette: `bonsai`, `sakura`, `sumi`, or `koi`. See [Color themes](#color-themes). |
| `layout` | string | `stack` | Link arrangement: `stack`, `grid`, or `inline`. See [Layout variants](#layout-variants). |
| `themeToggle` | bool | `false` | Render a sun/moon button in the footer + load the toggle script. |
| `rss` | bool | `false` | Render an RSS 2.0 feed of `[[params.links]]` at `/index.xml` and emit `<link rel="alternate">` in `<head>`. Requires removing `RSS` from `disableKinds`. |
| `share` | bool | `false` | Render a page share button using `navigator.share` with clipboard fallback. Loads `share.js` (~700 B) only when enabled. |
| `qr` | bool | `false` | Render a collapsible `<details>` block with a build-time QR code (PNG) of the page Permalink. Requires Hugo ≥ 0.140 (`images.QR`). |
| `vcard` | bool | `false` | Serve a vCard at `/vcard.vcf` and render a "Save contact" link. **Requires registering the `VCard` output format in `hugo.toml`** — see [output-format setup](#output-format-setup) below. |
| `manifest` | bool | `false` | Emit a `<link rel="manifest">` and serve `/manifest.webmanifest`. **Requires registering the `Manifest` output format in `hugo.toml`** — see [output-format setup](#output-format-setup). |
| `schemaWebSite` | bool | `false` | Emit a second JSON-LD block (`@type: WebSite`) alongside the always-on `Person` schema. Helps rich-snippet eligibility. |
| `shortName` | string | first 12 chars of `name` | PWA `short_name` in `manifest.webmanifest`. Set when your name exceeds 12 chars. |
| `themeBackground` | string (CSS color) | `#f4efe6` | PWA splash `background_color` in `manifest.webmanifest`. |
| `ogAuto` | bool | `false` | Generate a 1200×630 OG image at build time by overlaying `name` + `tagline` text on a user-supplied base PNG. Requires `ogAutoBase` + `ogAutoFont`. Infra-only in v0.5: theme does not vendor base PNG / TTF font. |
| `ogAutoBase` | string (assets path) | — | Path under `assets/` to a 1200×630 base PNG used by `ogAuto`. Example: `og/my-base.png` resolves to `assets/og/my-base.png`. |
| `ogAutoFont` | string (assets path) | — | Path under `assets/` to a TTF font used by `ogAuto` text overlay. Subset to Latin-only is recommended (≤ 15 KB). |
| `analytics` | object | — | Opt-in Google Analytics 4 — see [Analytics](#analytics) below. |
| `ogImage` | bool | `true` | Set `false` to suppress all `og:image` / `twitter:image` tags. |
| `ogImageUrl` | string (URL) | — | Explicit OG preview image (1200×630 recommended). Overrides the avatar fallback and upgrades Twitter card to `summary_large_image`. |
| `ogAuto` | bool | `false` | Generate a 1200×630 OG image at build time by overlaying `name` + `tagline` text on a user-supplied base PNG. Requires `ogAutoBase` + `ogAutoFont`. Infra-only in v0.5: theme does not vendor base PNG / TTF font (binary-budget gate). |
| `ogAutoBase` | string (assets path) | — | Path under `assets/` to a 1200×630 base PNG used by `ogAuto`. Example: `og/my-base.png` resolves to `assets/og/my-base.png`. |
| `ogAutoFont` | string (assets path) | — | Path under `assets/` to a TTF font used by `ogAuto` text overlay. Subset to Latin-only is recommended (≤ 15 KB). |
| `themeColor` | string (CSS color) | — | Optional `<meta name="theme-color">`. Tints mobile browser chrome (iOS Safari, Android Chrome). Set to your palette's accent for cohesive look. |
| `robots` | string | `index,follow` | Value of `<meta name="robots">`. Set `noindex,nofollow` to hide the site from search engines. |
| `preloadAvatar` | bool | `true` | Preload `params.avatar` as the LCP image via `<link rel="preload">`. Skipped automatically when avatar is an external URL or unset. |
| `schema` | bool | `true` | Emit schema.org `Person` JSON-LD in `<head>`. Set `false` if you provide your own. |
| `jobTitle` | string | — | Optional `Person.jobTitle` field for JSON-LD. |
| `location` | string | — | Optional `Person.address` field for JSON-LD. |
| `email` | string | — | Optional `Person.email` field for JSON-LD. |
| `footer` | bool | `true` | Show the footer. |
| `footerText` | string (HTML) | `© {year} {name}` | Override footer text. HTML allowed. |
| `links` | array | — | Bio links. See below. |

**Each `[[params.links]]` entry:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Link label. |
| `url` | string | yes | Link target. `mailto:` and `tel:` are rendered without `target=_blank`. |
| `icon` | string | no | Icon name from the available set (see below). Unknown names render a generic external-link glyph. |

## Color themes

Four built-in palettes, each with light + dark variants. Set `colorTheme` in `[params]`:

| Name | Vibe | Accent |
|------|------|--------|
| `bonsai` *(default)* | washi paper + vermilion seal | `#8b3a2b` |
| `sakura` | cherry blossom pink | `#c93f63` |
| `sumi` | monochrome ink | `#1a1a1a` |
| `koi` | orange + cream | `#bd4c1c` |

Live preview: **[tiennm99.github.io/bonsai/themes/](https://tiennm99.github.io/bonsai/themes/)**.

## Layout variants

Three arrangements for `[[params.links]]`. Pick one via `layout` in `[params]`:

| Value | Look | Best for |
|-------|------|----------|
| `stack` *(default)* | Full-width vertical buttons | ≤ 6 link bios; the classic Linktree shape. |
| `grid` | Two-column responsive grid (collapses to one column under 480 px) | 6–12 links; balances density and tap-target size. |
| `inline` | Icon-only horizontal row | Lots of accounts, short page; titles stay in DOM for screen readers. |

Live preview: **[tiennm99.github.io/bonsai/variants/](https://tiennm99.github.io/bonsai/variants/)**.

## RSS feed (opt-in)

Off by default. To enable a feed of your `[[params.links]]` at `/index.xml`:

```toml
# remove "RSS" from disableKinds — Hugo emits it by default but the theme suggests disabling it
disableKinds = ["taxonomy", "term", "sitemap", "404"]

[params]
  rss = true
```

The theme renders one `<item>` per link. `pubDate` is the build time (links lack intrinsic dates), so the feed updates whenever the site rebuilds — fine for a curated bio, less ideal for high-frequency feeds.

## Output-format setup

`params.vcard` and `params.manifest` rely on custom Hugo output formats. Without the registration below, the theme emits the `<link rel="manifest">` / "Save contact" anchor but Hugo doesn't generate the file itself.

Add to `hugo.toml`:

```toml
[mediaTypes."text/vcard"]
  suffixes = ["vcf"]

[mediaTypes."application/manifest+json"]
  suffixes = ["webmanifest"]

[outputs]
  home = ["HTML", "RSS", "Manifest"]   # add "VCard" if params.vcard = true

[outputFormats.VCard]
  mediaType      = "text/vcard"
  baseName       = "vcard"
  isPlainText    = true
  notAlternative = true

[outputFormats.Manifest]
  mediaType      = "application/manifest+json"
  baseName       = "manifest"
  isPlainText    = true
  notAlternative = true
```

Only include the blocks you need. See `exampleSite/hugo.toml` for a working reference.

## Analytics

Off by default. To enable Google Analytics 4 click tracking and UTM injection on external links:

```toml
[params.analytics]
  measurementId = "G-XXXXXXXXXX"   # required to enable
  trackClicks   = true             # default; emits data-analytics-event="link:<slug>" + click listener
  utmSource     = "bio"            # if set, appended to external link hrefs at build time
  utmMedium     = "bio"
  # utmCampaign = "summer-launch"
```

> ⚠️ **GA4 sets cookies.** Sites serving EU / UK / California visitors require explicit user consent before loading `gtag.js`. Bonsai does not ship a consent banner — pair with a consent management platform (Klaro!, Cookiebot, OneTrust) or skip GA4 entirely. See [`docs/deployment-guide.md`](./docs/deployment-guide.md#analytics--consent).

## i18n

Theme-rendered strings (nav landmark, theme-toggle labels, default footer) live in `i18n/{lang}.toml`. Bundles for `en` and `vi` ship with the theme.

To use another language, set Hugo's `defaultContentLanguage` and add a matching `i18n/{lang}.toml`:

```toml
defaultContentLanguage = "fr"
```

```toml
# i18n/fr.toml
[nav_links_label]
other = "Liens"
[theme_toggle_label]
other = "Basculer le thème clair / sombre"
[theme_toggle_title]
other = "Basculer le thème"
[footer_default]
other = "© {{ .year }} {{ .name }}"
```

Missing keys fall back to `en`. User content (`name`, `tagline`, `bio`, link `title`s, `footerText`) is never auto-translated — it stays user-owned.

## Available Icons

<details>
<summary>Brand / Social (32)</summary>

| Name | Source |
|------|--------|
| `github` | Simple Icons |
| `gitlab` | Simple Icons |
| `mastodon` | Simple Icons |
| `bsky` | Simple Icons |
| `x` | Simple Icons |
| `threads` | Simple Icons |
| `linkedin` | Simple Icons |
| `instagram` | Simple Icons |
| `facebook` | Simple Icons |
| `tiktok` | Simple Icons |
| `youtube` | Simple Icons |
| `twitch` | Simple Icons |
| `discord` | Simple Icons |
| `telegram` | Simple Icons |
| `signal` | Simple Icons |
| `whatsapp` | Simple Icons |
| `reddit` | Simple Icons |
| `medium` | Simple Icons |
| `devto` | Simple Icons |
| `substack` | Simple Icons |
| `hashnode` | Simple Icons |
| `kofi` | Simple Icons |
| `patreon` | Simple Icons |
| `buymeacoffee` | Simple Icons |
| `paypal` | Simple Icons |
| `bandcamp` | Simple Icons |
| `soundcloud` | Simple Icons |
| `spotify` | Simple Icons |
| `figma` | Simple Icons |
| `dribbble` | Simple Icons |
| `stackoverflow` | Simple Icons |
| `matrix` | Simple Icons |

</details>

<details>
<summary>UI / Utility (13)</summary>

| Name | Source |
|------|--------|
| `mail` | Lucide |
| `globe` | Lucide |
| `link` | Lucide |
| `rss` | Lucide |
| `calendar` | Lucide |
| `phone` | Lucide |
| `mappin` | Lucide |
| `filetext` | Lucide |
| `extlink` | Lucide |
| `share` | Lucide |
| `bookopen` | Lucide |
| `download` | Lucide |
| `heart` | Lucide |

</details>

Icons are vendored at build time — no CDN fetch at runtime. Live gallery: **[tiennm99.github.io/bonsai/icons/](https://tiennm99.github.io/bonsai/icons/)**.

To refresh or add icons, edit `scripts/sync-icons.sh` and `data/icons.yaml`, then re-run the script. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Development

```bash
git clone https://github.com/tiennm99/bonsai.git
cd bonsai/exampleSite
hugo server --themesDir ../.. --bind 0.0.0.0
```

Build for inspection:

```bash
cd exampleSite && hugo --themesDir ../.. --gc --minify
```

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for dev setup, the icon-add workflow, and PR guidelines.

## License

Apache-2.0 © [tiennm99](https://github.com/tiennm99). See [LICENSE](LICENSE) and [NOTICE](NOTICE) for third-party attributions (Simple Icons CC0, Lucide ISC).
