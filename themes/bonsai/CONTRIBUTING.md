# Contributing to Bonsai

Thanks for your interest. Bonsai is intentionally small — every change should make it simpler, faster, or more useful, never bigger for its own sake.

## Local development

```bash
git clone https://github.com/tiennm99/bonsai.git
cd bonsai/exampleSite
hugo server --themesDir ../.. --bind 0.0.0.0
```

Open `http://localhost:1313/`. Edits to `layouts/`, `static/`, `data/`, and `assets/` hot-reload.

Hugo Extended ≥ 0.128 required. CI pins 0.154.0.

## Adding an icon

The icon system is data-driven — adding one means three small edits.

1. **Vendor the SVG.** Edit `scripts/sync-icons.sh`:
   - For brand/social icons → add the slug to the `BRAND_SLUGS` list (sourced from [Simple Icons](https://simpleicons.org)).
   - For UI/utility icons → add the slug to the `UI_SLUGS` list (sourced from [Lucide](https://lucide.dev)).
2. **Run the script** to fetch and normalise:
   ```bash
   ./scripts/sync-icons.sh
   ```
3. **Register the public name** in `data/icons.yaml`:
   ```yaml
   newicon: { family: brand, slug: newicon }
   ```
4. Rebuild and verify the icon renders in the gallery: `cd exampleSite && hugo server --themesDir ../..` → `http://localhost:1313/icons/`
5. Add the new name to the appropriate table in `README.md`.

## Pull requests

- Branch from `main`. Keep PRs focused — one concern per PR.
- Conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `refactor:`.
- For visual changes, attach a before/after screenshot (the live demo URL helps reviewers).
- CI must be green (`build` workflow runs `hugo --gc --minify` against `exampleSite`).

## Style

- HTML & CSS: 2-space indent. Keep `partials/` files under 30 lines where possible.
- Hugo templates: prefer `{{- ... -}}` to suppress whitespace; use `partials` for reuse.
- CSS: BEM-ish naming (`.bio__name`, `.link__icon`); CSS custom properties for theming.
- No build steps for end users — vendored assets only. If you reach for `npm install`, reconsider.

## Reporting issues

Include: Hugo version (`hugo version`), theme version/commit, minimal reproduction (a snippet of `hugo.toml` is usually enough), expected vs actual.

## Philosophy

YAGNI · KISS · DRY. If a feature would be useful for *some* sites, it doesn't belong here unless it's useful for *most* link-in-bio sites. The strength of Bonsai is what it leaves out.
