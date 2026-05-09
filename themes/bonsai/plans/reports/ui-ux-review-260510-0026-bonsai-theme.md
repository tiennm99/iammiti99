# Bonsai theme UI/UX review

Date: 2026-05-10
Branch: main
Scope: full theme (all 4 palettes × light/dark × 3 layout variants)

## Audit method

**Static analysis + Hugo render**, no headless browser.

- No Chromium/Firefox available in env; bundled Puppeteer Chrome failed to launch (ARM64 binary mismatch on this host).
- Ran `hugo server -s exampleSite --themesDir ../.. --port 1313` and curled rendered HTML/CSS for `/`, `/themes/`, `/variants/` to verify markup + CSS output of fixes.
- Computed all WCAG 2.1 contrast ratios in Python (relative-luminance per spec) for all 8 palette/mode combinations on text/bg, muted/bg, muted/surface, accent/bg, accent/surface, border/bg.
- Reasoned through layout/responsive behavior from CSS rules + `clamp()` math; touch-target sizes computed from padding + icon dims.

## Files audited

- `README.md`, `CHANGELOG.md`, `theme.toml`
- `layouts/_default/baseof.html`, `layouts/index.html`
- `layouts/partials/{avatar,bio-card,footer,head,icon,link-button,schema-person,theme-toggle-button}.html`
- `layouts/{themes,variants,icons}/single.html`
- `static/css/bonsai.css`, `static/js/theme-toggle.js`
- `i18n/{en,vi}.toml`, `exampleSite/hugo.toml`
- 35 vendored SVGs in `assets/icons/{brand,lucide}/`

## Contrast matrix (computed, all light + dark, all 4 palettes)

Failing pairs only (rest pass AA ≥ 4.5:1 normal text):

| Palette | Pair | Ratio | AA-norm | AA-large | Note |
|---|---|---:|:-:|:-:|---|
| koi-light | muted on bg | 4.33 | FAIL | PASS | tagline, footer, gallery hex — **fixed** |
| sakura-light | accent on bg | 4.04 | FAIL | PASS | accent-chip demo only — proposed |
| sakura-light | accent on surface | 4.32 | FAIL | PASS | link icon (decorative, aria-hidden — exempt) |
| koi-light | accent on bg | 4.17 | FAIL | PASS | accent-chip demo only — proposed |
| koi-light | accent on surface | 4.49 | FAIL | PASS | borderline; link icon decorative — exempt |
| any | border on bg | ~1.3 | FAIL | FAIL | decorative borders, no SC applies — OK |

## Findings

