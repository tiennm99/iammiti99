# Bonsai

[![build](https://github.com/tiennm99/bonsai/actions/workflows/build.yml/badge.svg)](https://github.com/tiennm99/bonsai/actions/workflows/build.yml)
[![license](https://img.shields.io/github/license/tiennm99/bonsai)](LICENSE)
[![Hugo](https://img.shields.io/badge/hugo-%E2%89%A50.128-ff4088?logo=hugo)](https://gohugo.io)

A minimalist Hugo theme for link-in-bio pages, inspired by [Linktree](https://linktr.ee) and the Japanese art of [bonsai](https://en.wikipedia.org/wiki/Bonsai) — *small, curated, intentional*.

**→ [Live demo](https://tiennm99.github.io/bonsai/)** · **[Icon gallery](https://tiennm99.github.io/bonsai/icons/)**

> 盆栽 (bonsai): "tray planting" — the art of growing miniature trees through patient, deliberate cultivation. Every branch placed with care.

Bonsai treats your bio page the same way: a quiet, well-pruned page that surfaces only what matters — your name, who you are, and where people can find you.

## Features

- **Single-page bio** — name, avatar, tagline, links. Nothing else.
- **Data-driven links** — defined in `[[params.links]]`; no content files required.
- **35 icons out of the box** — 25 brand (GitHub, Mastodon, Bluesky, X, Threads, LinkedIn, Instagram…) + 10 utility (mail, globe, rss…). Vendored from [Simple Icons](https://simpleicons.org) and [Lucide](https://lucide.dev).
- **Light & dark mode** — respects `prefers-color-scheme`; optional toggle.
- **Zero JavaScript by default** — pure HTML + CSS; opt-in JS for theme toggle only.
- **Fast** — < 4 KB CSS, < 4 KB HTML, no web fonts (system stack), no runtime fetches.
- **Accessible** — semantic HTML, focus-visible outlines, `prefers-reduced-motion`.
- **Responsive** — mobile-first, looks right at every viewport.

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
| `avatar` | string (URL) | — | Avatar image path. Omit to skip. |
| `favicon` | string (URL) | `/favicon.ico` | Favicon path. |
| `themeToggle` | bool | `false` | Render the light/dark toggle button + load the toggle script. |
| `footer` | bool | `true` | Show the footer. |
| `footerText` | string (HTML) | `© {year} {name}` | Override footer text. HTML allowed. |
| `links` | array | — | Bio links. See below. |

**Each `[[params.links]]` entry:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Link label. |
| `url` | string | yes | Link target. `mailto:` and `tel:` are rendered without `target=_blank`. |
| `icon` | string | no | Icon name from the available set (see below). Unknown names render a generic external-link glyph. |

## Available Icons

<details>
<summary>Brand / Social (25)</summary>

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

</details>

<details>
<summary>UI / Utility (10)</summary>

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
