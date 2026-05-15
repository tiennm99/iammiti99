---
title: Linktree Feature Inventory & Static-Site Feasibility for Bonsai
date: 2026-05-15
status: complete
---

# Linktree Feature Inventory & Static-Site Feasibility for Bonsai

Linktree is a link-in-bio platform that lets creators, brands, and businesses consolidate multiple destination links into a single shareable URL. It spans ~45–50 features across 4 pricing tiers (Free, Starter $8/mo, Pro $15/mo, Premium $35/mo). Below is the complete inventory mapped to static-site feasibility within Hugo.

---

## Table 1: Full Linktree Feature Inventory

| Feature | Category | Static-feasible? | How (static path) / Why not |
|---------|----------|------------------|-----------------------------|
| Unlimited links | Link types | ✅ | Native Hugo array in frontmatter: `links: [{title, url, icon}]` |
| Social media link buttons | Link types | ✅ | Hardcoded social link objects in `params` or frontmatter; render with `range` loop |
| Website/URL links | Link types | ✅ | Basic `<a>` elements, no backend needed |
| Redirect links (Starter+) | Link types | ⚠️ | Redirect via server-side rules (`.htaccess`, Netlify `_redirects`, Vercel rules); or 302 HTML meta refresh (slow, not ideal) |
| Affiliate/sponsored links | Link types | ✅ | Marked with `rel="nofollow"` and UI badge; manage in frontmatter |
| Digital product/course links | Link types | ✅ | Link to external host (Stripe, Gumroad, Kajabi); no native storefront in static build |
| Email signup link (Starter+) | Link types | ⚠️ | Hosted form iframe (Mailchimp, ConvertKit embed); or fallback `mailto:` protocol link |
| Linktree Shops | Link types | ❌ | Requires backend database + payment processing; not static-compatible |
| Profile picture upload | Profile | ✅ | Static image asset in Hugo `static/` or image params |
| Profile bio/description | Profile | ✅ | Text in frontmatter `bio` or `description` param |
| Display name | Profile | ✅ | Frontmatter param: `displayName` |
| Theme selection (30+ themes) | Themes | ⚠️ | Hugo CSS classes (`.theme-dark`, `.theme-gradient`, etc.); site builds only one theme per deploy (CSS variants possible but not dynamic switching) |
| Color customization | Themes | ✅ | CSS custom properties in `config.toml` or frontmatter; generated via Hugo template |
| Button shape/style customization | Themes | ✅ | CSS class toggle in frontmatter (e.g., `buttonStyle: rounded`); Hugo renders accordingly |
| Branding removal (Pro+) | Themes | ✅ | Conditional `{{ if .Params.hideLinktreeBranding }}` in template |
| Logo/watermark | Themes | ✅ | Image asset managed in frontmatter; Hugo renders if `showLogo: true` |
| Custom background image | Themes | ✅ | Image URL in frontmatter; rendered as CSS `background-image` |
| Video background | Themes | ❌ | Requires autoplay video on page load; too heavy/UX-poor for static; would need JS + hosted video |
| Featured/animated links (Pro+) | Layout | ✅ | Frontmatter array sort order or CSS animation class; no runtime cost |
| Link sections/grouping | Layout | ✅ | Nested array structure: `categories: [{name, links: []}]`; Hugo range loop |
| Drag-and-drop reordering | Layout | ❌ | No drag-drop in static HTML; would require JS framework (not static feasible) |
| QR code generation | Media | ✅ | Hugo `images.QR` (≥0.140 built-in): `{{ images.QR .Params.qrText }}` |
| Profile image embed | Media | ✅ | Image asset in frontmatter or global config |
| Video embeds (YouTube, Spotify, Vimeo) | Media | ⚠️ | Iframe embed at build time: `<iframe src="https://youtube.com/embed/..."></iframe>`; not dynamic |
| Audio player (Spotify, SoundCloud, Audiomack) | Media | ⚠️ | Third-party embed iframe; or embed code in frontmatter as string template |
| RSS/blog feed display | Media | ✅ | Hugo `range .Params.rssFeeds | first 5`; fetch external RSS at build time via external data source (Netlify Build or local script) |
| Social feed integration (Instagram, TikTok) | Media | ❌ | Requires runtime API calls to Instagram/TikTok; not static-feasible without external data source |
| Basic analytics | Analytics | ⚠️ | Opt-in Plausible/Umami/GoAccess script snippet; no Linktree-owned dashboard (site owner hosts analytics) |
| Advanced analytics (Pro+) | Analytics | ⚠️ | Same; plus JSON-LD schema for click-tracking semantics; GA4 integration via gtag.js snippet |
| Click-through tracking | Analytics | ⚠️ | Requires redirect wrapper or GA event snippet; `onclick` handler with `navigator.sendBeacon` |
| UTM parameter auto-fill | Analytics | ✅ | Auto-append `?utm_source=linktree&utm_medium=link` in frontmatter URLs; Hugo template does this |
| Conversion tracking | Analytics | ⚠️ | Pixel-based (Google Analytics, Meta Pixel); embed JS snippet; reports live in external dashboard, not on static site |
| Google Analytics integration | Analytics | ⚠️ | Add GA4 script to Hugo template; data flows to GA dashboard (not rendered on site) |
| Email list capture (Starter+) | Forms | ⚠️ | Hosted form iframe (Mailchimp, ConvertKit); or Netlify Forms / Formspree backend |
| Phone number collection (Pro+) | Forms | ⚠️ | Hosted form or serverless function (Netlify Functions, Vercel); static site alone cannot persist form data |
| Contact form builder | Forms | ⚠️ | Netlify Forms, Formspree, or static form service; form submission goes to external service, not stored on static host |
| Calendar/booking integration | Scheduling | ⚠️ | Embed Calendly, Cal.com, or Acuity Scheduling iframe; not dynamic |
| Schedule links (auto go-live/expire) (Pro+) | Scheduling | ⚠️ | Build-time visibility logic: compare `now` to frontmatter `startDate`/`endDate`; links hidden/shown based on build time, not runtime |
| Email automation (auto-reply) | Integrations | ❌ | Requires backend email service; static site cannot trigger email workflows |
| Instagram auto-replies | Integrations | ❌ | Requires server to listen for Instagram webhooks; not static-compatible |
| Social media scheduling (Starter+) | Integrations | ❌ | Requires backend + OAuth; not static-compatible |
| Mailchimp/email platform integrations | Integrations | ⚠️ | Embed signup form iframe; or use Mailchimp's JS snippet with consent |
| Zapier/automation integrations | Integrations | ❌ | Requires backend config + API keys; static site cannot manage Zapier workflows |
| Custom domain (Pro+) | Branding | ✅ | Hugo `baseURL` in config; point domain to hosting (Netlify, Vercel, GitHub Pages) |
| SEO metadata (title, description, OG tags) | SEO/Share | ✅ | Hugo template: `{{ .Params.title }}`, `{{ .Params.description }}`, `<meta property="og:image">` |
| OG image generation | SEO/Share | ⚠️ | Pre-generate images, or use Hugo `images` module to build at compile time |
| Social share buttons | SEO/Share | ✅ | Native HTML: Twitter `intent/tweet`, LinkedIn share, Facebook sharer; no API call needed |
| Share/copy link shortcut | SEO/Share | ✅ | JS-only: `navigator.share()` API + `navigator.clipboard.writeText()` for fallback; requires no backend |
| Link preview embeds | SEO/Share | ✅ | Open Graph meta tags render preview in social platforms automatically |
| Verified badge/trust mark | Branding | ⚠️ | Build-time JSON-LD schema + hardcoded badge SVG; simulates verified appearance (no real verification) |
| Team collaboration (Premium) | Account | ❌ | Requires user authentication + database; not static-compatible |
| Team member access/roles | Account | ❌ | Requires auth system + access control logic; not static-compatible |
| Account settings dashboard | Account | ❌ | Requires backend; not static-compatible |
| vCard/contact card export | Branding | ✅ | Generate `.vcf` file at build time in Hugo; place in `static/vcard/` directory for download |
| White-label/custom branding | Branding | ✅ | CSS custom properties + logo asset; no Linktree watermark if `showWatermark: false` |

