# iammiti99

Personal link-in-bio page — built with [Hugo](https://gohugo.io) and the
[banyan](https://github.com/tiennm99/banyan) theme. Self-hosted Linktree
alternative for my own use.

## How it works

Edit [`hugo.yml`](hugo.yml) (`params:` block) → push to `main` → GitHub
Actions builds with Hugo + banyan → output deploys to GitHub Pages.

## Local development

Requires Hugo Extended ≥ 0.140 and Go, which Hugo uses to fetch the theme module.

```bash
hugo server          # http://localhost:1313
hugo --gc --minify   # build to ./public
```

## Deployment

Every push to `main` deploys to GitHub Pages. The workflow self-enables Pages
on first run via `actions/configure-pages@v5` with `enablement: true`, so no
manual UI setup is required for fresh forks (provided **Settings → Actions →
General → Workflow permissions** is set to "Read and write").

(Optional) Custom domain: drop a `static/CNAME` file containing your apex
domain — Hugo will copy it through to the deployed site.

### Base URL

`hugo.yml` sets `baseURL: /`, so a plain `hugo` build serves from the domain
root. The GitHub Pages workflow overrides it with the Pages URL
(`https://<owner>.github.io/iammiti99/`), so only that host gets the
`/iammiti99/` subpath.

### Other hosts (Cloudflare Pages, Netlify, Vercel)

| Setting | Value |
|---|---|
| Build command | `hugo --gc --minify` |
| Output directory | `public` |
| Env `HUGO_VERSION` | `0.154.0` (Hugo Extended) |
| Go | needed to fetch the theme module; set the host's Go version env if its image lacks Go |
| Env `HUGO_BASEURL` (optional) | the site's full URL, e.g. `https://iammiti99.pages.dev/` |

Without `HUGO_BASEURL` the site is served from the host's root URL, but
`og:image` and the canonical link stay relative. Set it so social link previews
get absolute URLs.

## Project layout

```
hugo.yml                 # site content — edit params here
content/_index.md        # placeholder so Hugo renders the index
static/images/           # avatar etc.
go.mod, go.sum           # Hugo module: pins the banyan theme version
.github/workflows/deploy.yml
public/                  # build output (gitignored)
```

## License

[Apache License 2.0](LICENSE)
