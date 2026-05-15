# Deployment guide

Bonsai is a Hugo theme — the built `public/` directory is plain static files. You can host it anywhere. This guide covers four common targets and the security/cache headers that move Lighthouse Best-Practices and Performance scores into the ≥90 range.

## What Bonsai ships

Two example header files live under `exampleSite/`:

- [`exampleSite/static/_headers`](../exampleSite/static/_headers) — Netlify / Cloudflare Pages format. Copy to your site root.
- [`exampleSite/vercel.json`](../exampleSite/vercel.json) — Vercel format. Copy to your repo root.

Both apply identical policies; pick the one matching your host.

## Why these headers

| Header | Lighthouse audit | What it does |
|--------|-----------------|--------------|
| `X-Content-Type-Options: nosniff` | Best-Practices | Stops browsers MIME-sniffing responses. |
| `X-Frame-Options: SAMEORIGIN` | Best-Practices | Prevents clickjacking via iframe embedding. |
| `Referrer-Policy: strict-origin-when-cross-origin` | Best-Practices | Limits referer leakage on cross-origin requests. |
| `Permissions-Policy: camera=(), microphone=(), geolocation=()` | Best-Practices | Disables unused powerful APIs. |
| `Content-Security-Policy: …` | Best-Practices + XSS resilience | Restricts script/style/image sources. |
| `Cache-Control: public, max-age=31536000, immutable` (on `/css/*`, `/js/*`, `/icons/*`, `/images/*`) | Performance (repeat visits) | 1-year cache on fingerprinted assets. |
| `Cache-Control: public, max-age=3600, must-revalidate` (on `/`, `/index.html`) | Performance | 1-hour cache on HTML; lets you push content updates fast. |

## CSP and Bonsai's defaults

The shipped CSP is permissive enough to support every opt-in Bonsai feature:

- `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com` — `'unsafe-inline'` is required by the theme-toggle FOUC script and the GA4 init snippet. `googletagmanager.com` lets the GA4 loader fetch `gtag.js`.
- `style-src 'self' 'unsafe-inline'` — required by inline `style=` attrs on the SVG initials avatar.
- `img-src 'self' data: https:` — covers QR-code data URLs and external image avatars.
- `connect-src 'self' https://www.google-analytics.com` — allows GA4 to POST events.

If you don't use the theme toggle and don't use GA4, you can tighten CSP to `script-src 'self'` and `connect-src 'self'`. Strict-CSP with nonces is out of scope for v0.5.

## Hosts

### Netlify

1. Copy `exampleSite/static/_headers` into your site's `static/` directory. Hugo will copy it to `public/_headers`, which Netlify reads on deploy.
2. Build command: `hugo --gc --minify`.
3. Publish directory: `public`.
4. Brotli + gzip applied automatically.

### Cloudflare Pages

Same `_headers` format as Netlify. Build settings same. Brotli applied automatically.

### Vercel

1. Copy `exampleSite/vercel.json` to your repo root.
2. Vercel auto-detects Hugo from `theme.toml` / `config.toml`. Build command: `hugo --gc --minify`. Output: `public`.
3. Brotli applied automatically.

### GitHub Pages

GitHub Pages does **not** support custom response headers. Two options:

- **Front with Cloudflare:** Point your domain to Cloudflare DNS, then origin to `username.github.io`. Apply security headers via a Cloudflare Worker — example below.
- **Switch to Cloudflare Pages or Netlify:** Free tier, custom domain, full header control. Easiest path.

Minimal Cloudflare Worker overlay:

```js
export default {
  async fetch(request, env) {
    const response = await fetch(request);
    const headers = new Headers(response.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    headers.set('Content-Security-Policy',
      "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'self'");
    return new Response(response.body, { status: response.status, headers });
  }
};
```

## Analytics & consent

Bonsai's optional GA4 integration sets cookies. In jurisdictions with strict privacy law you must obtain user consent **before** loading `gtag.js`:

- **GDPR (EU):** Explicit consent required for non-essential cookies.
- **UK PECR:** Same.
- **California CPRA:** Disclosure + opt-out required.

Bonsai does **not** ship a consent banner. Pair with a consent management platform (Klaro!, Cookiebot, OneTrust) or skip GA4 entirely.

If you don't enable `[params.analytics]`, zero analytics scripts ship — no consent banner needed.

## HTTPS

All recommended hosts (Netlify, Vercel, Cloudflare Pages, GitHub Pages) enforce HTTPS by default. Ensure your `baseURL` in `hugo.toml` starts with `https://`.