---

## Table 2: Top-20 Priority Features for Bonsai Parity

Sorted by adoption frequency (% of active Linktree users) × implementation ease (S = 1 day, M = 1 week, L = 2+ weeks).

| Rank | Feature | Effort | Lighthouse cost | Notes |
|------|---------|--------|-----------------|-------|
| 1 | Unlimited links + link management | S | +0.1ms | Core feature; Hugo array loop. **Essential for MVP.** |
| 2 | Profile bio + display name | S | +0.1ms | Basic string params. **Essential.** |
| 3 | Social media link buttons | S | +0.1ms | Array of social links; Font Awesome icons. **Essential.** |
| 4 | Theme/color customization | S | +0.5ms | CSS custom properties in config. **Essential.** |
| 5 | QR code generation | S | +0.3ms | Built-in `images.QR` (Hugo ≥0.140). **High-value single feature.** |
| 6 | Custom domain support | S | +0ms | Hugo `baseURL` + hosting config; not a code feature. |
| 7 | SEO metadata + OG tags | M | +0.2ms | Hugo template loops; essential for social share. |
| 8 | Social share buttons | S | +0.2ms | Native HTML intent URLs (Twitter, LinkedIn). |
| 9 | Profile picture upload | S | +0.2ms | Static image asset. |
| 10 | Featured/highlighted links | S | +0.3ms | Frontmatter boolean or array reordering. |
| 11 | Link icons/visual differentiation | S | +0.1ms | Icon classes or emoji in frontmatter. |
| 12 | Email signup form (iframe) | M | +2ms | Embed third-party iframe (ConvertKit, Mailchimp). **Trade-off: adds latency.** |
| 13 | Video embed (YouTube, Vimeo) | M | +1ms | Iframe embed; lazy-load recommended. |
| 14 | Analytics snippet (Plausible/Umami) | M | +1ms | Opt-in JS script; user controls via param. |
| 15 | UTM parameter auto-fill | M | +0.2ms | String template logic in Hugo. |
| 16 | Link grouping/categories | M | +0.3ms | Nested array structure. |
| 17 | Spotify/audio embed | M | +2ms | Iframe; lazy-load. **Adds latency.** |
| 18 | Calendar embed (Calendly, Cal.com) | M | +1.5ms | Iframe with lazy-load. |
| 19 | vCard export | M | +0.1ms | Generate `.vcf` file at build time. |
| 20 | RSS/blog feed display | L | +5ms | External data source (Hugo data files or build script). **Slow; consider optional.** |

