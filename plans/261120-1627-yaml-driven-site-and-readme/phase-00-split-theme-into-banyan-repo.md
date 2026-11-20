# Phase 0: split the theme into its own repo, `tiennm99/banyan`

## Context

The theme lived in `tiennm99/bonsai` until 2026-10, when it was merged into
this repo and the standalone repo was deleted. It now moves out again under a
new name, **banyan**: the English word for cây đa, the village tree of Vietnam,
whose hanging roots grow into new trunks. That is one root page with many
branches, the page linking out to many sites.

Checked on 2026-11-20:

- `tiennm99/banyan` is free, and no theme in the official Hugo list uses the
  name.
- sum.golang.org and proxy.golang.org hold nothing for
  `github.com/tiennm99/bonsai`, so no published checksum ties the old tags.
- The tags `v0.1.0` to `v0.4.0` in this repo point at rewritten site commits,
  not theme commits. Do not copy them to the new repo.

## Files

- New repo `tiennm99/banyan`, public, built from `themes/bonsai/` with its
  history.
- In this repo: remove `themes/bonsai/`, add `go.mod` and the module import,
  and update `hugo.yml`, `README.md`, `NOTICE` and `.github/workflows/deploy.yml`.

## Steps

1. **Back up first.** Record this repo's `main` head SHA in the workspace's
   `plans/reports/` branch-heads backup. Make a fresh mirror clone in
   `<workspace>/.tmp/banyan-split/` and work only there.
2. **Split.** In that clone, run
   `git filter-repo --subdirectory-filter themes/bonsai`. Delete every tag it
   carried over. Check that `git log` shows the theme commits, back to
   `feat: initial Bonsai theme scaffold`, with the theme files at the root.
3. **Rename bonsai to banyan everywhere except records.** That covers about 286
   mentions in 30 files:
   - `theme.toml`: the name, description (the banyan meaning in place of
     "Japanese bonsai aesthetics"), tags, and the homepage, licence and demo
     URLs.
   - `assets/css/bonsai.css` becomes `banyan.css`, and `head.html` loads it.
     The `.bonsai` class and the `data-bonsai-*` attributes are renamed in
     the CSS, JS and layouts together.
   - The default `colorTheme` palette `bonsai` becomes `banyan`.
   - The `localStorage` key `bonsai-theme` becomes `banyan-theme`. A visitor's
     saved light or dark choice resets once; accept that.
   - `warnf` prefixes, i18n strings, the README, CONTRIBUTING, NOTICE, docs,
     `exampleSite/` and `scripts/`.
   - Leave untouched what records history: `plans/`, `docs/journals/` and the
     past entries in `CHANGELOG.md`. Add a new CHANGELOG entry for the rename.
   - Then check with `grep -ri bonsai`: only the records may still match.
4. **Make it a Hugo module.** Add `go.mod` (`module github.com/tiennm99/banyan`)
   and a theme `hugo.toml` with `module.hugoVersion.min = "0.140.0"`. This also
   clears two warnings from the Hugo themes check.
5. **Re-capture the screenshots.** Run `scripts/capture-screenshots.sh` so
   `images/screenshot.png` and `images/tn.png` show the renamed theme.
6. **Publish.** Create `tiennm99/banyan` (public), push `main`, and tag
   `v0.6.0`. Turn on Pages for the demo and check that `build.yml`,
   `deploy.yml` and `lighthouse-ci.yml` are green.
7. **Switch this repo to the module.**
   - Run `hugo mod init github.com/tiennm99/iammiti99`. In `hugo.yml`, replace
     `theme: bonsai` with a `module.imports` entry for
     `github.com/tiennm99/banyan`, and run `hugo mod get github.com/tiennm99/banyan@v0.6.0`.
   - Rename any `bonsai` values in this site's params, such as `colorTheme`.
   - Delete `themes/bonsai/`.
   - Add `actions/setup-go` to `deploy.yml`, with `go-version: stable`.
   - Update `README.md` and `NOTICE` to point at `tiennm99/banyan`.
8. **Check.** The built `index.html` must match the pre-split build except for
   the renamed class, attribute, CSS file and storage key. Diff it.

## Validation

- `tiennm99/banyan` has the theme history, tag `v0.6.0`, and a live demo.
- `grep -ri bonsai` in both repos matches only records.
- This repo builds from the module, and its Pages deploy is green.

## Risks

- **Two repos to maintain:** a theme change now needs a theme release, then
  `hugo mod get -u` here.
- **CI needs Go:** Hugo modules need the Go binary; step 7 adds it.

## Rollback

Until step 7 lands, this repo is unchanged. After it, revert the step 7
commit to bring `themes/bonsai/` back. The new repo can stay or be deleted
through the `github-manage` retirement gates.
