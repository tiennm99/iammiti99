# Bonsai

A minimalist Hugo theme for link-in-bio pages, inspired by [Linktree](https://linktr.ee) and the Japanese art of [bonsai](https://en.wikipedia.org/wiki/Bonsai) — *small, curated, intentional*.

> 盆栽 (bonsai): "tray planting" — the art of growing miniature trees through patient, deliberate cultivation. Every branch placed with care.

Bonsai treats your bio page the same way: a quiet, well-pruned page that surfaces only what matters — your name, who you are, and where people can find you.

## Features

- **Single-page bio** — name, avatar, tagline, links, that's it
- **Data-driven links** — define every link in `hugo.toml` (or `data/links.yaml`); no content files needed
- **Light & dark mode** — respects system preference, toggleable
- **Zero JavaScript by default** — pure HTML + CSS; opt-in JS for theme toggle
- **Responsive** — mobile-first, looks right on every screen
- **Japanese-aesthetic defaults** — generous whitespace, calm palette, restrained typography
- **Fast** — < 10 KB CSS, no web fonts required (system stack)
- **Accessible** — semantic HTML, focus states, prefers-reduced-motion

## Installation

### As a Hugo Module (recommended)

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

### As a Git submodule

```bash
git submodule add https://github.com/tiennm99/bonsai.git themes/bonsai
```

Set in `hugo.toml`:

```toml
theme = "bonsai"
```

## Configuration

Minimal `hugo.toml`:

```toml
baseURL = "https://example.com/"
title = "Your Name"
theme = "bonsai"

[params]
  name = "Your Name"
  tagline = "Tending my little corner of the internet"
  avatar = "/images/avatar.jpg"
  bio = "Short bio. One sentence is plenty."

  [[params.links]]
    title = "GitHub"
    url = "https://github.com/yourname"
    icon = "github"

  [[params.links]]
    title = "Blog"
    url = "https://yourblog.com"
    icon = "globe"

  [[params.links]]
    title = "Email"
    url = "mailto:you@example.com"
    icon = "mail"
```

See `exampleSite/` for a full reference.

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

Icons are vendored at build time — no CDN fetch at runtime. To refresh or add icons, edit `scripts/sync-icons.sh` and `data/icons.yaml`, then re-run the script.

See `exampleSite/content/icons/` for a rendered gallery (run locally).

## Development

```bash
cd exampleSite
hugo server --themesDir ../..
```

## License

Apache-2.0 © tiennm99
