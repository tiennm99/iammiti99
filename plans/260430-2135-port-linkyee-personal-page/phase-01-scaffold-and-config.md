# Phase 01 — Scaffold & config schema

## Context links

- [plan.md](plan.md)
- [recon report](../reports/xia-260430-2135-linkyee-recon.md)
- linkyee config reference: /tmp/linkyee-src/config.yml

## Overview

- **Priority:** P0 (gates everything)
- **Status:** ✅ completed
- **Description:** Establish project layout and config schema. Single source of truth for all page content.

## Key insights

- linkyee's nested `- link: { ... }` wrapper is verbose YAML; flatten to `- { ... }`.
- Splitting `profile`, `links`, `socials` into one file keeps editing fast.
- JSON would be zero-dep; YAML is friendlier for hand editing. **Pick YAML** + add `js-yaml` as the only npm dep.
- `repo:` field on a link is the trigger that activates star + last-commit lookup.

## Requirements

**Functional:**
- One YAML file, `config.yaml`, holds: profile, links[], socials[], meta (title, description, OG image), footer.
- `links[]` items support `text`, `url`, `icon`, `target`, optional `repo` (`owner/name`) for live data.
- `socials[]` items support `icon`, `url`, `title`.

**Non-functional:**
- Schema is documented inline (comments) and in this phase.
- Schema is small enough to keep in one file under 200 lines.

## Architecture

```
iammiti99/
├── config.yaml              # ← single source of truth
├── src/
│   ├── template.html        # raw HTML template (Phase 2)
│   ├── styles.css           # (Phase 2)
│   └── scripts.js           # (Phase 2; may stay empty)
├── build.js                 # (Phase 3)
├── package.json             # (Phase 3)
├── _site/                   # build output (.gitignore)
├── .github/workflows/
│   └── deploy.yml           # (Phase 4)
├── README.md
├── LICENSE                  # (existing) Apache-2.0
└── NOTICE                   # credit linkyee inspiration
```

## Related code files

**Create:**
- `config.yaml`
- `.gitignore` additions: `_site/`, `node_modules/`
- `NOTICE`

**Modify:** none

**Delete:** none

## Config schema

```yaml
# Site meta
site:
  title: "Tien — links"
  description: "Tien Nguyen Minh — engineer / builder / writer"
  url: "https://iammiti99.github.io"        # for OG tags
  lang: "en"
  theme_color_light: "#f7f7f7"
  theme_color_dark: "#1b1b1e"

# Profile
profile:
  name: "@miti99"
  tagline: "Engineer building things on the web."
  avatar: "./images/avatar.jpg"

# Optional analytics (omit to disable)
analytics:
  google_analytics_id: ""

# Primary link list (rendered as buttons in order)
links:
  - text: "Tech blog"
    url: "https://blog.example.com"
    icon: "fa-solid fa-pen-nib"
    target: "_blank"
  - text: "iammiti99"
    url: "https://github.com/tiennm99/iammiti99"
    icon: "fa-brands fa-github"
    target: "_blank"
    repo: "tiennm99/iammiti99"     # ← triggers stars + last-commit decoration

# Social icon row (small, below links)
socials:
  - icon: "fa-brands fa-github"
    url: "https://github.com/tiennm99"
    title: "GitHub"
  - icon: "fa-solid fa-envelope"
    url: "mailto:minhtienit99@gmail.com"
    title: "Email"

# Footer
footer:
  text: "Thanks for stopping by."
  copyright: "© 2026 Tien Nguyen Minh"
```

## Implementation steps

1. Write `config.yaml` at repo root with the schema above; populate with placeholder values from `README.md` user.
2. Append `_site/`, `node_modules/`, `.DS_Store` to `.gitignore`.
3. Create `NOTICE` file with linkyee inspiration credit:
   ```
   This project is inspired by linkyee (https://github.com/ZhgChgLi/linkyee, MIT).
   No code is copied; only the architectural idea (config-driven link page on GitHub Pages).
   ```
4. Create empty `src/`, `_site/` directories (add `.gitkeep` to `src/` if empty so it commits).

## Todo

- [ ] Write `config.yaml`
- [ ] Update `.gitignore`
- [ ] Add `NOTICE`
- [ ] Create `src/` directory

## Success criteria

- `config.yaml` parses with `js-yaml` (verify with `node -e "console.log(require('js-yaml').load(require('fs').readFileSync('config.yaml','utf8')))"`)
- `.gitignore` excludes build output

## Risks

- Over-engineering schema with fields we won't use. Mitigation: only add a field once Phase 2 needs it.

## Security

- `config.yaml` is public — never put secrets here.
- `analytics.google_analytics_id` is non-secret (public client-side ID).

## Next

→ Phase 2: design HTML template and CSS.
