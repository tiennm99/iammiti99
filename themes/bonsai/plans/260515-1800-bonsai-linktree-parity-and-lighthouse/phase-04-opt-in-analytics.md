---
phase: 4
title: "Opt-in click analytics (Google Analytics 4)"
status: completed
priority: P2
effort: "0.5d"
dependencies: []
---

<!-- Updated: Validation Session 1 — analytics scope reduced from {Plausible, Umami, GA4, custom} to GA4 only per user decision -->

# Phase 4: Opt-in click analytics (Google Analytics 4)

## Overview

Allow site owners to plug Google Analytics 4 in via a single config block. Zero data collected by default. When configured, emit the canonical `gtag.js` loader + init snippet in `<head>` and auto-attach `data-analytics-event` attrs on every link so per-link click-throughs land in the user's GA4 property.

**Scope decision (Validation Session 1):** v0.5 ships GA4 only — not Plausible / Umami / custom. Rationale: ubiquity. Users who prefer Plausible/Umami/etc. can paste their snippet via `params.extraHead` (existing Hugo pattern) or wait for a future phase that re-broadens.

GA4 sets cookies and **requires user consent** in jurisdictions with strict privacy law (EU GDPR, UK PECR, California CPRA). README + deploy guide make this prominent. Bonsai does not ship a consent banner.

## Context Links

- Linktree parity: `plans/reports/researcher-260515-linktree-feature-inventory.md` Table 1 rows "Basic analytics", "Click-through tracking", "UTM auto-fill"
- Validation Session 1 (plan.md `## Validation Log`) — locks scope to GA4 only.
- GA4 docs: https://developers.google.com/analytics/devguides/collection/ga4

## Requirements

### Functional

New `[params.analytics]` block (object):

```toml
[params.analytics]
  measurementId = "G-XXXXXXXXX"    # required; if empty, emit nothing
  trackClicks   = true             # auto-emit data-analytics-event on each link
  utmSource     = ""               # optional: append ?utm_source=… to external links
  utmMedium     = "bio"            # default applied alongside utmSource
  utmCampaign   = ""
```

**Behavior:**

- If `params.analytics.measurementId` empty or unset → emit nothing. **Default.**
- Else emit canonical GA4 init:
  ```html
  <script async src="https://www.googletagmanager.com/gtag/js?id={{ measurementId }}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '{{ measurementId }}');
    {{- if trackClicks }}
    document.addEventListener('click',function(e){
      var a=e.target.closest('[data-analytics-event]');
      if(a) gtag('event','outbound_click',{event_label:a.getAttribute('data-analytics-event'),link_url:a.href});
    });
    {{- end }}
  </script>
  ```
- When `trackClicks = true` (default), every `<a class="link">` gets `data-analytics-event="link:{{ .title | urlize }}"`. The inline event-firing snippet above reads this attr.
- UTM injection: if `utmSource` is set, append `?utm_source=…&utm_medium=…&utm_campaign=…` to each external `http(s)://` link at build time. Skip `mailto:`/`tel:`. Handle existing query strings (`?` already in URL → use `&`).

### Non-functional

