---
phase: 2
title: "Link sections / multi-section bio (#9)"
status: completed
priority: P1
effort: "2d"
dependencies: []
---

# Phase 2: Link sections / multi-section bio (#9)

## Overview

Group `[[params.links]]` into named sections with optional headers — Linktree's primary content-grouping feature, and the #1 reason users hit the wall on a flat list. Resolves deferred issue #9 from v0.4 CHANGELOG.

**Backward-compat contract:** if user provides flat `[[params.links]]` only, render unchanged. If user provides `[[params.sections]]`, render section-grouped. Both supported in parallel during transition (sections win when both present).

## Context Links

- Source: deferred per `plans/260510-0238-v0-4-release/plan.md` → "schema design dispute; needs `/ck:brainstorm`"
- Linktree feasibility: `plans/reports/researcher-260515-linktree-feature-inventory.md` Table 1 row "Link sections/grouping" — ✅ static-feasible
- Audit: `plans/reports/researcher-260515-bonsai-current-audit.md` §1 — current `bio-card.html` consumes flat `links` only

## Requirements

### Functional

- New `[[params.sections]]` array where each section has:
  - `title` (string, optional — omit to render a section without a heading)
  - `description` (string, markdown, optional — short text under heading)
  - `layout` (string, optional — per-section override of `params.layout`: stack | grid | inline)
  - `[[sections.links]]` — same shape as existing `[[params.links]]` entries
- If `params.sections` present, render section-grouped layout.
- If `params.sections` absent and `params.links` present, render existing flat layout (unchanged).
- Section headings are `<h2>` (semantic; below the `<h1>` name).
- Each section gets `<section aria-labelledby="section-{slug}">` for landmark accessibility; if `title` omitted, the section uses `aria-label` with section description or index.
- Schema-person `sameAs` flattens all link URLs across all sections (preserving existing JSON-LD behavior).

### Non-functional

- CSS additions ≤ 400 B raw / ≤ 80 B gzipped.
- No new JS.
- Per-section layout switch must reuse existing `bio__links--{layout}` classes (no duplication).
- Sections gracefully degrade when JS disabled (already zero-JS).

## Architecture

```
Schema (hugo.toml):
[[params.sections]]
  title = "Code"
  description = "Where I push commits."
  layout = "grid"
  [[params.sections.links]]
    title = "GitHub"
    url   = "https://github.com/me"
    icon  = "github"
  [[params.sections.links]]
    title = "GitLab"
    ...
[[params.sections]]
  title = "Music"
  layout = "inline"
  [[params.sections.links]]
    ...

Render tree:
<article class="bio">
  <img class="bio__avatar"/>
  <h1 class="bio__name">…</h1>
  <p class="bio__tagline">…</p>
  <p class="bio__text">…bio…</p>

  <!-- multi-section branch -->
  <section class="bio__section" aria-labelledby="section-code">
    <h2 id="section-code" class="bio__section-title">Code</h2>
    <p class="bio__section-desc">Where I push commits.</p>
    <nav class="bio__links bio__links--grid" aria-label="Code links">
      <a class="link">…</a>
      …
    </nav>
  </section>

  <section class="bio__section" aria-labelledby="section-music">
    <h2 id="section-music" class="bio__section-title">Music</h2>
    <nav class="bio__links bio__links--inline" aria-label="Music links">
      …
    </nav>
  </section>
</article>
```

**Decision rationale (KISS over generic CMS):**
- Two-tier only — sections contain links, no sub-sections. Linktree itself is flat-grouped.
- Slug generation uses Hugo's `urlize` for stable ids.
- Per-section `layout` override is opt-in; defaults to `params.layout`.

## Related Code Files

**Modify:**
- `layouts/partials/bio-card.html` — branch on `params.sections` vs `params.links`; emit `<section>` wrappers
- `layouts/partials/schema-person.html` — flatten `sections.*.links[*].url` into `sameAs` array
- `layouts/index.rss.xml` — emit RSS items for all links across all sections (preserves existing RSS contract)
- `static/css/bonsai.css` — append `.bio__section`, `.bio__section-title`, `.bio__section-desc` rules
- `README.md` — document `[[params.sections]]` syntax + backward-compat note
- `exampleSite/hugo.toml` — either: (a) keep flat to showcase original layout, or (b) add a `/sections/` demo content file

**Create:**
- `exampleSite/content/sections/_index.md` (optional) — demo page exercising sections
- `layouts/sections/single.html` (optional) — only if (b) above

## Implementation Steps

1. **Refactor `bio-card.html`** — extract the link-rendering nav into a sub-partial `partials/link-group.html` taking `dict "links" $links "layout" $layout "label" $label`:
   ```html
   {{- $links := .links -}}
   {{- $layout := .layout -}}
   {{- $label := .label -}}
   <nav class="bio__links bio__links--{{ $layout }}" aria-label="{{ $label }}">
     {{- range $links }}{{ partial "link-button.html" . }}{{- end }}
   </nav>
   ```

