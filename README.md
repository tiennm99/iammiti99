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

## Deployment

Every push to `main` (plus the daily 00:00 UTC cron) deploys to GitHub
Pages. The workflow self-enables Pages on first run via
`actions/configure-pages@v5` with `enablement: true`, so no manual UI
setup is required for fresh forks (provided **Settings → Actions →
General → Workflow permissions** is set to "Read and write").

(Optional) Custom domain: drop a `src/CNAME` file containing your apex
domain — `build.js` copies it through to the deployed site.

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