- Default: zero new bytes shipped (everything opt-in via `measurementId`).
- When configured: ~50 KB additional asset (gtag.js from Google's CDN — not bundled).
- Inline init script: ~200 B raw / ~100 B gzipped.
- Cookie-setting → GDPR consent required where applicable. Documented in README + deploy guide; consent banner NOT shipped.

## Architecture

```
partials/head.html
  └─ {{ partial "analytics-loader.html" . }}

partials/analytics-loader.html (new)
  ├─ if not params.analytics.measurementId → return ""
  ├─ emit gtag loader (<script async src=…>)
  └─ emit inline init + (optional) click listener

partials/link-button.html (modify)
  ├─ inject data-analytics-event="link:{slug}" when trackClicks ≠ false
  └─ inject UTM params into href when params.analytics.utmSource set

(no new CSS, no new icons)
```

## Related Code Files

**Modify:**
- `layouts/partials/head.html` — `{{ partial "analytics-loader.html" . }}` invocation
- `layouts/partials/link-button.html` — emit `data-analytics-event`, append UTM
- `README.md` — new "Analytics" subsection with single GA4 example + bold GDPR consent caveat
- `docs/deployment-guide.md` — GDPR/PECR/CPRA consent guidance; recommend pairing with a consent management platform
- `exampleSite/hugo.toml` — commented-out `[params.analytics]` example block (NOT enabled in live demo)

**Create:**
- `layouts/partials/analytics-loader.html`

## Implementation Steps

1. **Create `partials/analytics-loader.html`**:
   ```go
   {{- $a := site.Params.analytics -}}
   {{- if or (not $a) (not $a.measurementId) -}}{{ return "" }}{{- end -}}
   <script async src="https://www.googletagmanager.com/gtag/js?id={{ $a.measurementId }}"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', '{{ $a.measurementId }}');
     {{- if ne ($a.trackClicks | default true) false }}
     document.addEventListener('click',function(e){
       var a=e.target.closest('[data-analytics-event]');
       if(a) gtag('event','outbound_click',{event_label:a.getAttribute('data-analytics-event'),link_url:a.href});
     });
     {{- end }}
   </script>
   ```

2. **Modify `link-button.html`** (`data-analytics-event` + UTM injection):
   ```go
   {{- $a := site.Params.analytics -}}
   {{- $trackClicks := and $a (ne ($a.trackClicks | default true) false) -}}
   {{- $url := .url -}}
   {{- /* UTM injection at build time, only for external links */ -}}
   {{- if and $a $a.utmSource (strings.HasPrefix $url "http") -}}
     {{- $sep := cond (strings.Contains $url "?") "&" "?" -}}
     {{- $url = printf "%s%sutm_source=%s&utm_medium=%s%s"
            $url $sep $a.utmSource ($a.utmMedium | default "bio")
            (cond (eq ($a.utmCampaign | default "") "") "" (printf "&utm_campaign=%s" $a.utmCampaign)) -}}
   {{- end -}}
   <a class="{{ $classes }}" href="{{ $url }}"
      {{ if $external }}target="_blank" rel="{{ $rel }}"{{ end }}
      {{ if $trackClicks }}data-analytics-event="link:{{ .title | urlize }}"{{ end }}>
   ```

3. **README "Analytics" section** — single example, bold GDPR/consent caveat:
   ```toml
   [params.analytics]
     measurementId = "G-XXXXXXXXX"
     trackClicks   = true
     utmSource     = "bio"
   ```
   > ⚠️ **GA4 sets cookies.** Sites serving EU / UK / California visitors require explicit user consent before loading `gtag.js`. Bonsai does not ship a consent banner — pair with a consent management platform (e.g. Klaro!, Cookiebot) or wait for a future phase.

4. **`docs/deployment-guide.md`** — add "Analytics & Consent" subsection covering:
   - GDPR (EU) — consent required before non-essential cookies set.
   - PECR (UK) — same.
   - CPRA (California) — disclosure + opt-out, less strict than GDPR but still requires action.
   - Sample CMP integration recipe (one paragraph; not code).

5. **exampleSite**: commented-out `[params.analytics]` block in `hugo.toml`. Do NOT set `measurementId` in the live demo.

6. **Build verification** — `hugo --gc --minify` with `measurementId = "G-FAKE"` test fixture should emit exactly two new `<script>` tags (async loader + inline init) and `data-analytics-event` on every link. With `measurementId` unset, byte-zero diff vs v0.4 output.

## Todo List

- [ ] Create `partials/analytics-loader.html` (GA4-only)
- [ ] Add `{{ partial "analytics-loader.html" . }}` to `head.html`
- [ ] Add `data-analytics-event` to link-button when trackClicks ≠ false
- [ ] Add UTM injection at build time
- [ ] Document GA4 measurementId + GDPR caveat in README
- [ ] Add consent guidance to `docs/deployment-guide.md`
- [ ] Add commented-out exampleSite block
- [ ] Verify byte-zero diff when `measurementId` unset

## Success Criteria

- [ ] When `params.analytics.measurementId` unset, built HTML has no `<script>` from this phase (byte-zero diff to v0.4)
- [ ] Valid `measurementId` renders exactly two `<script>` tags
- [ ] Every external link has `data-analytics-event="link:<slug>"` when `trackClicks ≠ false`
- [ ] UTM params correctly appended, respecting existing `?` vs `&` separator and stripping nothing
- [ ] README has bold GDPR caveat; deployment guide covers consent
- [ ] No regression in zero-JS default when not configured

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| GA4 without consent → GDPR / PECR / CPRA violation | Bold warning in README + `docs/deployment-guide.md`. Users assume responsibility (theme exposes the snippet, doesn't auto-block). |
| UTM injection breaks fragment URLs (`https://x.com/#about`) | Use `strings.Contains` to detect `?`; fragment `#` is preserved because we append before any fragment in typical bio URLs. Edge case: URL with both `?` and `#` — Hugo's `urls.Parse` could handle, but KISS string concat is fine for v0.5; document the edge case. |
| Plausible/Umami users feel underserved | Documented: future phase may broaden. They can still paste their snippet via Hugo's `params.extraHead` pattern (not shipped here but well-known). |
| Inline init script blocked by strict CSP `script-src 'self'` | Required CSP allowance: `script-src 'self' 'unsafe-inline' https://*.googletagmanager.com`. Documented in deployment guide. |
| Hugo `cond` syntax compatibility | Stable since Hugo 0.42 — safely above 0.140 floor. |

## Security Considerations

- No PII collected by Bonsai itself; GA4's privacy posture governs PII handling. GA4 anonymizes IP by default since 2023.
- UTM values are user-set, not personal.
- Inline script content is generated from user-controlled `measurementId` — sanitize? Hugo's template engine HTML-escapes by default; `measurementId` format is `G-XXXXXXXXX` (alphanumeric); injection risk is low but not zero. Add a build-time `warnf` if `measurementId` doesn't match `^G-[A-Z0-9]+$`.
- The async loader fetches `gtag.js` from `googletagmanager.com` — CSP must allow this host.