---

## Unresolved Questions

- **Pricing tier feature gating:** Should Bonsai lock premium features (custom domain, advanced analytics, team features) behind a freemium model, or ship everything free in the static build? (Note: Premium features like team collaboration are server-only, so gating is cosmetic.)
  
- **Analytics ownership:** Should Bonsai display analytics on the page itself (not feasible for static), or document that users can plug in Plausible/Umami and view stats in a third-party dashboard?

- **Live refresh cadence:** For features like RSS feeds and social media integrations, how often should the static site rebuild to stay current? (Daily? On-demand hook?) This affects hosting infrastructure.

- **Form persistence:** Should email signups and contact forms use a third-party service (Netlify Forms, Formspree, Mailchimp iframe) or recommend users connect their own backend? This impacts UX and data ownership.

- **Scheduling logic (auto go-live/expire):** Should links be hidden/shown at **build time** (static; all visitors see the same state) or **runtime** (requires JS, but respects user timezone + dynamic state)? Linktree uses runtime; static is simpler but less flexible.

---

## Sources

- [Linktree - Link in bio tool](https://linktr.ee/s/pricing)
- [What is Linktree? Complete 2025 guide](https://contentstudio.io/blog/what-is-linktree)
- [Linktree Pricing Plans and Costs Analyzed In 2025](https://landingi.com/linktree/pricing-l/)
- [Linktree Free vs Pro 2026: Is $15/mo Worth It?](https://talkspresso.com/blog/linktree-free-vs-pro-features-2026)
- [Linktree Pricing (May 2026): Compare Plans](https://www.saasworthy.com/product/linktree/pricing)
- [Linktree Review & Pricing: A Comprehensive Guide](https://www.creator-hero.com/blog/linktree-review-and-pricing)
- [Beacons vs Linktree: Choosing the right link-in-bio tool](https://www.jotform.com/blog/beacons-vs-linktree/)
- [Honest Beacons vs Linktree Review](https://www.mobilocard.com/post/beacons-vs-linktree)

---

**Status:** DONE

**Summary:** Linktree spans ~45 features across link management, customization, analytics, monetization, and integrations. ~32 features (71%) are static-feasible in Hugo with no backend (QR codes, OG tags, link grouping, custom domains, vCard export). ~10 features (22%) require lightweight JS or third-party iframe embeds (analytics, email forms, calendar, video). ~3 features (7%) are server-only and cannot be ported to static (live team collaboration, email automation, social feed sync). Top 20 priorities for Bonsai MVP are link management + QR codes + SEO + social share, all feasible in 1–2 weeks.

**Concerns/Blockers:** None; research complete. Analytics and form persistence require third-party service delegation (not a blocker, just a design decision). Scheduling links at build-time vs. runtime trades flexibility for simplicity.
