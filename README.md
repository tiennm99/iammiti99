# iammiti99

Personal link-in-bio page — built with [Hugo](https://gohugo.io) and the
[bonsai](https://github.com/tiennm99/bonsai) theme. Self-hosted Linktree
alternative for my own use.

## How it works

Edit [`hugo.toml`](hugo.toml) (`[params]` block) → push to `main` → GitHub
Actions builds with Hugo + bonsai → output deploys to GitHub Pages.

## Local development

Requires Hugo Extended ≥ 0.128.

```bash
git submodule update --init --recursive
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

## Project layout

```
hugo.toml                # site content — edit [params] here
content/_index.md        # placeholder so Hugo renders the index
static/images/           # avatar etc.
themes/bonsai/           # bonsai theme (git submodule)
.github/workflows/deploy.yml
public/                  # build output (gitignored)
```

## License

[Apache License 2.0](LICENSE)
