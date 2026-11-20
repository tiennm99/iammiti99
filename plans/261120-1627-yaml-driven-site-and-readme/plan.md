# Plan: one YAML file renders the site and a Markdown README

**Status:** done
**Date:** 2026-11-20
**Stack:** Hugo Extended 0.154, the banyan theme as a Hugo module, GitHub Pages

## Outcome

One file, `config/_default/params.yml`, holds the profile: name, tagline, bio,
avatar, links and sections. A single `hugo` build renders it into:

1. the website, `index.html`, as today;
2. `README.md`, served on the site at `/README.md`;
3. the repo's root `README.md`, kept in sync by CI.

## Decisions

- **Params get their own file instead of moving to `data/`.** The theme reads
  `site.Params.*` in about 100 places. Hugo's config directory loads
  `config/_default/params.yml` as the `params` block, so the profile sits in its
  own file and the theme stays as it is.
- **The theme moves to its own repo first, renamed banyan.** It becomes
  `tiennm99/banyan`, which this site imports as a Hugo module. Banyan is the
  English word for cây đa, the village tree of Vietnam: one root with many
  trunks and leaves.
- **The Markdown output is a theme feature.** Its template lives in the
  banyan repo, so any site using the theme can enable it, and ships in a theme
  release. The site turns it on through `outputs.home`.
- **The README is generated from the CI build.** CI builds with the Pages
  `baseURL`, so the README's avatar and links are absolute and work both on
  GitHub and on the site. A local build with `baseURL: /` must not be
  committed as the README.
- **CI commits the README back when it changes.** A push made with
  `GITHUB_TOKEN` starts no new workflow run, so there is no loop.
- **The developer docs leave the README.** The generated README carries the
  profile plus a short fixed quick-start footer from the template. The current
  README body (how it works, local dev, deployment, base URL, other hosts,
  layout) moves to `docs/`.

## Phases

| # | Phase | Status | File |
| --- | --- | --- | --- |
| 0 | Split the theme into its own repo, `tiennm99/banyan` | done | [phase-00-split-theme-into-banyan-repo.md](phase-00-split-theme-into-banyan-repo.md) |
| 1 | Split params into their own file and add the Markdown output | done | [phase-01-params-file-and-markdown-output.md](phase-01-params-file-and-markdown-output.md) |
| 2 | CI README sync and docs move | done | [phase-02-ci-readme-sync-and-docs.md](phase-02-ci-readme-sync-and-docs.md) |

## Acceptance criteria

- `hugo --gc --minify` writes `public/index.html` and `public/README.md`, and
  `index.html` renders the same as before the change (compare the built HTML).
- Editing only `config/_default/params.yml` changes both outputs.
- `README.md` lists the same visible links as the page, in the same order and
  grouping, and skips links outside their `startDate`/`endDate` window.
- `https://tiennm99.github.io/iammiti99/README.md` serves the Markdown.
- After a push that changes the profile, CI commits the new root `README.md`,
  and the Pages deploy stays green.
- `docs/` holds the developer docs and the README links to them.

## Out of scope

- The GitHub profile README (`tiennm99/tiennm99`).
- The avatar's EXIF and size: tracked separately. See "Unresolved questions".

## Unresolved questions

- Strip the avatar's EXIF (it has a GPS section) and resize it in a separate
  change? Removing it from history needs a force push.
