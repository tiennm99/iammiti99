# Phase 04 — Deploy pipeline (GitHub Actions → Pages)

## Context links

- [plan.md](plan.md)
- [phase-03-build-and-data.md](phase-03-build-and-data.md)
- linkyee deploy reference (legacy pattern, do not copy): /tmp/linkyee-src/deploy.sh + .github/workflows/build.yml

## Overview

- **Priority:** P0
- **Status:** ✅ completed
- **Description:** Modern GitHub Pages deployment via Actions artifact. No `gh-pages` branch.

## Key insights

- linkyee's `deploy.sh` is legacy: force-pushes to `gh-pages`. **Skip entirely.**
- Modern path: `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`.
- Workflow needs `permissions: { pages: write, id-token: write, contents: read }`.
- `GITHUB_TOKEN` is auto-injected; export it to the build step's env.
- Triggers (3): `push` to `main`, daily `schedule` cron, manual `workflow_dispatch`.

## Requirements

**Functional:**
- On push to `main`: build → deploy.
- On daily cron `0 0 * * *`: rebuild (refreshes star + last-commit) → deploy.
- On manual dispatch: same.
- Build uses Node 20.

**Non-functional:**
- Concurrency: in-flight deploys cancel earlier ones (`concurrency: pages` + `cancel-in-progress: true`).
- Workflow file under 60 lines.
- Total Action time <2 min.

## Architecture

```yaml
name: Deploy to Pages
on:
  push: { branches: [main] }
  schedule: [{ cron: '0 0 * * *' }]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: node build.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
      - id: deploy
        uses: actions/deploy-pages@v4
```

## Related code files

**Create:**
- `.github/workflows/deploy.yml`

**Modify:**
- `README.md` — add a "Deploy" section with one-shot setup steps.

## Implementation steps

1. Write `.github/workflows/deploy.yml` exactly as in Architecture above.
2. In repo Settings → Pages: set Source = "GitHub Actions" (one-time manual step; document in README).
3. (Optional) Custom domain: add `src/CNAME` containing the apex (e.g. `iammiti99.dev`); ensure `build.js` copies it (already covered by recursive `cp` of `src/`).
4. Push to `main` → verify Action run succeeds and `https://<user>.github.io/iammiti99/` loads.
5. Manual dispatch the workflow once to confirm `workflow_dispatch` path.
6. Wait for next cron tick (or temporarily set `cron: '*/5 * * * *'` to verify, then revert).

## Todo

- [ ] `.github/workflows/deploy.yml`
- [ ] One-time: Settings → Pages → Source = GitHub Actions
- [ ] First push deploys cleanly
- [ ] Manual `workflow_dispatch` works
- [ ] (Optional) Custom domain CNAME

## Success criteria

- Action completes green on push, schedule, and dispatch.
- Site is reachable at the GitHub Pages URL.
- Star + last-commit decorations match live values within 24 h.
- No `gh-pages` branch is ever created.

## Risks

- First-time setup needs a manual UI click (Pages source). Mitigation: document in README.
- Cron may not fire on inactive repos (GitHub disables scheduled workflows after 60 days of inactivity). Mitigation: README note; manual `workflow_dispatch` as fallback.
- API rate-limit if many repos. Mitigation: workflow token gives 1000/hr — fine for dozens.

## Security

- `GITHUB_TOKEN` is repo-scoped, ephemeral, expires when the run ends. Standard.
- `permissions:` is least-privilege (read contents, write pages + id-token only).
- Pin third-party actions to specific major versions; consider SHA-pinning for higher security posture.

## Next

→ All phases done. Hand off to `/ck:cook plans/260430-2135-port-linkyee-personal-page/plan.md`.
