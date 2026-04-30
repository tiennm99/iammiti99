# iammiti99

Personal link-in-bio page — a self-hosted Linktree alternative for my own use.

Inspired by [linkyee](https://github.com/ZhgChgLi/linkyee) (MIT). No source
code is copied; see [`NOTICE`](NOTICE).

## How it works

Edit [`config.yaml`](config.yaml) → push to `main` → GitHub Actions runs
[`build.js`](build.js) (Node 20) → output deploys to GitHub Pages.

Links flagged with `repo: owner/name` are decorated at build time with
GitHub stars and "last updated N days ago", refreshed daily by a cron run.

## Local development

```bash
npm install
npm run build      # writes _site/index.html
npm run serve      # python http.server on :8080
```

`build.js` reads `GITHUB_TOKEN` if set; without it, GitHub API calls are
unauthenticated (60 req/h, plenty for a few links).

## One-time GitHub Pages setup

1. Settings → Pages → Source: **GitHub Actions**.
2. (Optional) Settings → Pages → Custom domain: enter your domain and add
   a `src/CNAME` file with the same value (`build.js` copies it through).

After that, every push to `main` (and the daily 00:00 UTC cron) deploys.

## Project layout

```
config.yaml                # site content — edit this
src/
  template.html            # HTML template with ${var} placeholders
  styles.css               # mobile-first, light + dark via prefers-color-scheme
  images/                  # avatar etc.
build.js                   # ~70 LOC, Node 20, only dep is js-yaml
.github/workflows/deploy.yml
_site/                     # build output (gitignored)
```

## License

[Apache License 2.0](LICENSE)