2. **Branch in `bio-card.html`**:
   ```html
   {{- $sections := site.Params.sections -}}
   {{- $links := site.Params.links -}}
   {{- $layout := site.Params.layout | default "stack" -}}
   …
   {{- if $sections }}
     {{- range $i, $section := $sections }}
       {{- $secLayout := $section.layout | default $layout -}}
       {{- $secTitle := $section.title -}}
       {{- $slug := $secTitle | urlize | default (printf "section-%d" $i) -}}
       <section class="bio__section"
                {{ with $secTitle }}aria-labelledby="section-{{ $slug }}"{{ else }}aria-label="{{ i18n "nav_links_label" }} {{ add $i 1 }}"{{ end }}>
         {{- with $secTitle }}
         <h2 id="section-{{ $slug }}" class="bio__section-title">{{ . }}</h2>
         {{- end }}
         {{- with $section.description }}
         <p class="bio__section-desc">{{ . | markdownify }}</p>
         {{- end }}
         {{ partial "link-group.html" (dict "links" $section.links "layout" $secLayout "label" (or $secTitle (i18n "nav_links_label"))) }}
       </section>
     {{- end }}
   {{- else if $links }}
     {{ partial "link-group.html" (dict "links" $links "layout" $layout "label" (i18n "nav_links_label")) }}
   {{- end }}
   ```

3. **Schema flatten** — in `schema-person.html`:
   ```go
   {{- $allLinks := slice -}}
   {{- if site.Params.sections -}}
     {{- range site.Params.sections -}}
       {{- range .links -}}{{- $allLinks = $allLinks | append . -}}{{- end -}}
     {{- end -}}
   {{- else -}}{{- $allLinks = site.Params.links -}}{{- end -}}
   {{- /* then iterate $allLinks for sameAs as before */ -}}
   ```

4. **RSS flatten** — `layouts/index.rss.xml` mirrors the same flatten logic.

5. **CSS additions** (`static/css/bonsai.css`):
   ```css
   .bio__section { margin-top: 2rem; }
   .bio__section:first-of-type { margin-top: 1.5rem; }
   .bio__section-title {
     font-family: var(--bonsai-font-display);
     font-size: 1.05rem;
     font-weight: 600;
     margin: 0 0 .5rem;
     color: var(--bonsai-text);
   }
   .bio__section-desc {
     font-size: .9rem;
     color: var(--bonsai-muted);
     margin: 0 0 .75rem;
   }
   .bio__section .bio__links { margin-top: .5rem; }
   ```

6. **README**: new "Sections" subsection under Configuration. Show side-by-side flat vs sectioned example. State backward-compat.

7. **exampleSite demo**: add `exampleSite/content/sections/_index.md` with `[[params.sections]]` override (Hugo supports page-level params override of site params). Add a navigation card on the index `/` linking to `/sections/` so demo is discoverable.

8. **Build verification**: `hugo --gc --minify --templateMetrics`. Verify both `/` (flat) and `/sections/` (sectioned) render correctly; verify schema sameAs includes all flattened URLs.

## Todo List

- [ ] Extract `partials/link-group.html` from `bio-card.html`
- [ ] Branch on `params.sections` in `bio-card.html`
- [ ] Flatten sections in `schema-person.html` for `sameAs`
- [ ] Flatten sections in `index.rss.xml`
- [ ] Append section CSS rules
- [ ] Document `[[params.sections]]` in README with example
- [ ] Add `exampleSite/content/sections/_index.md` demo
- [ ] Verify backward-compat: existing flat-list demos render unchanged
- [ ] Confirm CSS budget ≤ +400 B raw / +80 B gzipped

## Success Criteria

- [ ] Flat `params.links` config still renders identical HTML to v0.4 (byte-diff on test fixture)
- [ ] `params.sections` config renders `<section aria-labelledby="…">` wrappers with `<h2>` headings
- [ ] Per-section `layout` override works (e.g., section 1 = grid, section 2 = inline)
- [ ] `schema-person.html` JSON-LD `sameAs` includes all flattened URLs
- [ ] RSS feed `<item>` count = sum across all sections' links
- [ ] No CLS introduced (section headings have explicit `margin`, no layout shift)
- [ ] CSS gzipped delta ≤ +80 B

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Both `params.links` and `params.sections` set → ambiguous | `sections` wins; emit `warnf` at build time to nudge user toward single source. |
| Empty section (no `links`) accidentally renders empty `<nav>` | Skip section entirely if `len .links == 0`. |
| Slug collisions for duplicate section titles | Fall back to `section-{index}` when `urlize` produces empty or duplicate. |
| Per-section `layout` value invalid | Reuse the existing layout-allowlist warning logic from `bio-card.html`. |
| Schema `sameAs` order changes when migrating from flat to sectioned | Documented as benign — order is semantically irrelevant in `sameAs`. |

## Security Considerations

- `markdownify` on `section.description` — already done elsewhere for `params.bio`; same trust model.
- No user-controlled HTML rendered raw.
