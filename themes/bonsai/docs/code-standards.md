# Code standards

How code in this theme is written and why. The goal is predictability — both for humans reading the diff and for LLM-driven tooling navigating the repo.

## File naming

- **Kebab-case** for all filenames: `link-button.html`, `theme-toggle.js`, `schema-website.html`.
- Long descriptive names beat short cryptic ones — `analytics-loader.html` is better than `al.html`.
- Hugo partials living under `layouts/partials/` use the `.html` extension even when they emit JSON-LD or `<script>` blocks — Hugo doesn't care about extension, but consistency helps grep.

## Partial composition

Each partial reads its input via exactly one of:

1. **`site.Params` directly** — for page-wide singletons (`head.html`, `bio-card.html`, `schema-person.html`).
2. **A `dict` argument** — for reusable rendering blocks (`link-group.html`, `link-button.html`).

Never both. If a partial needs context, pass it explicitly.

## CSS conventions

- **BEM-ish naming**: `.block`, `.block__elem`, `.block--modifier`. Examples: `.bio`, `.bio__avatar`, `.bio__avatar--initials`, `.link`, `.link__icon`, `.link--featured`.
- **CSS custom properties** for every user-tunable value: colors per palette, layout sizes, fonts. Live in `:root` (layout) or `[data-bonsai-theme="…"]` blocks (color).
- **No `!important`** except the `noscript` rule hiding `.theme-toggle` when JS is disabled.
- **No deeply nested selectors** — keep specificity at ≤ (0,2,0). The single attribute selector `svg[stroke="currentColor"]` is the only exception.
- **No web fonts** — system font stacks only (`ui-sans-serif`, `system-ui`, `ui-serif`, `Georgia`).
- **Honor `prefers-reduced-motion`** — every transition lives behind a media query that disables it.

## Template patterns

- **Variable-first**: read params/inputs into named locals at the top of the partial. Branches use the locals.
- **`with` over nil-checks** where idiomatic: `{{ with $tagline }}…{{ end }}` is preferred over `{{ if $tagline }}…{{ end }}`.
- **`else if`, not `else with`** — `else with` had stricter parser rules in some Hugo versions; `else if` is universal.
- **`safeHTML` / `safeJS` / `safeCSS`** only when the value comes from a vetted source (an i18n bundle string or a Hugo `jsonify` payload). Never for user-controlled content rendered raw.
- **Warn loudly** for misconfigurations — `warnf` produces a build-time warning without failing the build.

## i18n keys

- Snake_case: `nav_links_label`, `skip_to_content`, `share_copied`.
- Every user-facing string the theme renders goes through `{{ i18n "key" }}`. Add a fallback default with `| default "…"` so missing keys don't leak raw identifiers into the DOM.
- Both `en.toml` and `vi.toml` must be updated together for any new key.

## Asset handling

- **All processable assets live under `assets/`** (`assets/css/`, `assets/js/`, `assets/icons/`, optional `assets/avatars/`, `assets/og/`, `assets/fonts/`).
- **`static/`** is for files Hugo should copy through verbatim — `_headers`, `vercel.json`, demo media that won't be processed.
- **Fingerprint + minify + SRI** every CSS and JS file shipped to production: `resources.Get | resources.Minify | resources.Fingerprint "sha384"` → emit with `integrity=` + `crossorigin="anonymous"`.

## Opt-in posture

Every new feature is **off by default**. A v0.4 site upgraded to v0.5 must build with byte-identical output unless the user explicitly opts in. This rule has zero exceptions.

When unsure: ship with a `param.foo = false` default and document the opt-in in README.

## Build invariants

- `hugo --gc --minify --themesDir ../..` from `exampleSite/` must produce a clean build with no `ERROR` lines.
- Lighthouse CI must pass thresholds ≥ 0.90 across Performance, Accessibility, Best-Practices, SEO.
- No new `console.error` / `console.warn` from theme JS at runtime.
- CSS production size budget: ≤ 5.5 KB gzipped (stretch ≤ 5 KB).

## Commit messages

Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`, `style:`. Scope is optional but helpful: `feat(theme): add multi-section bio`.

No AI references in commit messages. Keep them describing the *change*, not the *process*.