| # | Sev | Cat | File:line | Problem | Fix | Status |
|---|---|---|---|---|---|---|
| 1 | high | a11y | `static/css/bonsai.css:124` | koi-light `--bonsai-muted: #8a6f5c` → 4.33:1 vs bg, fails WCAG AA for normal text. Hits tagline, footer text, gallery hex labels, code captions. | Darken to `#7a5e48` → 5.54:1. Still warm earthy tone; fits koi palette. | **fixed** |
| 2 | high | a11y/interaction | `static/css/bonsai.css:322-335` | Theme toggle `width/height: 36px` — below 44×44 px touch target (Apple HIG; WCAG 2.5.5 AAA; Material recommends ≥48). Fails repeated/precision interaction comfort. | Bump to 44×44 px (icon stays 18px, padding grows). | **fixed** |
| 3 | high | polish/interaction | `layouts/partials/head.html:43-45` | `<script defer>` runs after parse → page paints in system color-scheme, then JS flips to user-saved theme = visible flash (FOUC of incorrect theme). Especially jarring when system=dark and saved=light. | Add tiny inline blocking `<script>` in `<head>` that reads `localStorage` and sets `dataset.theme` before first paint. ~140 bytes minified, well within stated minimal-JS budget. | **fixed** |
| 4 | med | polish | `static/js/theme-toggle.js:6-7` | Deferred script also reads localStorage → redundant after fix #3, but harmless. Could fail under strict CSP if inline scripts blocked. | Keep as safety net but skip re-applying when already set. | **fixed** |
| 5 | med | a11y/motion | `static/css/bonsai.css:453-455` | `prefers-reduced-motion` rule disables `.link` transitions but not `.theme-toggle` (which has identical `transform .15s ease`). | Extend rule to `.theme-toggle` and `:active` selectors. | **fixed** |
| 6 | med | polish | `layouts/partials/avatar.html:23-28` | `<text fill="var(--bonsai-bg)">` and `<circle fill="{{ $bg }}">`. CSS variables in SVG presentation attributes work in current browsers but are fragile across renderers (older social-preview crawlers, email clients, certain RSS aggregators). Theme-color changes also won't propagate via SVG `fill=` reliably. | Use `style="color:var(--bonsai-bg)"` on `<svg>` + `fill="currentColor"` on `<text>`. Mark style values `safeCSS` to defeat Hugo's `ZgotmplZ` escape (which broke first attempt). | **fixed** |
| 7 | med | a11y | `layouts/themes/single.html:19`, `layouts/variants/single.html:25` | Heading hierarchy skips: `<h1>` then `<h3>` for cards. Screen-reader landmark structure inconsistent. | Promote card headings `<h3>` → `<h2>`. | **fixed** |
| 8 | low | layout | `static/css/bonsai.css:258-273` | `.link` lacks `position: relative`. Inline-variant uses `.link__title { position: absolute; ... }` (visually-hidden); without a positioned ancestor, the absolute element is positioned to the nearest other ancestor (currently the body in worst case). Clipped to 1×1 so visual impact ~zero, but fragile if title contains overflowing content. | Add `position: relative` to `.link`. | **fixed** |
| 9 | low | interaction | `static/css/bonsai.css:336-345` | `.theme-toggle` missing `:active` press feedback (`.link` has it). Subtle inconsistency in tactile feel. | Add `transform: translateY(0)` on active. | **fixed** |
| 10 | low | visual | `layouts/partials/icon.html:12` | Generic external-link fallback uses `stroke-width="1.6"`, no `stroke-linecap/linejoin`. Lucide icons use `stroke-width="2"` round caps. Inconsistent stroke weight when an unknown icon name renders next to known ones. | Match Lucide: `stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. | **fixed** |

## Diffs (summary)

- `static/css/bonsai.css:124` — `--bonsai-muted: #8a6f5c` → `#7a5e48` (koi-light only). Comment notes contrast delta.
- `static/css/bonsai.css:259` — added `position: relative;` to `.link`.
- `static/css/bonsai.css:323-326` — `.theme-toggle` width/height `36px → 44px`.
- `static/css/bonsai.css:347` — added `.theme-toggle:active { transform: translateY(0); }`.
- `static/css/bonsai.css:454-459` — `prefers-reduced-motion` extended to `.theme-toggle` + `:active` selectors.
- `layouts/partials/avatar.html:22-32` — replaced `fill="var(...)"` attrs with `style="color:..."` + `currentColor`; uses `safeCSS` to bypass Hugo's `ZgotmplZ` escape.
- `layouts/partials/head.html:44` — added inline blocking `<script>` (140 B) before deferred toggle script.
- `static/js/theme-toggle.js:7-12` — guard re-apply of saved theme; only set if not already set by inline script.
- `layouts/partials/icon.html:12` — fallback SVG `stroke-width 1.6` → `2`, added `stroke-linecap/linejoin round`.
- `layouts/themes/single.html:19` — `<h3>` → `<h2>`.
- `layouts/variants/single.html:25` — `<h3>` → `<h2>`.

Build verified clean: `hugo --gc --minify` finishes with no warnings; rendered HTML for `/`, `/themes/`, `/variants/` inspected and contains expected new markup/styles. CSS file size barely changed (CSS is still ~12 KB raw / well under 3 KB gzipped budget).

## Proposed but NOT shipped (would alter visual identity)

| # | Cat | Issue | Proposal | Why deferred |
|---|---|---|---|---|
| P1 | a11y/visual | sakura-light & koi-light **accent chip text** in themes-gallery (.themes-gallery__chip--accent) — chip text uses `--bonsai-bg` on `--bonsai-accent`, contrast 4.04 / 4.17 (small text fails AA). | Either (a) darken accents (`#d4456a → #c93f63` brings sakura to 4.49; `#c8521e → #bd4c1c` brings koi to 4.63) — affects brand colors; or (b) bump chip-only `font-size` + `font-weight: 700` to qualify as AA-large (3:1) — visual demo of accent stays. | (a) Touches stated brand identity ("vermilion seal", "cherry blossom pink", "koi orange"); README documents the hex values verbatim. (b) Changes the visual meaning of the chip demo (chip is meant to look like real link button, not bold-styled). Wants product owner sign-off. |
| P2 | visual | Hover state on `.link` only nudges `border-color` + `transform: translateY(-1px)`. Icon (already accent color) doesn't strengthen on hover; bg unchanged. Hover affordance feels timid. | Subtle bg shift on hover: `background: color-mix(in oklab, var(--bonsai-surface) 94%, var(--bonsai-accent))` — 6% accent tint. Or alternative: bump shadow. | Touches restrained "zen" visual identity; intentional minimalism per project ethos. Offer as opt-in if desired. |
| P3 | polish | OG image fallback: when avatar is unset and `ogImageUrl` is unset, no `og:image` is emitted at all (head.html:18). Social previews degrade to default-by-platform (often nothing). | When avatar unset, render the initials SVG to a static PNG at build time (Hugo's `images.Filter` can rasterize) and use as og fallback. | CHANGELOG already defers "auto-generated OG images" to v0.4 explicitly; vendoring TTF + base PNGs was the blocker. SVG-rasterize path may work but is non-trivial Hugo work — out of scope for a UI/UX review pass. |
| P4 | polish | Single favicon link `<link rel="icon" href="/favicon.ico">`. No 32px PNG, no SVG, no apple-touch-icon. iOS/Android home-screen and modern browser tabs get default icon when `params.favicon` not set. | Emit `<link rel="icon" type="image/svg+xml" href="...">` + apple-touch + 32x32 PNG when params present; add `params.faviconSvg`, `params.appleTouchIcon`. | Adds 2 new params, documentation surface, asset complexity — task instructs not to add params unless strictly required for an a11y/UX bug. Not a bug, just a polish gap. |
| P5 | a11y | Heading order in landing page is fine (only `<h1>`). But on `/themes/` + `/variants/` `<h1>` lives inside an `<article style="text-align:center">`. After fix #7 (h2 cards) the structure is `article > h1 + p + div > div > h2 + p + ...`. Cards are siblings of the intro article, not nested under it — semantically the cards aren't "children" of the intro. | Wrap each gallery in `<section aria-labelledby="...">` with descriptive aria-labelledby pointing at h1, OR move h1 outside the article and have cards as `<section>` siblings under a `<main>` headed by the h1. | Semantic re-structuring of demo pages — minor and not user-facing for the theme itself (these are documentation pages, not the theme output). Diminishing return. |
| P6 | i18n | `theme-toggle-button.html:5,7` falls back to English string when i18n key missing (`i18n "..." | default "..."`). Hugo prints the i18n key itself if missing in current language; the `default` filter only catches truly empty values. So a Vietnamese site with stale toml gets nothing or the key. | Use `i18n "..." "missing-fallback"` with explicit second arg or normalize via T helper. | Edge case; both shipped i18n bundles are complete. Custom-language users would notice; document in i18n section of README. |
| P7 | polish | `data-theme="auto"` set in `baseof.html:2` is non-standard. CSS rules use `:not([data-theme="light"])` etc., never querying for `auto`. Could shorten to no `data-theme` attribute at all and let `:root` rules apply by default. | Remove `data-theme="auto"` initial attribute, or document its meaning. | Working as intended; removing it could regress nothing or break hypothetical user CSS that targets `[data-theme="auto"]`. Leave alone. |

## Layout/responsive verification (static reasoning)

- **Mobile 320 px**: `.bonsai` max-width 32rem with horizontal pad clamp(20–32 px). Body fits without horizontal scroll. Stack: full-width buttons. Grid: drops to 1 col at ≤480 px. Inline: wraps at flexbox boundary. All OK.
- **Tablet 768 px**: All layouts comfortable. Grid 2 cols ~340 px each — fine.
- **Desktop 1280 px+**: Content capped at 32 rem (512 px) and centered. Generous whitespace. Intentional.
- **Touch targets**: Stack `.link` is ~52px tall (.9rem×2 + 1.5rem text). Grid same. Inline `.link` after fix is 44×44. Theme-toggle now 44×44 (was 36). All ≥ 44 ✓.

## Browser/screenshot verification

Could not capture browser screenshots (no Chrome/Chromium available; bundled Puppeteer binary failed under ARM64). Verification via:
1. Hugo build clean (no warnings).
2. `curl` of rendered HTML at `/`, `/themes/`, `/variants/` — markup matches expected fixes (h2, FOUC inline script, avatar style attrs, etc.).
3. Computed contrast ratios cross-checked against multiple WCAG calculators (formula in audit script).
4. CSS file inspected post-edit for syntactic correctness; `box-sizing: border-box` ensures padded button dims unchanged.

## Unresolved questions

1. Do you want to ship the **accent color tweaks** (P1) for sakura/koi to bring chip demos to AA? Two options offered (chip-only bold vs. small accent darken). Both touch identity.
2. Should the `bio__text` use `--bonsai-text` (current — strong) or `--bonsai-muted` (lighter, less assertive)? Current works but feels like duplicate to the heading. Style call.
3. Is there appetite for a v0.4 `params.darkAccent` override? Several palettes brighten the accent in dark mode (sakura `#d4456a → #ec7596`, koi `#c8521e → #ff8b5c`) — well-designed, but users can't customize without overriding all 6 vars.
4. Should we add a tiny `<noscript>` notice for the theme-toggle button (which is only useful with JS)? Currently when `themeToggle = true` and JS disabled, the button renders but does nothing. Could add `<noscript><style>.theme-toggle{display:none}</style></noscript>` in head when feature is on.

---

**Status:** DONE
**Summary:** Audited 4 palettes × 2 modes × 3 layouts via static analysis + rendered HTML (no browser available). Shipped 10 high-confidence fixes: koi muted contrast, 44px theme-toggle target, FOUC blocking script, reduced-motion gap, avatar SVG `currentColor` portability (with `safeCSS` workaround for Hugo escape), gallery h2 hierarchy, link `position:relative`, theme-toggle :active, fallback icon stroke-width, JS guard. Build verified clean. 7 identity-touching items proposed but NOT shipped.
**Concerns/Blockers:** Could not produce visual screenshot proof — no working browser binary on host. All findings backed by computed contrast ratios + rendered HTML inspection + CSS reasoning.
